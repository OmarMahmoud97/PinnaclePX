import { copyTargets, maxUsdOf, namedTemplates, runLimited, spendStop } from './plan'
import { summarise } from './summary'

// The eval's two limits, proved without a call (decision 10, docs/template-fit-decisions.md):
// EVAL_TEMPLATES writes copy for the named templates only, and EVAL_MAX_USD starts no fixture
// once the run's priced cost reaches the cap.

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
})
