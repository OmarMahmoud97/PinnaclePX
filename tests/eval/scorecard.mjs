// The label-free scorecard (decision 20; review/outcome.md, OUT-6): picture numbers from a stored
// eval run, per template and in total, with no model call, no Pexels call and no owner time.
// It replays the imagery stage's choice rule (lib/images/stage.ts) on each pool's stored order,
// with the shown slots following the stored copy's item counts, and counts:
//
//   empty    shown slots left empty, by cause: a search error, no results, every candidate
//            rejected, or the pool used up by the designs before
//   shared   shown slots holding a picture another design of the same submission took
//   4 to 6   pictures the judge scored 4 to 6; unjudged pictures it never scored
//   alt      alt text decision 7a's rule would empty: over 120 characters, a digit, or a
//            capitalised word past a sentence's first that the visitor's sentence, the company
//            name and the brief never gave
//   padded   pages whose list has more items than the brief's (Monolith's steps, Meridian's
//            benefits, Summit's reasons)
//
// A second set of columns counts only the slots a phone shows (records.md: Monolith's quote and
// profile, Atlas's hero and Summit's closing picture are not drawn at 390). Leftovers are the
// rendered check's (scripts/checks/leftovers.mjs), not counted here. Started from
// review/outcome/scorecard.cjs, which counted "all rejected" and "pool used up" as one cause.
//
//   pnpm eval:scorecard <run> [<run> ...]
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const runs = process.argv.slice(2)
if (runs.length === 0) {
  console.error('usage: pnpm eval:scorecard <run> [<run> ...]')
  process.exit(1)
}

// The per-item slots a template draws only for the items its copy has (dish-1, dish-2, ...).
const ITEMS = {
  't05-ember': ['dish-', (copy) => copy.dishes.items.length],
  't07-summit': ['service-', (copy) => copy.services.items.length],
  't08-vector': ['project-', (copy) => copy.projects.items.length],
}
// The slots a phone does not show (docs/template-fit/records.md, the slot geometry tables).
const HIDDEN_AT_390 = {
  't02-monolith': ['quote', 'profile'],
  't04-atlas': ['hero'],
  't07-summit': ['cta'],
}
// The lists a template draws more items in than the brief's (the fix list's padding row).
const PADDED = {
  't02-monolith': (copy, brief) => copy.steps.items.length > brief.steps.length,
  't03-meridian': (copy, brief) => copy.benefits.items.length > brief.valueProps.length,
  't07-summit': (copy, brief) => copy.why.cards.length > brief.valueProps.length,
}

function stringsIn(value, out = []) {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const v of value) stringsIn(v, out)
  else if (value !== null && typeof value === 'object')
    for (const v of Object.values(value)) stringsIn(v, out)
  return out
}

