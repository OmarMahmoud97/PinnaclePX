// Accessible names and the heading outline (decision 15's accessibility list; the check
// standard in docs/template-fit-decisions.md, Part 3), read from Chromium's accessibility tree,
// as a screen reader gets the page, at 390 and 1440. Every page must meet the rules below, the
// expected list every template shares; EXPECT adds what decision 15 asks of one template.
//
//   outline   one h1, and no heading before it; no heading skips a level on the way down;
//             no heading without a name; no two headings in a row in one section at one level
//             with nothing between (an eyebrow set as a heading beside the real one); no sentence of
//             over 100 characters set as a heading; no copyright line set as one
//   names     every link, button and form field has a name; a short control's name holds the
//             words it shows (WCAG 2.5.3: each word of two letters or more of a label of up to
//             five words); no drawing is named as an icon ("Free Icons", "Menu Icon")
//   initials  letters in a small circle standing for a person are hidden from screen readers
//   letters   a heading set letter by letter is read as its words, not as letters
//
// Started from review/verify-templates/a11y-check.cjs, which read a few names from the DOM.
//
//   node scripts/checks/a11y-names.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     (one page a template unless --limit says more)
import { parseArgs } from './lib/args.mjs'
import { contextFor, inPool, launch, open } from './lib/browser.mjs'
import { installHelpers } from './lib/in-page.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, tally, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
  widths: '390x844,1440x900',
})

// What decision 15 asks of one template beyond the shared rules: the phone menu's button named
// with its visible label and the word menu (Vector, "Home menu").
const EXPECT = {
  't08-vector': { menuButtonNamed: /\bmenu\b/i },
}

const squash = (text) => (text ?? '').replace(/\s+/g, ' ').trim()

// In the page: each control's visible words, keyed by a mark, for the label-in-name rule; the
// circles of initials a reader can reach; headings drawn a letter at a time.
function domFacts() {
  const C = window.__checks
  const controls = []
  let n = 0
  for (const el of document.querySelectorAll('a[href], button, [role="button"]')) {
    if (el.getClientRects().length === 0 || el.closest('[aria-hidden="true"], [inert]') !== null)
      continue
    el.setAttribute('data-check-control', String(n))
    controls.push({ mark: String(n), shows: (el.innerText ?? '').replace(/\s+/g, ' ').trim() })
    n += 1
  }
  const initials = [...document.querySelectorAll('body *')]
    .filter((el) => {
      const own = C.ownText(el)
      if (!/^[A-Z]{1,3}$/.test(own) || el.closest('[aria-hidden="true"]') !== null) return false
      const r = el.getBoundingClientRect()
      const circle = (box) => {
        const cs = getComputedStyle(box)
        const radius = parseFloat(cs.borderTopLeftRadius)
        const b = box.getBoundingClientRect()
        return (
          b.width > 0 &&
          b.width <= 96 &&
          Math.abs(b.width - b.height) < 4 &&
          radius >= b.width * 0.4
        )
      }
      return r.width > 0 && (circle(el) || (el.parentElement !== null && circle(el.parentElement)))
    })
    .map((el) => C.ownText(el))
  const lettered = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter((h) => {
      const parts = [...h.querySelectorAll('span')].filter((s) => s.children.length === 0)
      return (
        parts.length >= 6 &&
        parts.filter((s) => s.textContent.trim().length === 1).length >= parts.length * 0.8
      )
    })
    .map((h) => ({ shows: (h.textContent ?? '').replace(/\s+/g, '').slice(0, 40), id: h.id }))
  // Which headings, by their place among all headings, follow the one before in the same
  // section with no text between them.
  const all = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')].filter(
    (h) => h.getClientRects().length > 0 && h.closest('[aria-hidden="true"]') === null,
  )
  const adjacent = []
  all.forEach((h, i) => {
    if (i === 0) return
    const range = document.createRange()
    range.setStartAfter(all[i - 1])
    range.setEndBefore(h)
    const box = (el) => el.closest('section, header, footer, nav')
    if (range.toString().trim() === '' && box(all[i - 1]) === box(h)) adjacent.push(i)
  })
  return { controls, initials, lettered, adjacent, headings: all.length }
}

