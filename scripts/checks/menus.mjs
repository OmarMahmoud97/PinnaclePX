// The menu-reach check (decision 15; the check standard's menus line in
// docs/template-fit-decisions.md, Part 3). Every menu a header opens, the phone menu at 390 and
// any drop-down at 1440: a pointer and the Tab key each reach every entry, Escape shuts it, and
// the phone menu gives focus back to its button. A menu's entries are the links its toggle
// brings into view. Started from review/verify-templates/atlas-menu.cjs and menu-focus.cjs.
//
//   node scripts/checks/menus.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     (one page a template unless --limit says more)
import { parseArgs } from './lib/args.mjs'
import { contextFor, inPool, launch, open } from './lib/browser.mjs'
import { installHelpers } from './lib/in-page.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'eval:l6-all-fixes,eval:l7-sentence',
})

// In the page: every link a visitor could use now, by a mark the check gives it.
function usableLinks() {
  const C = window.__checks
  let n = Number(document.body.dataset.checkLinks ?? '0')
  const marks = []
  for (const a of document.querySelectorAll('a[href]')) {
    if (!C.shown(a) || C.decorative(a)) continue
    const r = a.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    // On the screen: a shut sheet slid off its edge is not a menu a visitor can use.
    if (r.right <= 0 || r.left >= window.innerWidth || r.bottom <= 0) continue
    if (!a.hasAttribute('data-check-link')) {
      a.setAttribute('data-check-link', String(n))
      n += 1
    }
    marks.push({
      mark: a.getAttribute('data-check-link'),
      text: (a.textContent ?? '').trim().slice(0, 30),
      href: a.getAttribute('href'),
    })
  }
  document.body.dataset.checkLinks = String(n)
  return marks
}

const activeMark = (tab) =>
  tab.evaluate(() => document.activeElement?.getAttribute('data-check-link') ?? null)

// The menu's toggle, by a mark the check gives it: a template may re-render its buttons as a
// menu opens, so a locator by position could point at another one by then.
const toggleOf = (tab) => tab.locator('[data-check-toggle]')

// How many of these links a visitor can use now: a menu is open while its entries are.
const drawn = (tab, marks) =>
  tab.evaluate(
    (ms) =>
      ms.filter((m) => {
        const a = document.querySelector(`[data-check-link="${m}"]`)
        if (a === null || !window.__checks.shown(a) || window.__checks.decorative(a)) return false
        const r = a.getBoundingClientRect()
        return (
          r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight
        )
      }).length,
    marks,
  )

// The links a toggle brings into view: those usable after it opens and not before.
async function opened(tab, how) {
  const before = new Set((await tab.evaluate(usableLinks)).map((l) => l.mark))
  const toggle = toggleOf(tab)
  if (how === 'click') await toggle.click({ timeout: 3000 })
  else {
    await toggle.focus({ timeout: 3000 })
    await tab.keyboard.press('Enter')
  }
  await tab.waitForTimeout(500)
  return (await tab.evaluate(usableLinks)).filter((l) => !before.has(l.mark))
}

// Mark the toggle a phase works with, and say what it is.
async function mark(toggle) {
  return toggle.evaluate((el) => {
    for (const other of document.querySelectorAll('[data-check-toggle]')) {
      other.removeAttribute('data-check-toggle')
    }
    el.setAttribute('data-check-toggle', '')
    return {
      label: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim(),
      controls: el.getAttribute('aria-controls'),
    }
  })
}

// The pointer: opened by a click, every entry must take a click (nothing else would receive
// it: Playwright's own check of what receives the pointer), and a click on the first in-page
// entry must land, changing the address.
async function pointerPhase(tab, add, name) {
  let entries
  try {
    entries = await opened(tab, 'click')
  } catch {
    // Playwright found no point of the toggle a pointer could press: off the screen, or
    // under something else.
    add({ menu: name, kind: 'toggle-unreachable' })
    return
  }
  if (entries.length === 0) {
    add({ menu: name, kind: 'no-entries', detail: 'a click shows no new link' })
    return
  }
  for (const entry of entries) {
    try {
      await tab.locator(`[data-check-link="${entry.mark}"]`).click({ trial: true, timeout: 2000 })
    } catch {
      add({ menu: name, kind: 'pointer-blocked', entry: entry.text })
    }
  }
  const first = entries.find((e) => e.href?.startsWith('#') === true && e.href.length > 1)
  if (first === undefined) return
  await tab
    .locator(`[data-check-link="${first.mark}"]`)
    .click({ timeout: 2000 })
    .catch(() => undefined)
  await tab.waitForTimeout(300)
  const hash = await tab.evaluate(() => location.hash)
  if (hash !== first.href) {
    add({
      menu: name,
      kind: 'click-lost',
      entry: first.text,
      detail: `address ${hash || '(none)'}`,
    })
  }
}

