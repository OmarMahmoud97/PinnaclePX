// The studio-bar check (decision 22; the check standard's studio bar line in
// docs/template-fit-decisions.md, Part 3). Each page is drawn under the studio bar as the preview
// page draws a design (the dev route's ?bar=1, app/dev/_render/concept.tsx), and at scroll 0, 20
// and 40:
//
//   reach    a pointer reaches each studio link: every point of a 5 by 3 grid across the part
//            of the link on the screen lands on the link (the review counted a link reached
//            when any point did, review2/verify-critic-states/sb-check.mjs: 0 of 540 on main)
//   below    the template's header lies whole below the part of the bar still on the screen
//
// and once the bar has scrolled away, the header sits where it sits on the same page without
// the bar (the page scrolled the bar's height less), so a header that starts below the bar
// returns to the top.
//
//   node scripts/checks/studio-bar.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     (default widths 390x844 and 1440x900)
import { parseArgs } from './lib/args.mjs'
import { inPool, launch, open, withTab } from './lib/browser.mjs'
import { installHelpers } from './lib/in-page.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,1440x900',
})
const SCROLLS = [0, 20, 40]
// Past the bar and every header's glass threshold (Ember and Summit 10, Harbor 40).
const AWAY = 300

// In the page: each studio link's reach at the scroll it stands at, and the header against the
// part of the bar on the screen.
function atScroll() {
  const C = window.__checks
  const bar = document.querySelector('[data-dev-studio] > :first-child')
  if (bar === null) return null
  const b = bar.getBoundingClientRect()
  const links = [...bar.querySelectorAll('a[href]')].map((link) => {
    const name = (link.getAttribute('aria-label') ?? link.textContent ?? '').trim().slice(0, 30)
    const r = link.getBoundingClientRect()
    const top = Math.max(r.top, 0)
    if (r.bottom <= 0 || r.width === 0) return { name, points: 0, reached: 0 }
    let points = 0
    let reached = 0
    const at = {}
    for (let i = 1; i <= 5; i += 1) {
      for (let j = 1; j <= 3; j += 1) {
        const hit = document.elementFromPoint(
          r.left + (r.width * i) / 6,
          top + ((r.bottom - top) * j) / 4,
        )
        points += 1
        if (hit !== null && link.contains(hit)) reached += 1
        else {
          const what = hit === null ? 'nothing' : C.describe(hit).slice(0, 40)
          at[what] = (at[what] ?? 0) + 1
        }
      }
    }
    return { name, points, reached, covered: at }
  })
  const header = C.headerOf()
  const h = header?.getBoundingClientRect() ?? null
  return {
    barBottom: Math.round(b.bottom),
    links,
    header: h === null ? null : { top: Math.round(h.top), bottom: Math.round(h.bottom) },
    below: h === null || b.bottom <= 0 || h.top >= b.bottom - 0.5,
  }
}

// In the page: the header's box where the page stands now.
function headerBox() {
  const header = window.__checks.headerOf()
  const h = header?.getBoundingClientRect() ?? null
  return h === null ? null : { top: Math.round(h.top), height: Math.round(h.height) }
}

const scrollTo = async (tab, y) => {
  await tab.evaluate((top) => window.scrollTo(0, top), y)
  await tab.waitForTimeout(400)
}

async function check(browser, page, viewport) {
  const rows = []
  // Where the header sits with the bar scrolled away, on the page without the bar.
  const own = await withTab(browser, viewport, async (tab) => {
    await open(tab, urlOf(options.base, page, {}))
    await tab.evaluate(installHelpers)
    await scrollTo(tab, AWAY)
    return tab.evaluate(headerBox)
  })
  await withTab(browser, viewport, async (tab) => {
    await open(tab, urlOf(options.base, page, { bar: '1' }))
    await tab.evaluate(installHelpers)
    let barHeight = 0
    for (const y of SCROLLS) {
      await scrollTo(tab, y)
      const facts = await tab.evaluate(atScroll)
      if (facts === null) throw new Error(`${page.label}: no studio bar drawn`)
      if (y === 0) barHeight = facts.barBottom
      rows.push({
        templateId: page.templateId,
        page: page.label,
        size: viewport.size,
        scroll: y,
        ...facts,
      })
    }
    await scrollTo(tab, AWAY + barHeight)
    const away = await tab.evaluate(headerBox)
    rows.push({
      templateId: page.templateId,
      page: page.label,
      size: viewport.size,
      scroll: AWAY + barHeight,
      away,
      own,
      settles: away === null || own === null ? away === own : Math.abs(away.top - own.top) <= 1,
    })
  })
  return rows
}

const pages = pagesOf(options)
const browser = await launch()
const work = pages.flatMap((page) => options.sizes.map((viewport) => ({ page, viewport })))
const results = (
  await inPool(
    work,
    3,
    ({ page, viewport }) => check(browser, page, viewport),
    ({ page, viewport }) => `${page.label} at ${viewport.size}`,
  )
).flat()
await browser.close()

const lines = [
  `Studio bar: ${String(pages.length)} pages (${options.source}) under the bar, at ${options.sizes.map((s) => s.size).join(' and ')}, scrolled ${SCROLLS.join(', ')}; a link passes when every point of its grid reaches it.`,
]
for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
  const mine = results.filter((r) => r.templateId === templateId)
  const cells = options.sizes.map((s) => {
    const at = mine.filter((r) => r.size === s.size && r.links !== undefined)
    const tests = at.flatMap((r) => r.links.filter((l) => l.points > 0))
    const whole = tests.filter((l) => l.reached === l.points).length
    const some = tests.filter((l) => l.reached > 0).length
    const below = at.filter((r) => r.below).length
    const settled = mine.filter((r) => r.size === s.size && r.settles !== undefined)
    return `${s.size}: links reached ${String(whole)}/${String(tests.length)} (any point ${String(some)}), header below the bar ${String(below)}/${String(at.length)}, at its own place once the bar has gone ${String(settled.filter((r) => r.settles).length)}/${String(settled.length)}`
  })
  lines.push(`${templateId}: ${cells.join(' | ')}`)
}
const all = results
  .filter((r) => r.links !== undefined)
  .flatMap((r) => r.links.filter((l) => l.points > 0))
lines.push(
  `\nAll: ${String(all.filter((l) => l.reached === l.points).length)} of ${String(all.length)} link tests reached at every point, ${String(all.filter((l) => l.reached > 0).length)} at some point.`,
)
writeReport(outDir(options, 'studio-bar'), results, lines)
