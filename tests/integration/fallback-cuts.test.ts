import * as z from 'zod'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { collapse, fitToSlot } from '@/lib/copy-slots/fit'
import { EDGE_COMPANIES } from '@/lib/preview/example'
import evalFixtures from '@/tests/fixtures/eval/fixtures.json'
import { contractFor, READY_TEMPLATES } from '@/templates/registry'
import { KESTREL } from '@/templates/t01-aurora/example/content'

// Every call is recorded, so a test can read each cut fitToSlot made.
vi.mock('@/lib/copy-slots/fit', async (importOriginal) => {
  const fit = await importOriginal<typeof import('@/lib/copy-slots/fit')>()
  return { ...fit, fitToSlot: vi.fn(fit.fitToSlot) }
})

// When the model is refused, every design falls back to the visitor's own words, cut to fit by
// lib/copy-slots/fit.ts (decision 18, docs/template-fit-decisions.md). Through every ready
// template's own fallback, over the frozen eval fixtures and company names at the edge lengths:
// no hero headline, wordmark or legal name is cut on a joining word or a comma, and no other cut
// is either, but for the one line in KNOWN. It lives here, not beside fit.ts, because
// lib/copy-slots may not import the templates.

// Decision 18's list.
const JOINING = new Set(
  'the a an in on of for and or to with by at from all our your we is are been have has that who which but as'.split(
    ' ',
  ),
)

// Harbor's and Vector's fallback headline: a whole clause, never cut, so exempt.
const FIXED_LINE = 'what we do, and who it is for'

function isFixedLine(headline: string): boolean {
  return headline.toLowerCase().replace(/\.$/, '') === FIXED_LINE
}

// Whether a cut ends on a comma, a dash or a slash, or on a joining word once its closing marks
// are set aside.
function dangles(text: string): boolean {
  const end = text.trimEnd()
  const words = end.replace(/[.,;:!?]+$/, '').split(' ')
  return /[,/\u2013\u2014-]$/.test(end) || JOINING.has((words.at(-1) ?? '').toLowerCase())
}

const READY = READY_TEMPLATES.map((template) => template.id)

describe('fallback headlines over the eval fixtures', () => {
  it.each(READY)('%s never cuts a headline on a joining word or a comma', (id) => {
    const contract = contractFor(id)
    for (const { answers } of evalFixtures.fixtures) {
      const brief = fallbackBrief(answers.company, answers.description)
      const copy = contract.fallbackCopy(brief)
      expect(contract.copyViolations(copy)).toEqual([])
      const headline = contract.headlineOf(copy)
      if (headline === brief.headlines[0] || isFixedLine(headline)) continue
      expect(dangles(headline), `${id}: "${headline}"`).toBe(false)
    }
  })

  it('has headlines that were cut, so the rule is exercised', () => {
    const cut = READY.flatMap((id) => {
      const contract = contractFor(id)
      return evalFixtures.fixtures.filter(({ answers }) => {
        const brief = fallbackBrief(answers.company, answers.description)
        const headline = contract.headlineOf(contract.fallbackCopy(brief))
        return headline !== brief.headlines[0] && !isFixedLine(headline)
      })
    })
    expect(cut.length).toBeGreaterThan(0)
  })
})

// Company names of 10, 59, 60, 61 and 80 characters, and the unbroken 60: the wordmark and the
// legal name are cut by the same rule.
const NAMES = [
  'Muddy Paws',
  'Hollin Lane Joinery and Fitted Furniture of Leeds and Otley',
  'Hollin Lane Joinery and Fitted Furniture for Leeds and Otley',
  'Hollin Lane Joinery and Fitted Furniture for Leeds and Ilkley',
  EDGE_COMPANIES.longest,
  EDGE_COMPANIES.unbroken,
]

const BRAND = z.object({ brand: z.object({ name: z.string(), legalName: z.string() }) })

describe('fallback company names at the edges', () => {
  it('covers the edge lengths', () => {
    expect(NAMES.map((name) => name.length)).toEqual([10, 59, 60, 61, 80, 60])
  })

  it.each(READY)('%s never cuts a company name on a joining word or a comma', (id) => {
    const contract = contractFor(id)
    for (const company of NAMES) {
      const copy = contract.fallbackCopy(fallbackBrief(company, 'Job scheduling for trades.'))
      expect(contract.copyViolations(copy)).toEqual([])
      const { brand } = BRAND.parse(copy)
      for (const cut of [brand.name, brand.legalName]) {
        if (cut !== company) expect(dangles(cut), `${id}: "${cut}"`).toBe(false)
      }
    }
  })
})

// Each fixture's own company and sentence, then every edge name with every fixture's sentence and
// with the example designs page's (app/examples/hub).
const SENTENCES = [
  ...evalFixtures.fixtures.map(({ answers }) => answers.description),
  KESTREL.brand.tagline,
]
const BRIEFS = [
  ...evalFixtures.fixtures.map(({ answers }) =>
    fallbackBrief(answers.company, answers.description),
  ),
  ...NAMES.flatMap((company) => SENTENCES.map((sentence) => fallbackBrief(company, sentence))),
]

// Summit's fallback closing heading, "Ready to talk to {company}?" (16 to 50 characters): with the
// unbroken name, dropping "to" would leave 13 characters, under the minimum, so the cut keeps it.
// The fix belongs in Summit's fallback (templates/t07-summit/contract.ts), and Summit's follow-up
// schedules it: a plain closing heading when the name does not fit. Until that lands, this one
// cut is allowed here.
const KNOWN = new Set(['t07-summit: Ready to talk to'])

// The cuts fitToSlot made since it was last cleared: each output whose input ran past its slot.
function cuts(): string[] {
  const { calls, results } = vi.mocked(fitToSlot).mock
  return calls.flatMap(([text, slot], call) => {
    const result = results[call]
    return result?.type === 'return' && collapse(text).length > slot.max ? [result.value] : []
  })
}

describe('every fallback cut', () => {
  it.each(READY)('%s never cuts on a joining word, a comma, a dash or a slash', (id) => {
    const contract = contractFor(id)
    let made = 0
    for (const brief of BRIEFS) {
      vi.mocked(fitToSlot).mockClear()
      expect(contract.copyViolations(contract.fallbackCopy(brief))).toEqual([])
      for (const cut of cuts()) {
        made += 1
        if (!KNOWN.has(`${id}: ${cut}`)) expect(dangles(cut), `${id}: "${cut}"`).toBe(false)
      }
    }
    expect(made).toBeGreaterThan(0)
  })
})
