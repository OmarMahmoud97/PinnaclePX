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
import { isBelow, isHidden, isUnjudged } from './lib/pixels.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,1440x900',
  looks: 'own',
})
const { pages, results, schemes } = await runContrast(options, { gradientOnly: true })
// A gradient text seen whole on the screen only with something over it fails, as the contrast
// check's texts do (lib/pixels.mjs); one never seen whole on the screen is unjudged.
const measured = results.filter((r) => r.worst !== null)
const hidden = results.filter(isHidden)
const lines = [
  `Gradient text: ${String(pages.length)} pages (${options.source}), schemes ${schemes.join(',')}, sizes ${options.sizes.map((s) => s.size).join(', ')}; ${String(measured.length + hidden.length)} gradient texts measured, ${String(measured.filter(isBelow).length + hidden.length)} failing: ${String(measured.filter(isBelow).length)} with a stop below its level and ${String(hidden.length)} hidden (seen whole on the screen only with something over them); ${String(results.filter(isUnjudged).length)} never whole on the screen (unjudged).`,
]
for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
  for (const scheme of schemes) {
    const all = results.filter((r) => r.templateId === templateId && r.scheme === scheme)
    const mine = all.filter((r) => r.worst !== null)
    const over = all.filter(isHidden)
    const notSeen = all.filter(isUnjudged).length
    if (mine.length + over.length === 0) {
      if (notSeen > 0) {
        lines.push(`${templateId} ${scheme}: ${String(notSeen)} unjudged, none measured`)
      }
      continue
    }
    const pagesAll = new Set([...mine, ...over].map((r) => r.page)).size
    const bad = [...mine.filter(isBelow), ...over]
    const lowest = mine.length === 0 ? 'none judged' : String(Math.min(...mine.map((r) => r.worst)))
    lines.push(
      `${templateId} ${scheme}: ${String(new Set(bad.map((r) => r.page)).size)}/${String(pagesAll)} pages with a stop below its level or a text hidden (${String(over.length)} hidden); lowest stop ${lowest}; ${String(notSeen)} unjudged; ${[...new Set(mine.map((r) => r.text.slice(0, 20)))].slice(0, 3).join(' / ')}`,
    )
  }
}
if (results.length === 0) lines.push('No gradient text on these pages.')
writeReport(outDir(options, 'gradient-text'), results, lines)
