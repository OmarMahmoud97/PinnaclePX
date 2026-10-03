// The gradient-text check (decision 15; the check standard in docs/template-fit-decisions.md,
// Part 3). Text painted with background-clip: text has no colour of its own for the contrast
// check to read, so each of its gradient's resolved stops is measured against every pixel under
// it, in both schemes, at the text's level (lib/contrast-run.mjs). Started from
// review2/verify-critic-states/grad-stops.mjs, which resolved Monolith's and Meridian's stops by
// name; this reads the stops of any gradient text from its computed style.
//
//   node scripts/checks/gradient-text.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     --schemes <list>   light,dark (default both)
import { parseArgs } from './lib/args.mjs'
import { runContrast } from './lib/contrast-run.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,1440x900',
  looks: 'own',
})
const { pages, results, schemes } = await runContrast(options, { gradientOnly: true })
const measured = results.filter((r) => r.worst !== null)
const lines = [
  `Gradient text: ${String(pages.length)} pages (${options.source}), schemes ${schemes.join(',')}, sizes ${options.sizes.map((s) => s.size).join(', ')}; ${String(measured.length)} gradient texts measured, ${String(measured.filter((r) => r.worst < r.level).length)} with a stop below its level.`,
]
for (const templateId of [...new Set(measured.map((r) => r.templateId))].sort()) {
  for (const scheme of schemes) {
    const mine = measured.filter((r) => r.templateId === templateId && r.scheme === scheme)
    if (mine.length === 0) continue
    const pagesAll = new Set(mine.map((r) => r.page)).size
    const bad = mine.filter((r) => r.worst < r.level)
    const lowest = Math.min(...mine.map((r) => r.worst))
    lines.push(
      `${templateId} ${scheme}: ${String(new Set(bad.map((r) => r.page)).size)}/${String(pagesAll)} pages with a stop below its level; lowest stop ${String(lowest)}; ${[...new Set(mine.map((r) => r.text.slice(0, 20)))].slice(0, 3).join(' / ')}`,
    )
  }
}
if (measured.length === 0) lines.push('No gradient text on these pages.')
writeReport(outDir(options, 'gradient-text'), results, lines)