// Decision 7a: a stock picture keeps its alt only if it has at most 120 characters, no digits,
// and no capitalised word, but a sentence's first, that the visitor or the brief did not give.
function altFlagged(alt, given) {
  if (alt.length > 120 || /\d/.test(alt)) return true
  return alt
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) => sentence.split(/\s+/).slice(1))
    .map((word) => word.replace(/[^\p{L}'-]/gu, ''))
    .some((word) => /^\p{Lu}/u.test(word) && !given.has(word.toLowerCase()))
}

function scoreRun(run) {
  const dir = join(process.cwd(), 'test-results', 'eval', run)
  if (!existsSync(dir)) throw new Error(`No stored run test-results/eval/${run}`)
  const rows = new Map()
  const add = (templateId, key, n = 1) => {
    for (const id of [templateId, 'ALL']) {
      const row = rows.get(id) ?? {}
      row[key] = (row[key] ?? 0) + n
      rows.set(id, row)
    }
  }
  const records = readdirSync(dir)
    .filter((name) => name.endsWith('.json') && name !== 'summary.json' && !name.startsWith('_'))
    .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')))
  for (const record of records) {
    const brief = record.brief.brief
    const given = new Set(
      [record.answers.company, record.answers.description, ...stringsIn(brief)]
        .join(' ')
        .split(/[^\p{L}'-]+/u)
        .map((w) => w.toLowerCase()),
    )
    const hero = record.imagery.pools.find((pool) => pool.purpose.startsWith('the main'))
    const detail = record.imagery.pools.find((pool) => pool.purpose.startsWith('a supporting'))
    const candidates = new Map(
      record.imagery.pools.flatMap((p) => p.candidates.map((c) => [c.id, c])),
    )
    const verdicts = new Map(
      record.imagery.pools.flatMap((p) => (p.verdicts ?? []).map((v) => [v.id, v])),
    )
    const taken = new Map()
    for (const templateId of record.templates) {
      const written = record.copy[templateId]
      const copy = written?.final
      if (written !== undefined && !written.fallback) {
        add(templateId, 'pages')
        if (PADDED[templateId] !== undefined) {
          add(templateId, 'listPages')
          if (PADDED[templateId](copy, brief)) add(templateId, 'padded')
        }
      }
      const slots = Object.keys(record.imagery.assignment[templateId] ?? {})
      slots.forEach((slot, index) => {
        const item = ITEMS[templateId]
        if (item !== undefined && copy !== undefined && slot.startsWith(item[0])) {
          if (Number(slot.slice(item[0].length)) > item[1](copy)) return
        }
        const pool = index === 0 ? hero : detail
        const order = pool?.ordered ?? []
        const fresh = order.find((id) => !taken.has(id))
        const reused = order.find((id) => !(taken.get(id) ?? new Set()).has(templateId))
        const chosen = fresh ?? reused ?? null
        const phone = !(HIDDEN_AT_390[templateId] ?? []).includes(slot)
        const count = (key) => {
          add(templateId, key)
          if (phone) add(templateId, `phone ${key}`)
        }
        count('slots')
        if (chosen === null) {
          const searchErrors =
            pool === undefined ? 0 : pool.errors.filter((e) => e.startsWith('search')).length
          const cause =
            pool === undefined || pool.candidates.length === 0
              ? searchErrors > 0
                ? 'empty: search error'
                : 'empty: no results'
              : order.length === 0
                ? 'empty: all rejected'
                : 'empty: pool used up'
          count('empty')
          count(cause)
          return
        }
        if (fresh === undefined) count('shared')
        const takers = taken.get(chosen) ?? new Set()
        takers.add(templateId)
        taken.set(chosen, takers)
        const verdict = verdicts.get(chosen)
        if (verdict === undefined) count('unjudged')
        else if (verdict.score >= 4 && verdict.score <= 6) count('scored 4 to 6')
        count('filled')
        if (altFlagged(candidates.get(chosen)?.alt ?? '', given)) count('alt flagged')
      })
    }
  }
  return rows
}

const COLUMNS = [
  'pages',
  'slots',
  'empty',
  'empty: search error',
  'empty: no results',
  'empty: all rejected',
  'empty: pool used up',
  'shared',
  'scored 4 to 6',
  'unjudged',
  'alt flagged',
  'padded',
]
for (const run of runs) {
  const rows = scoreRun(run)
  console.log(`\n## ${run}\n`)
  console.log(`| Template | ${COLUMNS.join(' | ')} | at 390: slots, empty, shared |`)
  console.log(`| ${['---', ...COLUMNS, '---'].map(() => '---').join(' | ')} |`)
  const ids = [...rows.keys()].filter((id) => id !== 'ALL').sort()
  for (const id of [...ids, 'ALL']) {
    const row = rows.get(id) ?? {}
    const cells = COLUMNS.map((column) => {
      if (column === 'padded')
        return row.listPages === undefined
          ? ''
          : `${String(row.padded ?? 0)} of ${String(row.listPages)}`
      if (column === 'alt flagged')
        return `${String(row['alt flagged'] ?? 0)} of ${String(row.filled ?? 0)}`
      return String(row[column] ?? 0)
    })
    const phone = `${String(row['phone slots'] ?? 0)}, ${String(row['phone empty'] ?? 0)}, ${String(row['phone shared'] ?? 0)}`
    console.log(`| ${id === 'ALL' ? '**all**' : id} | ${cells.join(' | ')} | ${phone} |`)
  }
}
