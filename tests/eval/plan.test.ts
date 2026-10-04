import { evalPageOf } from '@/app/dev/_render/eval-record'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { SlotPlan } from '@/lib/images/plan'
import {
  assignPictures,
  copyRunOf,
  copyTargets,
  maxUsdOf,
  namedPairs,
  namedTemplates,
  picksAfter,
  poolKeyOf,
  reusedFor,
  runLimited,
  spendStop,
  splitByRecord,
  trioOf,
} from './plan'
import { summarise } from './summary'

// The eval's limits, proved without a call (decision 10, docs/template-fit-decisions.md):
// EVAL_TEMPLATES writes copy for the named templates only, EVAL_PAIRS for the named pairs only
// and in their order, and EVAL_MAX_USD starts no fixture once the run's priced cost reaches the
// cap. A page EVAL_PAIRS writes outside a fixture's pick is set with the trio its record stores.

const KNOWN = ['t01-aurora', 't02-monolith', 't06-harbor', 't08-vector']
const CHOICES = [
  { id: 'joinery', templates: ['t01-aurora', 't06-harbor', 't08-vector'] },
  { id: 'a1-gas', templates: ['t01-aurora', 't02-monolith', 't06-harbor'] },
  { id: 'florist', templates: ['t02-monolith', 't08-vector', 't06-harbor'] },
  { id: 'cafe', templates: ['t01-aurora', 't06-harbor', 't03-meridian'] },
]

describe('EVAL_TEMPLATES', () => {
  it('reads the named ids, and nothing when unset or empty', () => {
    expect(namedTemplates('t02-monolith, t08-vector', KNOWN)).toEqual([
      't02-monolith',
      't08-vector',
    ])
    expect(namedTemplates(undefined, KNOWN)).toBeNull()
    expect(namedTemplates(' , ', KNOWN)).toBeNull()
  })

  it('stops on an id that names no template, so a typo cannot select nothing', () => {
    expect(() => namedTemplates('t02-monolith,t08-vectr', KNOWN)).toThrow('t08-vectr')
  })

  it('writes every chosen template when none is named', () => {
    expect(copyTargets(CHOICES, null)).toEqual(CHOICES)
  })

  it('writes only the named templates, on the fixtures they were chosen for', () => {
    expect(copyTargets(CHOICES, ['t02-monolith', 't08-vector'])).toEqual([
      { id: 'joinery', templates: ['t08-vector'] },
      { id: 'a1-gas', templates: ['t02-monolith'] },
      { id: 'florist', templates: ['t02-monolith', 't08-vector'] },
    ])
  })

  it('leaves out a fixture chosen none of them, and never writes an unchosen template', () => {
    const targets = copyTargets(CHOICES, ['t02-monolith'])
    expect(targets.map((t) => t.id)).toEqual(['a1-gas', 'florist'])
    expect(targets.flatMap((t) => t.templates)).toEqual(['t02-monolith', 't02-monolith'])
  })
})

describe('EVAL_PAIRS', () => {
  const FIXTURES = CHOICES.map((c) => c.id)
  const ALL = [...KNOWN, 't03-meridian', 't04-atlas']

  it('reads each fixture with its templates, in the order given, and nothing when unset or empty', () => {
    expect(
      namedPairs(' florist : t04-atlas + t01-aurora , joinery:t02-monolith', FIXTURES, ALL),
    ).toEqual([
      { id: 'florist', templates: ['t04-atlas', 't01-aurora'] },
      { id: 'joinery', templates: ['t02-monolith'] },
    ])
    expect(namedPairs(undefined, FIXTURES, ALL)).toBeNull()
    expect(namedPairs(' , ', FIXTURES, ALL)).toBeNull()
  })

  it('stops on an id that names no fixture or no template, so a typo cannot write another', () => {
    expect(() => namedPairs('florst:t04-atlas', FIXTURES, ALL)).toThrow('names no fixture: florst')
    expect(() => namedPairs('florist:t04-atlss', FIXTURES, ALL)).toThrow(
      'names no template: t04-atlss',
    )
    expect(() => namedPairs('florst:t04-atlss', FIXTURES, ALL)).toThrow(
      'EVAL_PAIRS names no fixture: florst; names no template: t04-atlss',
    )
  })

  it('stops on an entry that is not a fixture and its templates, and on a name given twice', () => {
    for (const bad of ['florist', 'florist:', ':t04-atlas', 'florist:t04-atlas:cafe']) {
      expect(() => namedPairs(bad, FIXTURES, ALL), bad).toThrow('is not <fixture>:<template>')
    }
    expect(() => namedPairs('cafe:t04-atlas,cafe:t08-vector', FIXTURES, ALL)).toThrow(
      'names cafe twice',
    )
    expect(() => namedPairs('cafe:t04-atlas+t04-atlas', FIXTURES, ALL)).toThrow(
      'names t04-atlas twice for cafe',
    )
  })

  it('runs its fixtures in its own order and writes templates the selector never chose', async () => {
    // The file's order is joinery, a1-gas, florist, cafe; the pairs run cafe first. Atlas was
    // chosen for none of them, so EVAL_TEMPLATES could never write it.
    const pairs = namedPairs('cafe:t04-atlas+t01-aurora,joinery:t04-atlas', FIXTURES, ALL) ?? []
    expect(copyTargets(CHOICES, ['t04-atlas'])).toEqual([])
    const started: string[] = []
    await runLimited(
      pairs,
      1,
      () => true,
      ({ id, templates }) => {
        started.push(`${id}:${templates.join('+')}`)
        return Promise.resolve()
      },
    )
    expect(started).toEqual(['cafe:t04-atlas+t01-aurora', 'joinery:t04-atlas'])
    const records = pairs.map((p) => ({ id: p.id, answers: {} as SubmissionAnswers }))
    const { kept } = splitByRecord(
      pairs.map((p) => ({ ...p, fixture: { id: p.id, answers: {} as SubmissionAnswers } })),
      records,
    )
    expect(kept.map((t) => t.id)).toEqual(['cafe', 'joinery'])
  })
})