// The keyboard: Enter on the toggle, then Tab until every entry is reached or focus has gone
// well past them.
async function keyboardPhase(tab, add, name) {
  const keyed = await opened(tab, 'keyboard')
  if (keyed.length === 0) {
    add({ menu: name, kind: 'tab-missed', detail: 'Enter on the toggle shows no link' })
    return
  }
  const want = new Set(keyed.map((e) => e.mark))
  const reached = new Set()
  for (let i = 0; i < keyed.length + 12 && reached.size < want.size; i += 1) {
    await tab.keyboard.press('Tab')
    const at = await activeMark(tab)
    if (at !== null && want.has(at)) reached.add(at)
  }
  for (const entry of keyed.filter((e) => !reached.has(e.mark))) {
    add({ menu: name, kind: 'tab-missed', entry: entry.text })
  }
}

// Escape, from inside a menu the keyboard opened: it must shut, and the phone menu must give
// focus back to its toggle, or to the button that stands for it while the menu is open.
async function escapePhase(tab, add, name, kind, facts) {
  const entries = await opened(tab, 'keyboard')
  if (entries.length === 0) return
  // Into the menu first, as a visitor does before deciding to leave it.
  await tab.keyboard.press('Tab')
  await tab.keyboard.press('Escape')
  await tab.waitForTimeout(400)
  if (
    (await drawn(
      tab,
      entries.map((e) => e.mark),
    )) > 0
  ) {
    add({ menu: name, kind: 'escape-ignored' })
    return
  }
  if (kind !== 'phone') return
  const back = await tab.evaluate((f) => {
    const a = document.activeElement
    if (a === null) return false
    if (a.hasAttribute('data-check-toggle')) return true
    if (a.tagName !== 'BUTTON') return false
    return (
      (f.controls !== null && a.getAttribute('aria-controls') === f.controls) ||
      (a.getAttribute('aria-label') ?? a.textContent ?? '').trim() === f.label
    )
  }, facts)
  if (!back) {
    const at = await tab.evaluate(() => {
      const a = document.activeElement
      return a === null
        ? 'nothing'
        : `${a.tagName.toLowerCase()} "${(a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 20)}"`
    })
    add({ menu: name, kind: 'focus-lost', detail: `focus on ${at}` })
  }
}

// The visible toggles at a size, on a fresh load: header buttons that open something.
async function visibleToggles(tab) {
  const all = tab.locator('header button[aria-expanded], nav button[aria-expanded]')
  const shown = []
  for (let i = 0; i < (await all.count()); i += 1) {
    if (await all.nth(i).isVisible()) shown.push(i)
  }
  return shown
}

async function check(browser, page) {
  const findings = []
  for (const [size, viewport, kind] of [
    ['390x844', { width: 390, height: 844, phone: true }, 'phone'],
    ['1440x900', { width: 1440, height: 900, phone: false }, 'drop-down'],
  ]) {
    const add = (f) => findings.push({ templateId: page.templateId, page: page.label, size, ...f })
    // Each phase on a page of its own, so one phase's state never leaks into the next.
    const fresh = async (work) => {
      const context = await contextFor(browser, viewport)
      const tab = await context.newPage()
      try {
        await open(tab, urlOf(options.base, page, {}))
        await tab.evaluate(installHelpers)
        return await work(tab)
      } finally {
        await context.close()
      }
    }
    const indices = await fresh(visibleToggles)
    if (kind === 'phone' && indices.length === 0) add({ menu: 'phone', kind: 'no-toggle' })
    for (const index of kind === 'phone' ? indices.slice(0, 1) : indices) {
      for (const phase of ['pointer', 'keyboard', 'escape']) {
        await fresh(async (tab) => {
          const toggle = tab
            .locator('header button[aria-expanded], nav button[aria-expanded]')
            .nth(index)
          const facts = await mark(toggle)
          const name = `${kind} "${facts.label.slice(0, 20)}"`
          try {
            if (phase === 'pointer') await pointerPhase(tab, add, name)
            else if (phase === 'keyboard') await keyboardPhase(tab, add, name)
            else await escapePhase(tab, add, name, kind, facts)
          } catch (error) {
            const first = String(error).split(/\r?\n/)[0] ?? ''
            add({ menu: name, kind: 'error', detail: `${phase}: ${first.slice(0, 100)}` })
          }
        })
      }
    }
  }
  return findings
}

const all = pagesOf(options)
const pages =
  options.limit === null ? [...new Map(all.map((p) => [p.templateId, p])).values()] : all
const browser = await launch()
const results = (await inPool(pages, 3, (page) => check(browser, page))).flat()
await browser.close()
const lines = [
  `Menu reach: ${String(pages.length)} pages (${options.source}), the phone menu at 390 and any drop-down at 1440.`,
]
for (const templateId of [...new Set(pages.map((p) => p.templateId))].sort()) {
  const mine = results.filter((r) => r.templateId === templateId)
  if (mine.length === 0) {
    lines.push(`${templateId}: every entry reached by pointer and Tab; Escape shuts; focus returns`)
    continue
  }
  const said = [
    ...new Set(
      mine.map(
        (r) =>
          `${r.size} ${r.menu}: ${r.kind}${r.entry === undefined ? '' : ` (${r.entry})`}${r.detail === undefined ? '' : ` [${r.detail}]`}`,
      ),
    ),
  ]
  lines.push(`${templateId}: ${String(mine.length)} findings: ${said.slice(0, 8).join('; ')}`)
}
writeReport(outDir(options, 'menus'), results, lines)
