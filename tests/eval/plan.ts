import type { SubmissionAnswers } from '@/lib/brief/submission'

// Which fixtures a run writes copy for, which stored record each reuses, and when it stops
// starting fixtures. Pure, so each is unit-tested (plan.test.ts) without a model call.

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
