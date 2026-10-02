// Which fixtures a run writes copy for, and when it stops starting fixtures. Pure, so the
// selection and the stop are unit-tested (plan.test.ts) without a model call.

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
