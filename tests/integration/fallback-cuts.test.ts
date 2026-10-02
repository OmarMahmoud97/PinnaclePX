import * as z from 'zod'
import { fallbackBrief } from '@/lib/copy-slots/brief'
import { EDGE_COMPANIES } from '@/lib/preview/example'
import evalFixtures from '@/tests/fixtures/eval/fixtures.json'
import { contractFor, READY_TEMPLATES } from '@/templates/registry'

// When the model is refused, every design falls back to the visitor's own words, cut to fit by
// lib/copy-slots/fit.ts. A cut never stops on a joining word or a comma (decision 18,
// docs/template-fit-decisions.md): checked through every ready template's own fallback, over the
// frozen eval fixtures' first sentences and company names at the edge lengths. It lives here, not
// beside fit.ts, because lib/copy-slots may not import the templates.

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

// Whether a cut ends on a comma, or on a joining word once its closing marks are set aside.
function dangles(text: string): boolean {
  const end = text.trimEnd()
  const words = end.replace(/[.,;:!?]+$/, '').split(' ')
  return end.endsWith(',') || JOINING.has((words.at(-1) ?? '').toLowerCase())
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
