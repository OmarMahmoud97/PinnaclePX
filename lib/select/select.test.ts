import { CONFIG } from '@/lib/config'
import type { TemplateMeta } from '@/lib/copy-slots/template-meta'
import { mulberry32, seedFrom, shuffle } from '@/lib/select/prng'
import { conceptCountFor, readyForTraffic, selectTemplates } from '@/lib/select/select'

function template(id: string, tones: string[], polarity: TemplateMeta['polarity'] = 'either') {
  return { id, name: id, description: '', ready: true, polarity, tones } satisfies TemplateMeta
}

const TEN: TemplateMeta[] = [
  template('t01', ['luminous', 'product']),
  template('t02', ['heavy', 'editorial'], 'light-artwork'),
  template('t03', ['calm', 'editorial']),
  template('t04', ['bold', 'product'], 'dark-artwork'),
  template('t05', ['warm', 'craft']),
  template('t06', ['calm', 'craft']),
  template('t07', ['bold', 'sport']),
  template('t08', ['technical', 'product']),
  template('t09', ['soft', 'craft']),
  template('t10', ['luminous', 'playful']),
]
const NONE = new Set<string>()
const BASE = { candidates: TEN, seen: NONE, polarity: 'mixed' as const, count: 3, seed: 'abc' }

describe('conceptCountFor', () => {
  it('is the configured count, or fewer while fewer templates are ready', () => {
    expect(conceptCountFor(10)).toBe(CONFIG.templates.conceptsShown)
    expect(conceptCountFor(1)).toBe(1)
    expect(conceptCountFor(0)).toBe(0)
  })

  it('lets the page take traffic only once the promised number of templates are ready', () => {
    expect(readyForTraffic(CONFIG.templates.conceptsShown)).toBe(true)
    expect(readyForTraffic(10)).toBe(true)
    expect(readyForTraffic(CONFIG.templates.conceptsShown - 1)).toBe(false)
    expect(readyForTraffic(0)).toBe(false)
  })
})

describe('prng', () => {
  it('shuffles the same way for the same seed and differently for another', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8]
    expect(shuffle(items, mulberry32(seedFrom('x')))).toEqual(
      shuffle(items, mulberry32(seedFrom('x'))),
    )
    expect(shuffle(items, mulberry32(seedFrom('x')))).not.toEqual(
      shuffle(items, mulberry32(seedFrom('y'))),
    )
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('selectTemplates', () => {
  it('gives the same templates for the same seed', () => {
    expect(selectTemplates(BASE)).toEqual(selectTemplates(BASE))
    expect(selectTemplates(BASE)).toHaveLength(3)
  })

  it('never picks a template the identity has seen or one that is not ready', () => {
    const seen = new Set(['t01', 't03', 't05', 't07', 't09'])
    const candidates = [...TEN, { ...template('t11', ['x']), ready: false }]
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const chosen = selectTemplates({ ...BASE, candidates, seen, seed })
      expect(chosen).toHaveLength(3)
      for (const id of chosen) {
        expect(seen.has(id)).toBe(false)
        expect(id).not.toBe('t11')
      }
    }
  })

  it('honours the logo polarity', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      expect(selectTemplates({ ...BASE, polarity: 'dark-artwork', seed })).not.toContain('t02')
      expect(selectTemplates({ ...BASE, polarity: 'light-artwork', seed })).not.toContain('t04')
    }
    expect(selectTemplates({ ...BASE, candidates: TEN.slice(1, 2), count: 1 })).toEqual(['t02'])
  })

  it('prefers templates whose tones are all new', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const chosen = selectTemplates({ ...BASE, seed })
      const tones = chosen.flatMap((id) => TEN.find((t) => t.id === id)?.tones ?? [])
      expect(new Set(tones).size).toBe(tones.length)
    }
  })

  it('returns nothing when fewer than the count remain, which is the book-a-call state', () => {
    const seen = new Set(TEN.slice(0, 8).map((t) => t.id))
    expect(selectTemplates({ ...BASE, seen })).toEqual([])
    expect(selectTemplates({ ...BASE, seen, count: 2 })).toHaveLength(2)
    expect(selectTemplates({ ...BASE, count: 0 })).toEqual([])
  })

  it('builds one concept from one ready template', () => {
    expect(selectTemplates({ ...BASE, candidates: TEN.slice(0, 1), count: 1 })).toEqual(['t01'])
    expect(
      selectTemplates({ ...BASE, candidates: TEN.slice(0, 1), seen: new Set(['t01']), count: 1 }),
    ).toEqual([])
  })
})
