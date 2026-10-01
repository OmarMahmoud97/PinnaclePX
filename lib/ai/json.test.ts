import * as z from 'zod'
import { extractJson, parseJsonAnswer, skeletonOf } from '@/lib/ai/json'
import { contractFor } from '@/templates/registry'

const schema = z.object({
  title: z.string(),
  items: z.array(z.object({ label: z.string(), target: z.enum(['a', 'b']) })),
  note: z.string().nullable(),
  count: z.number(),
})

describe('skeletonOf', () => {
  it('shows every key with empty strings and one-item lists, nullable as its value', () => {
    expect(JSON.parse(skeletonOf(schema))).toEqual({
      title: '',
      items: [{ label: '', target: '' }],
      note: '',
      count: 0,
    })
  })

  it('is a value of the shape for every template, once the strings are filled', () => {
    for (const copySchema of [
      contractFor('t01-aurora').copySchema,
      contractFor('t06-harbor').copySchema,
    ]) {
      const filled = JSON.parse(skeletonOf(copySchema).replace(/""/g, '"x"')) as unknown
      // Enum targets fail on "x" and nothing else does: the shape itself is right.
      const result = copySchema.safeParse(filled)
      const reasons = result.success ? [] : result.error.issues.map((issue) => issue.code)
      expect(new Set(reasons)).toEqual(result.success ? new Set() : new Set(['invalid_value']))
    }
  })

  it('is far shorter than the JSON schema it stands for', () => {
    const harbor = contractFor('t06-harbor').copySchema
    const skeleton = skeletonOf(harbor).length
    const jsonSchema = JSON.stringify(z.toJSONSchema(harbor)).length
    expect(skeleton * 3).toBeLessThan(jsonSchema)
  })
})

describe('extractJson', () => {
  it('reads the object out of a fenced or chatty answer', () => {
    expect(extractJson('Here it is:\n```json\n{"a": 1}\n```\nDone.')).toEqual({ a: 1 })
  })

  it('throws when there is no object', () => {
    expect(() => extractJson('nothing here')).toThrow(SyntaxError)
  })
})

describe('parseJsonAnswer', () => {
  it('returns the value when the shape fits', () => {
    const text = '{"title":"T","items":[{"label":"L","target":"a"}],"note":null,"count":2}'
    const result = parseJsonAnswer(text, schema)
    expect(result.ok && result.value.items[0]?.target).toBe('a')
  })

  it('names each miss in the answer’s own paths', () => {
    const text = '{"title":"T","items":[{"label":"L","target":"zzz"}],"count":"two"}'
    const result = parseJsonAnswer(text, schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason.map((v) => v.path)).toEqual(['items[0].target', 'note', 'count'])
    expect(result.reason[0]?.reason).toMatch(/^the wrong shape: /)
  })

  it('reports text that is not JSON as one violation', () => {
    const result = parseJsonAnswer('Sorry, I cannot.', schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toHaveLength(1)
    expect(result.reason[0]?.reason).toMatch(/^the answer was not JSON/)
  })
})