describe('a page outside the pick', () => {
  const HERO = { queries: ['kitchen'], purpose: 'the main picture' }
  const DETAIL = { queries: ['oak', 'tools'], purpose: 'a supporting picture' }
  const ORDER = new Map([
    [poolKeyOf(HERO), [1, 2, 3]],
    [poolKeyOf(DETAIL), [10, 11, 12, 13]],
  ])
  const orderOf = (key: string) => ORDER.get(key) ?? []
  const search = (pool: { queries: string[]; purpose: string }, union = true): SlotPlan => ({
    kind: 'search',
    ...pool,
    union,
  })
  // A design with a hero and this many detail slots.
  const design = (id: string, details: number) => ({
    id,
    plan: Object.fromEntries<SlotPlan>([
      ['hero', search(HERO, false)],
      ...Array.from({ length: details }, (_, i): [string, SlotPlan] => [
        `detail-${String(i + 1)}`,
        search(DETAIL),
      ]),
    ]),
  })

  it('is set with the pick’s first two, then itself', () => {
    expect(trioOf(['t06-harbor', 't05-ember', 't01-aurora'], 't08-vector')).toEqual([
      't06-harbor',
      't05-ember',
      't08-vector',
    ])
  })

  it('takes its pictures after the first two’s, as a full replay of the trio would', () => {
    const [a, b, c, x] = [design('a', 2), design('b', 1), design('c', 1), design('x', 2)]
    const pick = assignPictures([a, b, c], orderOf)
    expect(pick.assignment).toEqual({
      a: { hero: 1, 'detail-1': 10, 'detail-2': 11 },
      b: { hero: 2, 'detail-1': 12 },
      c: { hero: 3, 'detail-1': 13 },
    })
    // c is not before it in the trio, so c's pictures are free to it; with every detail picture
    // taken, its second detail slot shares the best one it has not shown.
    const extra = picksAfter({ a: pick.assignment.a ?? {}, b: pick.assignment.b ?? {} }, x, orderOf)
    expect(extra).toEqual({ hero: 3, 'detail-1': 13, 'detail-2': 10 })
    expect(assignPictures([a, b, x], orderOf).assignment.x).toEqual(extra)
  })

  it('keeps the rule the pick was always chosen by: unshown, then shared, then empty', () => {
    const one = { queries: ['one'], purpose: 'one picture' }
    const plans = [
      {
        id: 'a',
        plan: {
          hero: { kind: 'own', url: 'http://localhost/own.jpg', alt: '' } as const,
          first: search(one),
          second: search(one),
        },
      },
      {
        id: 'b',
        plan: {
          first: search(one),
          unfound: search({ queries: ['none'], purpose: 'nothing found' }),
          free: { kind: 'none' } as const,
        },
      },
    ]
    expect(assignPictures(plans, (key) => (key === poolKeyOf(one) ? [7] : []))).toEqual({
      assignment: {
        a: { hero: null, first: 7, second: null },
        b: { first: 7, unfound: null, free: null },
      },
      empty: 2,
      repeated: 1,
    })
  })

  it('is served by /dev/eval with its trio, and a template neither chosen nor extra is a 404', () => {
    const written = (final: string, fallback = false) => ({ final, fallback })
    const record = {
      templates: ['t06-harbor', 't05-ember', 't01-aurora'],
      copy: {
        't01-aurora': written('aurora', true),
        't08-vector': written('vector'),
        't04-atlas': written('atlas'),
      },
      extra: { 't08-vector': { chosen: ['t06-harbor', 't05-ember', 't08-vector'] } },
    }
    expect(evalPageOf(record, 't01-aurora')).toEqual({
      written: written('aurora', true),
      chosen: record.templates,
    })
    expect(evalPageOf(record, 't08-vector')).toEqual({
      written: written('vector'),
      chosen: ['t06-harbor', 't05-ember', 't08-vector'],
    })
    // Chosen but not written in this run; written but neither chosen nor an extra; neither.
    expect(evalPageOf(record, 't06-harbor')).toBeNull()
    expect(evalPageOf(record, 't04-atlas')).toBeNull()
    expect(evalPageOf(record, 't03-meridian')).toBeNull()
    expect(evalPageOf(record, 'constructor')).toBeNull()
    expect(evalPageOf({ ...record, extra: undefined }, 't08-vector')).toBeNull()
  })
})

