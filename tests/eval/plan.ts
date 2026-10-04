import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { SlotPlan } from '@/lib/images/plan'

// Which fixtures a run writes copy for, which stored record each reuses, when it stops starting
// fixtures, and the pictures each page takes. Pure, so each is unit-tested (plan.test.ts)
// without a model call.

// A fixture and the templates the selector chose for it.
export type Choice = Readonly<{ id: string; templates: readonly string[] }>

const listOf = (value: string) =>
  value
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')

// EVAL_TEMPLATES as template ids, or null when unset or empty. An id that names no template
// stops the run, so a typo cannot quietly select nothing.
export function namedTemplates(
  value: string | undefined,
  known: readonly string[],
): readonly string[] | null {
  const ids = listOf(value ?? '')
  if (ids.length === 0) return null
  const unknown = ids.filter((id) => !known.includes(id))
  if (unknown.length > 0) {
    throw new Error(`EVAL_TEMPLATES names no template: ${unknown.join(', ')}`)
  }
  return ids
}

// EVAL_PAIRS as fixtures in the run's order, each with the templates named for it in the order
// named, or null when unset or empty: `hr:t01-aurora+t08-vector,florist:t03-meridian`. Every
// named template is written, chosen or not, so a pass can fill a cell the selector never
// chose for that fixture. An entry that is not a fixture and its templates, an id that names no
// fixture or no template, or a fixture or template named twice stops the run, so a typo cannot
// quietly write something else.
export function namedPairs(
  value: string | undefined,
  fixtures: readonly string[],
  templates: readonly string[],
): Choice[] | null {
  const entries = listOf(value ?? '')
  if (entries.length === 0) return null
  const pairs = entries.map((entry) => {
    const [id = '', named = '', ...rest] = entry.split(':').map((part) => part.trim())
    const ids = named
      .split('+')
      .map((t) => t.trim())
      .filter((t) => t !== '')
    if (id === '' || ids.length === 0 || rest.length > 0) {
      throw new Error(`EVAL_PAIRS entry "${entry}" is not <fixture>:<template>+<template>`)
    }
    return { id, templates: ids }
  })
  const twice = <T>(list: readonly T[]) =>
    list.filter((item, index) => list.indexOf(item) !== index)
  const noFixture = pairs.map((p) => p.id).filter((id) => !fixtures.includes(id))
  const noTemplate = [
    ...new Set(pairs.flatMap((p) => p.templates).filter((id) => !templates.includes(id))),
  ]
  const problems = [
    ...(noFixture.length === 0 ? [] : [`names no fixture: ${noFixture.join(', ')}`]),
    ...(noTemplate.length === 0 ? [] : [`names no template: ${noTemplate.join(', ')}`]),
    ...twice(pairs.map((p) => p.id)).map((id) => `names ${id} twice; give it one entry`),
    ...pairs.flatMap((p) => twice(p.templates).map((id) => `names ${id} twice for ${p.id}`)),
  ]
  if (problems.length > 0) throw new Error(`EVAL_PAIRS ${problems.join('; ')}`)
  return pairs
}

// The templates a page outside the selector's pick is set with: the pick's first two, then it,
// a page a visitor in that row could get. Its tokens are solved over their pairs, its studio
// bar counts them, and its pictures are chosen third, after theirs (picksAfter).
export function trioOf(picked: readonly string[], id: string): string[] {
  return [...picked.slice(0, 2), id]
}

// The templates whose copy each fixture's run writes: every template it was chosen with no
// names given; else only the named ones it was chosen, so a pass that measures one template's
// guide pays for that template's copy alone. A fixture chosen none of them is left out, since
// it would write nothing. A named template a fixture was not chosen is never written for it:
// a visitor with that sentence would not get it.
export function copyTargets(choices: readonly Choice[], named: readonly string[] | null): Choice[] {
  if (named === null) return choices.map((choice) => ({ ...choice }))
  return choices
    .map((choice) => ({
      id: choice.id,
      templates: choice.templates.filter((id) => named.includes(id)),
    }))
    .filter((choice) => choice.templates.length > 0)
}

// EVAL_MAX_USD as dollars, or null when unset or empty.
export function maxUsdOf(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const usd = Number(value)
  if (!Number.isFinite(usd) || usd <= 0) {
    throw new Error(`EVAL_MAX_USD must be a positive number of dollars, not "${value}"`)
  }
  return usd
}

// The spend stop. Every call's priced cost is added as it is noted, so the stop sees the calls
// of the fixtures still in flight too. Once the run's cost reaches the cap no new fixture
// starts, but a fixture already started runs to its end: a run can pass its cap by the cost of
// up to EVAL_CONCURRENCY fixtures. A call priced at NaN (a model missing from the price table)
// makes the cost unknown, and an unknown cost starts nothing more.
export function spendStop(cap: number | null) {
  let spent = 0
  return {
    add(usd: number): void {
      spent += usd
    },
    spent: () => spent,
    mayStart: () => cap === null || spent < cap,
  }
}

// Each item through work, at most `limit` at once and in order, starting an item only while
// mayStart() holds. Returns each started item's result, and the items never started.
export async function runLimited<T, R>(
  items: readonly T[],
  limit: number,
  mayStart: () => boolean,
  work: (item: T) => Promise<R>,
): Promise<{ results: R[]; notStarted: T[] }> {
  const results: R[] = []
  const notStarted: T[] = []
  let next = 0
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (next < items.length) {
      const index = next
      next += 1
      const item = items[index]
      if (item === undefined) continue
      if (!mayStart()) {
        notStarted.push(item)
        continue
      }
      results.push(await work(item))
    }
  })
  await Promise.all(workers)
  return { results, notStarted }
}

