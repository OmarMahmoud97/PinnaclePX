// The layout-shift check (decision 1's picture box, Meridian's D3; the check standard in
// docs/template-fit-decisions.md, Part 3). Each page loads with its stand-in pictures held back
// 2.5 seconds, as a slow network would, and the layout shift a visitor feels is summed over the
// load (PerformanceObserver's layout-shift entries without recent input), with the elements that
// moved. The target is 0 at 390. Started from review/verify-templates/meridian-cls.cjs, which
// held Meridian's first picture; this holds every picture of every template.
//
//   node scripts/checks/layout-shift.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     (one page a template unless --limit says more; default widths 390, 768 and 1440)
import { parseArgs } from './lib/args.mjs'
import { contextFor, inPool, launch, visit } from './lib/browser.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,768x1024,1440x900',
})
const HOLD_MS = 2500

async function measure(browser, page, viewport) {
  const context = await contextFor(browser, viewport)
  try {
    const tab = await context.newPage()
    await tab.addInitScript(() => {
      window.__shift = { total: 0, sources: [] }
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue
          window.__shift.total += entry.value
          for (const source of entry.sources ?? []) {
            const node = source.node
            if (node === null || node === undefined || node.nodeType !== 1) continue
            const section = node.closest('section[id], header, footer, nav')
            window.__shift.sources.push(
              `${node.tagName.toLowerCase()}${node.id === '' ? '' : `#${node.id}`} in ${section === null ? 'page' : section.id || section.tagName.toLowerCase()}`,
            )
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    // Every picture held back, as on a slow network: next/image's and the stand-ins' own.
    const hold = async (route) => {
      await new Promise((resolve) => setTimeout(resolve, HOLD_MS))
      await route.continue()
    }
    await tab.route('**/_next/image**', hold)
    await tab.route('**/dev/picture/**', hold)
    // A page that does not answer 200 throws, so an error page is never measured as still.
    await visit(tab, urlOf(options.base, page, { pictures: 'grey' }), 'domcontentloaded')
    await tab.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
    await tab.waitForTimeout(HOLD_MS + 2500)
    const shift = await tab.evaluate(() => window.__shift)
    return {
      templateId: page.templateId,
      page: page.label,
      size: viewport.size,
      cls: Math.round(shift.total * 1000) / 1000,
      sources: [...new Set(shift.sources)].slice(0, 6),
    }
  } finally {
    await context.close().catch(() => undefined)
  }
}

const all = pagesOf(options)
const pages =
  options.limit === null ? [...new Map(all.map((p) => [p.templateId, p])).values()] : all
const browser = await launch()
const work = pages.flatMap((page) => options.sizes.map((viewport) => ({ page, viewport })))
const results = await inPool(
  work,
  3,
  ({ page, viewport }) => measure(browser, page, viewport),
  ({ page, viewport }) => `${page.label} at ${viewport.size}`,
)
await browser.close()
const lines = [
  `Layout shift with every picture held back ${String(HOLD_MS)} ms: ${String(pages.length)} pages (${options.source}); the target is 0 at 390.`,
]
for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
  const cells = options.sizes.map((s) => {
    const mine = results.filter((r) => r.templateId === templateId && r.size === s.size)
    const worst = mine.reduce((top, r) => (r.cls > top.cls ? r : top), { cls: 0, sources: [] })
    return `${s.size} ${String(worst.cls)}${worst.cls > 0 ? ` (${worst.sources.slice(0, 2).join(', ')})` : ''}`
  })
  lines.push(`${templateId}: ${cells.join(' | ')}`)
}
writeReport(outDir(options, 'layout-shift'), results, lines)