async function check(browser, page, viewport) {
  const context = await contextFor(browser, viewport)
  const tab = await context.newPage()
  const findings = []
  const add = (kind, detail) =>
    findings.push({
      templateId: page.templateId,
      page: page.label,
      size: viewport.size,
      kind,
      detail,
    })
  try {
    await open(tab, urlOf(options.base, page, {}))
    await tab.evaluate(installHelpers)
    const facts = await tab.evaluate(domFacts)
    const cdp = await context.newCDPSession(tab)
    const { nodes: flat } = await cdp.send('Accessibility.getFullAXTree')
    // The tree comes as a flat list in no set order; walked from its root through each node's
    // children, it reads as a screen reader reads it.
    const byId = new Map(flat.map((node) => [node.nodeId, node]))
    const nodes = []
    const stack = flat.filter((node) => node.parentId === undefined).reverse()
    while (stack.length > 0) {
      const node = stack.pop()
      nodes.push(node)
      const children = (node.childIds ?? []).map((id) => byId.get(id)).filter(Boolean)
      for (let i = children.length - 1; i >= 0; i -= 1) stack.push(children[i])
    }
    const live = nodes.filter((node) => !node.ignored)
    const name = (node) => squash(node.name?.value)
    // The outline, in document order.
    const headings = live
      .filter((node) => node.role?.value === 'heading')
      .map((node) => ({
        level: Number(node.properties?.find((p) => p.name === 'level')?.value?.value ?? 0),
        name: name(node),
      }))
    const ones = headings.filter((h) => h.level === 1).length
    if (ones !== 1) add('outline', `${String(ones)} h1`)
    const firstOne = headings.findIndex((h) => h.level === 1)
    for (const h of headings.slice(0, Math.max(0, firstOne))) {
      add('outline', `h${String(h.level)} "${h.name.slice(0, 24)}" before the h1`)
    }
    // The tree and the page list the same headings in the same order, so a heading's place
    // among them says whether the page has text between it and the one before.
    const adjacent = new Set(headings.length === facts.headings ? facts.adjacent : [])
    const quote = (h) => `h${String(h.level)} "${h.name.slice(0, 24)}"`
    headings.forEach((h, i) => {
      if (h.name === '') add('outline', `h${String(h.level)} with no name`)
      if (h.name.length > 100) {
        add('outline', `h${String(h.level)} of ${String(h.name.length)} characters`)
      }
      if (h.name.startsWith('©')) add('outline', `${quote(h)}, a copyright line`)
      const before = headings[i - 1]
      if (before === undefined) return
      if (h.level > before.level + 1) add('outline', `${quote(before)} then ${quote(h)}`)
      if (h.level === before.level && adjacent.has(i)) {
        add('outline', `${quote(before)} right before ${quote(h)}`)
      }
    })
    // Names: controls and fields with none, and drawings named as icons.
    for (const node of live) {
      const role = node.role?.value ?? ''
      if (
        ['link', 'button', 'textbox', 'combobox', 'listbox', 'checkbox', 'radio'].includes(role) &&
        name(node) === ''
      ) {
        add('names', `a ${role} with no name`)
      }
      if (
        ['image', 'img', 'graphics-symbol', 'graphics-document', 'SvgRoot'].includes(role) &&
        /\bicons?\b/i.test(name(node))
      ) {
        add('names', `a drawing named "${name(node)}"`)
      }
    }
    // Label in name: a short control's name holds each word it shows.
    for (const control of facts.controls) {
      const words = squash(control.shows).toLowerCase().split(' ').filter(Boolean)
      if (words.length === 0 || words.length > 5) continue
      const locator = tab.locator(`[data-check-control="${control.mark}"]`)
      const snapshot = await locator.ariaSnapshot({ timeout: 2000 }).catch(() => '')
      const named = /^- \w+ "(.*)"/.exec(snapshot)?.[1]?.toLowerCase() ?? ''
      const missing = words.filter(
        (w) => w.replace(/[^\p{L}\p{N}]/gu, '').length >= 2 && !named.includes(w),
      )
      if (named !== '' && missing.length > 0) {
        add('names', `shows "${control.shows.slice(0, 24)}", named "${named.slice(0, 30)}"`)
      }
    }
    for (const letters of facts.initials) add('initials', `"${letters}" read aloud`)
    for (const heading of facts.lettered) {
      const match = headings.find((h) => h.name.replace(/\s+/g, '') === heading.shows)
      if (match === undefined || match.name.includes(' ') === false) {
        add('letters', `"${heading.shows}" has no name read as words`)
      }
    }
    // The template's own expectations.
    const expect = EXPECT[page.templateId]
    if (expect?.menuButtonNamed !== undefined && viewport.phone) {
      const toggle = tab.locator('header button[aria-expanded]').filter({ visible: true }).first()
      const snapshot =
        (await toggle.count()) > 0 ? await toggle.ariaSnapshot({ timeout: 2000 }) : ''
      const named = /^- button "(.*)"/.exec(snapshot)?.[1] ?? ''
      if (!expect.menuButtonNamed.test(named))
        add('expected', `the menu button is named "${named}", not "<label> menu"`)
    }
    return {
      templateId: page.templateId,
      page: page.label,
      size: viewport.size,
      outline: headings,
      findings,
    }
  } finally {
    await context.close()
  }
}

const all = pagesOf(options)
const pages =
  options.limit === null ? [...new Map(all.map((p) => [p.templateId, p])).values()] : all
const browser = await launch()
const work = pages.flatMap((page) => options.sizes.map((viewport) => ({ page, viewport })))
const results = await inPool(work, 3, ({ page, viewport }) => check(browser, page, viewport))
await browser.close()
const lines = [
  `Accessible names and heading outline: ${String(pages.length)} pages (${options.source}), sizes ${options.sizes.map((s) => s.size).join(', ')}.`,
]
for (const templateId of [...new Set(results.map((r) => r.templateId))].sort()) {
  const findings = results.filter((r) => r.templateId === templateId).flatMap((r) => r.findings)
  if (findings.length === 0) {
    lines.push(`${templateId}: meets the rules`)
    continue
  }
  const said = tally(findings, (f) => `${f.kind}: ${f.detail}`)
    .slice(0, 8)
    .map(([k, count]) => `${k}${count > 1 ? ` x${String(count)}` : ''}`)
  lines.push(`${templateId}: ${String(findings.length)} findings: ${said.join('; ')}`)
}
writeReport(outDir(options, 'a11y-names'), results, lines)