type Answered = Readonly<{ id: string; answers: SubmissionAnswers }>

// A business as its answers make it, the photographs left out: decision 11's own-photograph
// variants are one business.
const businessOf = (answers: SubmissionAnswers) =>
  JSON.stringify({ ...answers, imagery: { ...answers.imagery, photos: [] } })

// The record a fixture reuses from EVAL_REUSE_RUN: its own, else a variant's, one written for
// the same business with other photographs (every answer the same but the photographs).
// Decision 11's own-photograph variants share one copy run this way: one is written in full,
// and the others re-run only the rank stage on its brief, templates and copy.
export function reusedFor<T extends Answered>(fixture: Answered, records: readonly T[]): T | null {
  const own = records.find((record) => record.id === fixture.id)
  if (own !== undefined) return own
  return (
    records.find((record) => businessOf(record.answers) === businessOf(fixture.answers)) ?? null
  )
}

// The fixture whose copy run each fixture's pages carry, by id: its own, or, for a variant of a
// business an earlier fixture holds, that first fixture's, whose templates and copy it reuses.
export function copyRunOf(fixtures: readonly Answered[]): ReadonlyMap<string, string> {
  const first = new Map<string, string>()
  const out = new Map<string, string>()
  for (const fixture of fixtures) {
    const key = businessOf(fixture.answers)
    if (!first.has(key)) first.set(key, fixture.id)
    out.set(fixture.id, first.get(key) ?? fixture.id)
  }
  return out
}

// A run that skips the brief stage writes on a reused run's records, so a fixture with no record
// there (its own or a variant's) cannot run: it is set aside before any call, never found
// part-way through a paid run (the new fixtures have no l6 record, so a named-template pass on
// l6 runs on the fixtures l6 holds). Keeps the order of the list.
export function splitByRecord<T extends Readonly<{ fixture: Answered }>>(
  targets: readonly T[],
  records: readonly Answered[],
): { kept: T[]; dropped: T[] } {
  const kept: T[] = []
  const dropped: T[] = []
  for (const target of targets) {
    if (reusedFor(target.fixture, records) === null) dropped.push(target)
    else kept.push(target)
  }
  return { kept, dropped }
}

// A template's picture plan (lib/images/plan.ts), and per slot the Pexels id it takes, or null.
type Planned = Readonly<{ id: string; plan: Readonly<Record<string, SlotPlan>> }>
type Picks = Record<string, number | null>

// A pool's key, as the eval stores it (PoolRecord.key): the queries and the purpose they serve.
export const poolKeyOf = (step: Readonly<{ queries: readonly string[]; purpose: string }>) =>
  `${step.queries.join('\n')}\n${step.purpose}`

// The choice rule of lib/images/stage.ts as the eval replays it on ranked pools: the best
// candidate no design has taken, else the best this design has not shown, else nothing. Slots in
// order; `taken` holds which designs have each picture, and grows.
function takeFor(
  { id, plan }: Planned,
  orderOf: (key: string) => readonly number[],
  taken: Map<number, Set<string>>,
): { picks: Picks; empty: number; repeated: number } {
  const picks: Picks = {}
  let empty = 0
  let repeated = 0
  for (const [slot, step] of Object.entries(plan)) {
    if (step.kind !== 'search') {
      picks[slot] = null
      continue
    }
    const ordered = orderOf(poolKeyOf(step))
    const fresh = ordered.find((c) => !taken.has(c))
    const shared = ordered.find((c) => taken.get(c)?.has(id) !== true)
    const chosen = fresh ?? shared ?? null
    if (chosen === null) empty += 1
    else {
      if (fresh === undefined) repeated += 1
      const takers = taken.get(chosen) ?? new Set<string>()
      takers.add(id)
      taken.set(chosen, takers)
    }
    picks[slot] = chosen
  }
  return { picks, empty, repeated }
}

// Every design's pictures, designs in order, with the slots left empty and those holding a
// picture another design took first.
export function assignPictures(
  plans: readonly Planned[],
  orderOf: (key: string) => readonly number[],
): { assignment: Record<string, Picks>; empty: number; repeated: number } {
  const taken = new Map<number, Set<string>>()
  const assignment: Record<string, Picks> = {}
  let empty = 0
  let repeated = 0
  for (const planned of plans) {
    const took = takeFor(planned, orderOf, taken)
    assignment[planned.id] = took.picks
    empty += took.empty
    repeated += took.repeated
  }
  return { assignment, empty, repeated }
}

// The pictures of a page outside the pick, chosen third after the trio's first two (trioOf):
// the rule above, continued from the pictures those two took as the record stores them, so it
// needs no call and the pick's own pictures stay as they are. The pick's third design is not
// before it in the trio, so what that design took is free to it.
export function picksAfter(
  before: Readonly<Record<string, Readonly<Record<string, number | null>>>>,
  planned: Planned,
  orderOf: (key: string) => readonly number[],
): Picks {
  const taken = new Map<number, Set<string>>()
  for (const [id, picks] of Object.entries(before)) {
    for (const chosen of Object.values(picks)) {
      if (chosen === null) continue
      const takers = taken.get(chosen) ?? new Set<string>()
      takers.add(id)
      taken.set(chosen, takers)
    }
  }
  return takeFor(planned, orderOf, taken).picks
}
