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
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, tally, writeReport } from './lib/report.mjs'

// In the page: every finding at the current width.
function measure({ company }) {
  const C = window.__checks
  const width = document.documentElement.clientWidth
  const findings = []
  const add = (kind, el, extra) =>
    findings.push({ kind, section: C.sectionOf(el), el: C.describe(el), ...extra })
  const union = (rects) => ({
    left: Math.min(...rects.map((r) => r.left)),
    top: Math.min(...rects.map((r) => r.top)),
    right: Math.max(...rects.map((r) => r.right)),
    bottom: Math.max(...rects.map((r) => r.bottom)),
  })
  for (const { node, el } of C.readableText()) {
    if (C.marqueeOf(el) !== null) continue
    const rects = C.rectsOf(node)
    if (rects.length === 0) continue
    const box = union(rects)
    const text = node.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)
    // Clipped: an ancestor that hides its overflow cuts the glyphs off. Across, any line that
    // passes its edge by more than a pixel. Down, a line whose middle falls outside it: a line
    // box is the font's whole ascent and descent, which a tight leading lets pass the row that
    // clips it with every glyph whole, so the line's middle is what says it is hidden. A box
    // that scrolls (auto or scroll) is not counted: the visitor can reach what it holds.
    let clipped = false
    for (let a = el; a !== null && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a)
      const clipX = cs.overflowX === 'hidden' || cs.overflowX === 'clip'
      const clipY = cs.overflowY === 'hidden' || cs.overflowY === 'clip'
      if (!clipX && !clipY) continue
      const r = a.getBoundingClientRect()
      const left = r.left + a.clientLeft
      const top = r.top + a.clientTop
      const right = left + a.clientWidth
      const bottom = top + a.clientHeight
      const over = Math.max(
        ...rects.map((line) => {
          const middle = (line.top + line.bottom) / 2
          return Math.max(
            clipX ? left - line.left : 0,
            clipX ? line.right - right : 0,
            clipY && middle < top ? top - middle : 0,
            clipY && middle > bottom ? middle - bottom : 0,
          )
        }),
      )
      if (over > 1) {
        add('clipped', el, { text, by: C.describe(a), px: Math.round(over) })
        clipped = true
        break
      }
    }
    if (!clipped && (box.right > width + 1 || box.left < -1)) {
      add('past-screen', el, { text, px: Math.round(Math.max(box.right - width, -box.left)) })
    }
    // A word broken across lines: one run of letters and digits whose glyphs sit on two lines.
    // A break after a hyphen or a slash splits two runs, so it is not counted.
    const size = parseFloat(getComputedStyle(el).fontSize)
    for (const m of node.textContent.matchAll(/[\p{L}\p{N}'’]{2,}/gu)) {
      const range = document.createRange()
      range.setStart(node, m.index)
      range.setEnd(node, m.index + m[0].length)
      const tops = [...range.getClientRects()].filter((r) => r.width > 0.5).map((r) => r.top)
      if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > size * 0.5) {
        add('broken-word', el, { word: m[0] })
      }
    }
  }
  // The header's controls, at the top of the page with any menu shut.
  const header = C.headerOf()
  if (header !== null) {
    const controls = [...header.querySelectorAll('a, button')].filter(
      (c) => C.shown(c) && !C.decorative(c) && !C.srOnly(c),
    )
    const name = company.toLowerCase().slice(0, 16)
    const wordmark =
      controls.find((c) => name !== '' && (c.textContent ?? '').toLowerCase().includes(name)) ??
      controls.find((c) => c.querySelector('img') !== null) ??
      null
    for (const c of controls) {
      const r = c.getBoundingClientRect()
      if (r.right > width + 0.5 || r.left < -0.5) {
        add('header-outside', c, { px: Math.round(Math.max(r.right - width, -r.left)) })
      }
      if (c === wordmark) continue
      const lines = []
      const walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        if (walker.currentNode.textContent.trim() === '') continue
        lines.push(...C.rectsOf(walker.currentNode))
      }
      if (lines.length > 1) {
        const tops = lines.map((l) => l.top)
        const height = Math.min(...lines.map((l) => l.height))
        if (Math.max(...tops) - Math.min(...tops) > height * 0.6) add('header-wrap', c, {})
      }
    }
    for (let i = 0; i < controls.length; i += 1) {
      for (let j = i + 1; j < controls.length; j += 1) {
        const a = controls[i]
        const b = controls[j]
        if (a.contains(b) || b.contains(a)) continue
        const p = a.getBoundingClientRect()
        const q = b.getBoundingClientRect()
        const w = Math.min(p.right, q.right) - Math.max(p.left, q.left)
        const h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)
        if (w > 1 && h > 1) {
          add('header-overlap', a, { with: C.describe(b), px: Math.round(Math.min(w, h)) })
        }
      }
    }
  }
  return findings
}

const options = parseArgs(process.argv.slice(2), {
  source: 'eval:l6-all-fixes,eval:l7-sentence',
})
const jobs = Number(options.rest.jobs ?? 3)
const pages = pagesOf(options)
const work = pages.flatMap((page) =>
  looksFor(options.looks, page.answers.imagery.style).map((look) => ({ page, look })),
)
// One load a page and look for the phones, and one for the windows, resized through the widths.
const groups = [options.sizes.filter((s) => s.phone), options.sizes.filter((s) => !s.phone)]
const browser = await launch()
const results = []
let done = 0
await inPool(work, jobs, async ({ page, look }) => {
  for (const sizes of groups.filter((g) => g.length > 0)) {
    const context = await contextFor(browser, sizes[0])
    const tab = await context.newPage()
    try {
      await open(tab, urlOf(options.base, page, { look }))
      await tab.evaluate(installHelpers)
      for (const size of sizes) {
        await resize(tab, size)
        const findings = await tab.evaluate(measure, { company: page.answers.company })
        results.push({
          templateId: page.templateId,
          page: page.label,
          look,
          size: size.size,
          findings,
        })
      }
    } finally {
      await context.close()
    }
  }
  done += 1
  if (done % 20 === 0) process.stderr.write(`${String(done)}/${String(work.length)}\n`)
})
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