describe('EVAL_MAX_USD', () => {
  it('reads dollars, nothing when unset, and stops on anything else', () => {
    expect(maxUsdOf('1.78')).toBe(1.78)
    expect(maxUsdOf(undefined)).toBeNull()
    expect(maxUsdOf('')).toBeNull()
    expect(() => maxUsdOf('0')).toThrow('positive')
    expect(() => maxUsdOf('-1')).toThrow('positive')
    expect(() => maxUsdOf('a dollar')).toThrow('positive')
  })

  it('lets fixtures start until the priced cost reaches the cap', () => {
    const stop = spendStop(1)
    expect(stop.mayStart()).toBe(true)
    stop.add(0.6)
    expect(stop.mayStart()).toBe(true)
    stop.add(0.4)
    expect(stop.spent()).toBeCloseTo(1, 9)
    expect(stop.mayStart()).toBe(false)
  })

  it('never stops without a cap, and stops on a cost it cannot price', () => {
    const open = spendStop(null)
    open.add(1_000)
    expect(open.mayStart()).toBe(true)
    const capped = spendStop(1)
    capped.add(Number.NaN)
    expect(capped.mayStart()).toBe(false)
  })

  it('starts nothing new once reached, and lets the fixtures in flight finish', async () => {
    // Six fixtures at $0.40 each, two at a time, the cost noted call by call as the eval notes
    // it: two calls of $0.20, the second after a pause.
    const stop = spendStop(1)
    const finished: string[] = []
    const fixtures = ['a', 'b', 'c', 'd', 'e', 'f']
    const { results, notStarted } = await runLimited(fixtures, 2, stop.mayStart, async (id) => {
      stop.add(0.2)
      await new Promise((resolve) => setTimeout(resolve, 5))
      stop.add(0.2)
      finished.push(id)
      return id
    })
    // a and b start at $0 and $0.20. a finishes at $0.60 and c starts; b finishes at $1.00, so
    // d, e and f never start; c, already in flight, finishes at $1.20, past the cap.
    expect(results).toEqual(['a', 'b', 'c'])
    expect(finished).toEqual(['a', 'b', 'c'])
    expect(notStarted).toEqual(['d', 'e', 'f'])
    expect(stop.spent()).toBeCloseTo(1.2, 9)
  })

  it('passes the cap by up to the fixtures in flight, and no further', async () => {
    // Two fixtures start together and each costs $0.90, $0.50 of it at once: the cap is
    // reached while both are in flight, both finish, so the run spends $1.80 against a $1.00
    // cap, and the third never starts.
    const stop = spendStop(1)
    const { notStarted } = await runLimited(['a', 'b', 'c'], 2, stop.mayStart, async (id) => {
      stop.add(0.5)
      await new Promise((resolve) => setTimeout(resolve, 5))
      stop.add(0.4)
      return id
    })
    expect(notStarted).toEqual(['c'])
    expect(stop.spent()).toBeCloseTo(1.8, 9)
  })
})

