import * as z from 'zod'
import { type SubmissionAnswers, submissionAnswersSchema } from '@/lib/brief/submission'
import type { TemplateContract } from '@/lib/copy-slots/contract'

// The committed copy corpus (tests/fixtures/template-copy/<templateId>/<name>.json): stored model
// answers for invented test businesses, and synthetic answers at the limits of the check
// standard (decisions 9 and 19, docs/template-fit-decisions.md). The development route
// app/dev/copy renders one as a visitor's page, the text-fit spec
// (e2e/reduced-motion-template-fit.spec.ts) and the checks (scripts/checks) measure them, and
// corpus.test.ts holds the files to this shape and writes them.

export const corpusFileSchema = z.object({
  // Where the answer came from: a stored eval run and fixture, or how it was made.
  source: z.string().min(1),
  answers: submissionAnswersSchema,
  // The templates the fixture was chosen; the tokens are solved over all their pairs.
  chosen: z.array(z.string()).min(1),
  ctaLabel: z.string(),
  copy: z.unknown(),
})

export type CorpusFile = z.infer<typeof corpusFileSchema>

// What the checks expect of a template on main (tests/fixtures/template-copy/<templateId>/
// _expected.json), which the template's own pull request edits as it fixes it: the CI text-fit
// guard's cases expected to fail and those skipped, with why, and the accessible-names check's
// outline, each block by its address (alternatives after a comma) and the level it opens with.
export const expectedFileSchema = z.object({
  note: z.string(),
  fixedBy: z.string().min(1),
  textFit: z.object({
    failing: z.array(z.string()),
    unsettled: z.record(z.string(), z.string().min(1)),
  }),
  outline: z.array(z.tuple([z.string().min(1), z.number().int().min(1).max(6)])),
})

// The long real words found in stored headlines and briefs, longest first (the check standard).
const LONG_WORDS = [
  'STRAIGHTFORWARD',
  'NORTHUMBERLAND',
  'PHYSIOTHERAPY',
  'KNARESBOROUGH',
  'CONVEYANCING',
  'ARCHITECTURE',
  'ACCOUNTANCY',
] as const

// Business names of 10, 16, 40, 60 and 80 characters. The 60 has no break opportunity and the
// 80 is the longest the form takes (lib/preview/example.ts, EDGE_COMPANIES). Each reaches a page
// through the brand slots, cut to each slot's limit at a word (syntheticFrom).
export const NAMES = {
  'name-10': 'Hollin Oak',
  'name-16': 'Bramble and Bean',
  'name-40': 'Northgate People and Payroll Consultancy',
  'name-60': 'AshgrovePhysiotherapyAndSportsInjuryClinicsSheffieldAndLeeds',
  'name-80': 'Ashgrove Physio and Sport Clinic for all the Runners, Riders and Walkers of Hull',
} as const

// The words that fill a slot to its longest: plain ones of ordinary length, no digits.
const FILLER =
  'Plain words fill this space to the longest length it allows so every line shows how far the layout stretches before it gives'.split(
    ' ',
  )

type Path = readonly (string | number)[]

function leavesOf(value: unknown, path: Path = []): { path: Path; value: string }[] {
  if (typeof value === 'string') return [{ path, value }]
  if (Array.isArray(value)) return value.flatMap((item, index) => leavesOf(item, [...path, index]))
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => leavesOf(item, [...path, key]))
  }
  return []
}

// The list at a violation's path (benefits.items), or null where the path names a text or
// nothing.
function listAt(root: unknown, path: string): unknown[] | null {
  let node = root
  for (const part of path.split('.')) {
    if (node === null || typeof node !== 'object') return null
    node = (node as Record<string, unknown>)[part]
  }
  return Array.isArray(node) ? node : null
}

function setAt(root: unknown, path: Path, value: string): void {
  let node = root as Record<string | number, unknown>
  for (const part of path.slice(0, -1)) node = node[part] as Record<string | number, unknown>
  const last = path.at(-1)
  if (last !== undefined) node[last] = value
}

// A text slot's longest allowed length, as the template's own judge says: the slot set far past
// any limit, and the limit its violation reports. Null for a slot with no limit, or one that
// takes only set values (a link's target).
function maxOf(contract: TemplateContract, copy: unknown, path: Path): number | null {
  const probe = structuredClone(copy)
  setAt(probe, path, 'x'.repeat(400))
  try {
    return contract.copyViolations(probe).find((v) => v.length === 400)?.max ?? null
  } catch {
    return null
  }
}

// A slot filled to its longest. Each slot starts a word further on, so the items of a list
// differ, as a visitor's do (a template keys its lists by their text).
function filled(max: number, start: number): string {
  let text = ''
  for (let i = start; text.length < max; i += 1) {
    text = `${text}${text === '' ? '' : ' '}${FILLER[i % FILLER.length] ?? ''}`
  }
  const cut = text.slice(0, max)
  // A space at the end would be trimmed off the length the judge counts.
  return cut.endsWith(' ') ? `${cut.slice(0, -1)}s` : cut
}

