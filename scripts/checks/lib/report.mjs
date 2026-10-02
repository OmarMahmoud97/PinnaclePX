// Where a check's results go: every finding as JSON, and a short text summary that the pull
// request quotes, both under test-results/checks/<check> unless --out says otherwise.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function outDir(options, check) {
  const dir = options.out ?? join(process.cwd(), 'test-results', 'checks', check)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function writeReport(dir, results, lines) {
  writeFileSync(join(dir, 'results.json'), JSON.stringify(results, null, 1))
  const text = `${lines.join('\n')}\n`
  writeFileSync(join(dir, 'summary.txt'), text)
  process.stdout.write(text)
}

// A count of findings by a key, as "key n" pairs, largest first.
export function tally(items, keyOf) {
  const counts = new Map()
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
