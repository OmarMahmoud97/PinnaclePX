// Where a check's results go: every finding as JSON, and a short text summary that the pull
// request quotes, both under test-results/checks/<check> unless --out says otherwise. Pages a
// check could not measure (lib/browser.mjs, inPool) are listed in both, never left out silently.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const failures = []

export function recordFailure(what, error) {
  failures.push({ what, error })
  process.stderr.write(`could not measure ${what}: ${error}\n`)
}

export function outDir(options, check) {
  const dir = options.out ?? join(process.cwd(), 'test-results', 'checks', check)
  mkdirSync(dir, { recursive: true })
  return dir
}

export function writeReport(dir, results, lines) {
  writeFileSync(join(dir, 'results.json'), JSON.stringify(results, null, 1))
  writeFileSync(join(dir, 'failed.json'), JSON.stringify(failures, null, 1))
  const failed =
    failures.length === 0
      ? []
      : [
          `\nCould not measure ${String(failures.length)} (tried twice each):`,
          ...failures.map((f) => `  ${f.what}: ${f.error.slice(0, 160)}`),
        ]
  const text = `${[...lines, ...failed].join('\n')}\n`
  writeFileSync(join(dir, 'summary.txt'), text)
  process.stdout.write(text)
}

// A count of findings by a key, as "key n" pairs, largest first.
export function tally(items, keyOf) {
  const counts = new Map()
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
