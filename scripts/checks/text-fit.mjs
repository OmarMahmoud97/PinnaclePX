// The text-fit check (decisions 9 and 19; the check standard in docs/template-fit-decisions.md,
// Part 3). Every text a visitor reads, in every look's fonts, at every width: a text fails when
// an ancestor that hides its overflow clips it, when it runs past the screen, or when a word is
// broken across two lines. Header controls fail when one wraps inside its link or button, when
// two overlap, or when one leaves the screen; the visitor's own wordmark may wrap. Started from
// the review's measures (review/verify-templates/harbor-measure.cjs and monolith-measure.cjs),
// which read the same boxes for chosen elements; this reads them for every element.
//
//   node scripts/checks/text-fit.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     --jobs <n>    pages measured at once (default 3)
import { looksFor, parseArgs } from './lib/args.mjs'
import { contextFor, inPool, launch, open, resize } from './lib/browser.mjs'
import { installHelpers } from './lib/in-page.mjs'
import { measureTextFit } from './lib/text-fit-measure.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, tally, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
})
const jobs = Number(options.rest.jobs ?? 3)
const pages = pagesOf(options)
const work = pages.flatMap((page) =>
  looksFor(options.looks, page.answers.imagery.style).map((look) => ({ page, look })),
)
// One load a page and look for the phones, and one for the windows, resized through the widths.
const groups = [options.sizes.filter((s) => s.phone), options.sizes.filter((s) => !s.phone)]
const browser = await launch()
let done = 0
const results = (
  await inPool(
    work,
    jobs,
    async ({ page, look }) => {
      const rows = []
      for (const sizes of groups.filter((g) => g.length > 0)) {
        const context = await contextFor(browser, sizes[0])
        try {
          const tab = await context.newPage()
          await open(tab, urlOf(options.base, page, { look }))
          await tab.evaluate(installHelpers)
          for (const size of sizes) {
            await resize(tab, size)
            const findings = await tab.evaluate(measureTextFit, {
              names: [page.copy?.brand?.name, page.answers.company],
            })
            rows.push({
              templateId: page.templateId,
              page: page.label,
              look,
              size: size.size,
              findings,
            })
          }
        } finally {
          await context.close().catch(() => undefined)
        }
      }
      done += 1
      if (done % 20 === 0) process.stderr.write(`${String(done)}/${String(work.length)}\n`)
      return rows
    },
    ({ page, look }) => `${page.label} in ${look}`,
  )
).flat()
await browser.close()

// The summary: by template, then by width in the standard's order, the pages that fail in any
// look, with the kinds of finding and the elements most often at fault.
const order = options.sizes.map((s) => s.size)
const lines = [
  `Text fit: ${String(pages.length)} pages (${options.source}), looks ${options.looks}, ${String(order.length)} sizes; ${String(results.length)} renders.`,
]
for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
  const mine = results.filter((r) => r.templateId === templateId)
  const total = new Set(mine.map((r) => r.page)).size
  lines.push(`\n${templateId} (${String(total)} pages)`)
  for (const size of order) {
    const at = mine.filter((r) => r.size === size)
    const failing = new Set(at.filter((r) => r.findings.length > 0).map((r) => r.page))
    const findings = at.flatMap((r) => r.findings)
    const kinds = tally(findings, (f) => f.kind)
      .map(([k, n]) => `${k} ${String(n)}`)
      .join(', ')
    const worst = tally(findings, (f) => `${f.kind} ${f.section} ${f.el.replace(/ ".*$/, '')}`)
      .slice(0, 3)
      .map(([k, n]) => `${k} x${String(n)}`)
      .join('; ')
    lines.push(
      `  ${size.padEnd(9)} ${String(failing.size).padStart(3)}/${String(total)} pages fail${findings.length === 0 ? '' : `: ${kinds} | ${worst}`}`,
    )
  }
}
writeReport(outDir(options, 'text-fit'), results, lines)