// A headline or phrase slot: what a template sets large, where a long word has the least room.
function isHeadlineOrPhrase(path: Path): boolean {
  const named = path.filter((part): part is string => typeof part === 'string')
  const last = named.at(-1) ?? ''
  const parent = named.at(-2) ?? ''
  if (['headline', 'heading', 'title', 'lines', 'statement', 'value'].includes(last)) return true
  if (['titleUp', 'titleDown', 'accent'].includes(last)) return true
  if (last === 'text' && parent === 'marquee') return true
  if (['first', 'second', 'text'].includes(last)) return ['headline', 'heading'].includes(parent)
  // A list of short labels set as one (Vector's services, the labels of Monolith and Meridian).
  return last === 'items' && typeof path.at(-1) === 'number'
}

// Long words, as many as fit the slot. Each new slot leads with the next word that fits it, so
// the items of a list differ.
function longWords(max: number, start: number): string | null {
  const fitting = LONG_WORDS.filter((word) => word.length <= max)
  const first = fitting[start % Math.max(1, fitting.length)]
  if (first === undefined) return null
  const words = [first]
  for (const word of LONG_WORDS) {
    if (word !== first && [...words, word].join(' ').length <= max) words.push(word)
  }
  return words.join(' ')
}

// A name cut to a slot's limit: the whole words that fit, or, with nowhere to break, the first
// characters. The limit is the slot's own (maxOf), never a fallback's cut: the model shortens a
// long name in its own words, and the template's fallback copy (lib/copy-slots/fit.ts) is not
// what these answers stand for.
function cutName(name: string, max: number | null): string {
  if (max === null || name.length <= max) return name
  const space = name.slice(0, max + 1).lastIndexOf(' ')
  return space > 0 ? name.slice(0, space).trimEnd() : name.slice(0, max)
}

// The synthetic answers of one template, from the base it is given: its longest stored answer.
export function syntheticFrom(
  contract: TemplateContract,
  base: CorpusFile,
  baseName: string,
): Record<string, CorpusFile> {
  const leaves = leavesOf(base.copy).map((leaf) => ({
    ...leaf,
    max: maxOf(contract, base.copy, leaf.path),
  }))
  const longest = structuredClone(base.copy)
  leaves.forEach((leaf, index) => {
    if (leaf.max !== null) setAt(longest, leaf.path, filled(leaf.max, index))
  })
  const words = structuredClone(base.copy)
  let start = 0
  for (const leaf of leaves) {
    if (leaf.max === null || !isHeadlineOrPhrase(leaf.path)) continue
    const text = longWords(leaf.max, start)
    if (text === null) continue
    setAt(words, leaf.path, text)
    start += 1
  }
  const from = `from ${baseName}`
  const out: Record<string, CorpusFile> = {
    'synthetic-longest': {
      ...base,
      source: `synthetic: every text slot at its longest allowed length, ${from}`,
      copy: longest,
    },
    'synthetic-long-words': {
      ...base,
      source: `synthetic: the long real words in every headline and phrase slot, ${from}`,
      copy: words,
    },
  }
  // A list the base holds more of than the template now asks (Meridian's benefits: its stored
  // answers hold four, a new answer three, and the page lays three out differently): the
  // longest answer again with that list cut to the count asked, so the layout a new answer gets
  // is measured with every text slot at its longest too.
  for (const violation of contract.copyViolations(longest)) {
    if ((listAt(longest, violation.slot)?.length ?? 0) <= violation.max) continue
    const copy = structuredClone(longest)
    listAt(copy, violation.slot)?.splice(violation.max)
    out[`synthetic-longest-${violation.slot.replaceAll('.', '-')}-${String(violation.max)}`] = {
      ...base,
      source: `synthetic: every text slot at its longest allowed length, and ${violation.slot} at the ${String(violation.max)} the template asks, ${from}`,
      copy,
    }
  }
  // A name reaches the page only through the copy's brand slots, which hold at most their
  // limits, so each name variant carries the name cut to each brand slot's limit.
  const nameMax = maxOf(contract, base.copy, ['brand', 'name'])
  const legalMax = maxOf(contract, base.copy, ['brand', 'legalName'])
  for (const [name, company] of Object.entries(NAMES)) {
    const copy = structuredClone(base.copy) as Record<string, unknown>
    const brand = copy.brand as Record<string, unknown> | undefined
    if (brand !== undefined) {
      if (typeof brand.name === 'string') brand.name = cutName(company, nameMax)
      if (typeof brand.legalName === 'string') brand.legalName = cutName(company, legalMax)
    }
    const answers: SubmissionAnswers = { ...base.answers, company }
    out[`synthetic-${name}`] = {
      ...base,
      answers,
      source: `synthetic: a business name of ${String(company.length)} characters, ${from}`,
      copy,
    }
  }
  return out
}

// The base a template's synthetic answers start from: its longest model answer, the one most
// likely to break a layout.
export function baseOf(files: Readonly<Record<string, CorpusFile>>): [string, CorpusFile] | null {
  const model = Object.entries(files).filter(([name]) => !name.startsWith('synthetic-'))
  model.sort(
    (a, b) =>
      JSON.stringify(b[1].copy).length - JSON.stringify(a[1].copy).length ||
      a[0].localeCompare(b[0]),
  )
  return model[0] ?? null
}
