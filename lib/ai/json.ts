import * as z from 'zod'
import type { CopyViolation } from '@/lib/copy-slots/rules'
import { err, ok, type Result } from '@/lib/errors'

// The shape of an answer, shown to the model as a JSON value with every string empty and every
// list one item long, and checked afterwards with the schema itself. Structured outputs compile
// a schema into a grammar, and the API refuses the grammar of five of the eight ready templates
// as too large (measured 1 October 2026, docs/pipeline-quality-plan.md), so the copy call gives
// the model this skeleton instead of the schema. It is also a third of the schema's size.

type JsonSchema = Readonly<{
  type?: string | readonly string[]
  properties?: Readonly<Record<string, JsonSchema>>
  items?: JsonSchema
  anyOf?: readonly JsonSchema[]
}>

export function skeletonOf(schema: z.ZodType): string {
  return JSON.stringify(skeleton(z.toJSONSchema(schema) as JsonSchema))
}

function skeleton(node: JsonSchema): unknown {
  const types: readonly string[] = typeof node.type === 'string' ? [node.type] : (node.type ?? [])
  const type = types.find((t) => t !== 'null') ?? (node.anyOf === undefined ? 'null' : 'anyOf')
  switch (type) {
    case 'object':
      return Object.fromEntries(
        Object.entries(node.properties ?? {}).map(([key, value]) => [key, skeleton(value)]),
      )
    case 'array':
      return [node.items === undefined ? '' : skeleton(node.items)]
    case 'string':
      return ''
    case 'number':
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'anyOf': {
      const branch = node.anyOf?.find((candidate) => candidate.type !== 'null')
      return branch === undefined ? null : skeleton(branch)
    }
    default:
      return null
  }
}

// The JSON object in a model's text: what sits between the first brace and the last, so a code
// fence or a stray sentence around the answer does not lose it. Throws when there is none.
export function extractJson(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new SyntaxError('no JSON object in the answer')
  return JSON.parse(text.slice(start, end + 1)) as unknown
}

// An answer's text as a value of the schema, or every way it misses the shape, as violations
// the retry prompt can send back: the path in the answer's own terms and what was wrong there.
export function parseJsonAnswer<T>(
  text: string,
  schema: z.ZodType<T>,
): Result<T, readonly CopyViolation[]> {
  let value: unknown
  try {
    value = extractJson(text)
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unreadable'
    return err([{ path: '', reason: `the answer was not JSON: ${reason}` }])
  }
  const parsed = schema.safeParse(value)
  if (parsed.success) return ok(parsed.data)
  return err(
    parsed.error.issues.slice(0, 20).map((issue) => ({
      path: issue.path
        .map((part) => (typeof part === 'number' ? `[${String(part)}]` : String(part)))
        .join('.')
        .replace(/\.\[/g, '['),
      reason: `the wrong shape: ${issue.message}`,
    })),
  )
}