describe('the summary of a limited run', () => {
  it('names the templates, the cap, the spend, what never started and the overrun', () => {
    const { markdown } = summarise('stopped', [], {
      templates: ['t06-harbor'],
      maxUsd: 0.56,
      spent: 0.61,
      concurrency: 2,
      notStarted: ['cafe', 'hr'],
    })
    expect(markdown).toContain('Copy written for EVAL_TEMPLATES only: t06-harbor.')
    expect(markdown).toContain(
      'Spend stop: EVAL_MAX_USD $0.5600, reached; this run spent $0.6100; 2 fixtures not started (cafe, hr).',
    )
    expect(markdown).toContain('can pass its cap by the cost of up to 2 fixtures')
  })

  it('says when a run had no stop, or recorded none', () => {
    const open = { templates: null, maxUsd: null, spent: 0.2, concurrency: 2, notStarted: [] }
    expect(summarise('open', [], open).markdown).toContain(
      'Spend stop: none (EVAL_MAX_USD unset). This run spent $0.2000.',
    )
    expect(summarise('old', []).markdown).toContain('Spend stop: none recorded')
  })

  it('names the fixtures set aside for want of a record to build on', () => {
    const { markdown } = summarise('pass-1', [], {
      templates: ['t02-monolith', 't08-vector'],
      maxUsd: 0.65,
      spent: 0.5,
      concurrency: 2,
      notStarted: [],
      noRecord: ['app-pharmacy', 'no-trade'],
    })
    expect(markdown).toContain(
      'Not run, with no record in the reused run to build on: app-pharmacy, no-trade.',
    )
  })

  it('names the pairs of an EVAL_PAIRS run, in their order', () => {
    const { markdown } = summarise('pass4-cells', [], {
      templates: null,
      pairs: { hr: ['t01-aurora', 't08-vector'], florist: ['t03-meridian'] },
      maxUsd: 0.45,
      spent: 0.43,
      concurrency: 1,
      notStarted: [],
    })
    expect(markdown).toContain(
      'Copy for EVAL_PAIRS only, in this order: hr (t01-aurora, t08-vector), florist (t03-meridian).',
    )
  })
})

describe('reusing a stored run', () => {
  const photo = (n: number) => ({
    fileName: `own-${String(n)}.jpg`,
    url: `http://localhost:3100/dev/photo/own-${String(n)}.jpg`,
  })
  const pottery = (photos: number): SubmissionAnswers => ({
    description: 'Hand-thrown mugs, bowls and planters made in our Hebden Bridge studio.',
    company: 'Weir Lane Pottery',
    logo: { kind: 'wordmark' },
    imagery: { style: 'warm', photos: Array.from({ length: photos }, (_, i) => photo(i + 1)) },
    colours: { kind: 'palette', paletteId: 'clay' },
  })
  const stored = [
    { id: 'joinery', answers: { ...pottery(0), company: 'Hollin Lane Joinery' } },
    { id: 'own-photos-1', answers: pottery(1) },
  ]

  it('takes the fixture’s own record first', () => {
    expect(reusedFor({ id: 'own-photos-1', answers: pottery(1) }, stored)?.id).toBe('own-photos-1')
  })

  it('takes a variant of the same business with other photographs when it has none', () => {
    // Decision 11: the 3- and 6-photograph variants share the 1-photograph variant's copy run.
    expect(reusedFor({ id: 'own-photos-6', answers: pottery(6) }, stored)?.id).toBe('own-photos-1')
  })

  it('takes nothing for another business', () => {
    const other = { ...pottery(3), company: 'Weir Lane Ceramics' }
    expect(reusedFor({ id: 'own-photos-3', answers: other }, stored)).toBeNull()
  })

  it('sets aside, before any call, the fixtures the reused run cannot carry', () => {
    // Pass 1 on l6: a new fixture has no record there, a photograph variant has its sibling's.
    const fixture = (id: string, answers: SubmissionAnswers) => ({
      id,
      templates: ['t02-monolith'],
      fixture: { id, answers },
    })
    const pharmacy = { ...pottery(0), company: 'Benchrota' }
    const targets = [
      fixture('joinery', stored[0]?.answers ?? pottery(0)),
      fixture('app-pharmacy', pharmacy),
      fixture('own-photos-6', pottery(6)),
    ]
    const { kept, dropped } = splitByRecord(targets, stored)
    expect(kept.map((t) => t.id)).toEqual(['joinery', 'own-photos-6'])
    expect(dropped.map((t) => t.id)).toEqual(['app-pharmacy'])
  })

  it('gives a photograph variant the copy run of the first of its business', () => {
    const runs = copyRunOf([
      { id: 'joinery', answers: { ...pottery(0), company: 'Hollin Lane Joinery' } },
      { id: 'own-photos-1', answers: pottery(1) },
      { id: 'own-photos-3', answers: pottery(3) },
      { id: 'own-photos-6', answers: pottery(6) },
    ])
    expect(Object.fromEntries(runs)).toEqual({
      joinery: 'joinery',
      'own-photos-1': 'own-photos-1',
      'own-photos-3': 'own-photos-1',
      'own-photos-6': 'own-photos-1',
    })
  })
})
