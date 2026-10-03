// The menu check (decision 15; the check standard's menus line in
// docs/template-fit-decisions.md, Part 3). Every menu a header opens, the phone menu at 390 and
// any drop-down at 1440: a pointer and the Tab key each reach every entry, and Escape shuts it.
// The phone menu's focus follows the rules decided on 2 October 2026:
//
//   open-focus    once it opens, focus is in it, or the next Tab reaches it
//   back          once it shuts without a link followed (Escape, its close button, a press
//                 outside it), focus is back on its button; a menu a press outside leaves open
//                 is noted, not failed
//   choose        once a link in it is chosen, focus goes to the link's target, never back to the
//                 button: focus is in the target, or the next Tab lands in it or past it (tried
//                 with the first entry whose target does not hold the button)
//
// A menu's entries are the links its toggle brings into view; the menu is the element the toggle
// controls (aria-controls), else the smallest box that holds every entry. Started from
// review/verify-templates/atlas-menu.cjs and menu-focus.cjs.
//
//   node scripts/checks/menus.mjs --base http://localhost:3120 [options in lib/args.mjs]
//     (one page a template unless --limit says more)
import { parseArgs } from './lib/args.mjs'
import { inPool, launch, open, withTab } from './lib/browser.mjs'
import { installHelpers } from './lib/in-page.mjs'
import { pagesOf, urlOf } from './lib/pages.mjs'
import { outDir, writeReport } from './lib/report.mjs'

const options = parseArgs(process.argv.slice(2), {
  source: 'corpus',
  kind: 'model',
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

// In the page: mark the open menu, the element the toggle controls when it is drawn, else the
// smallest box that holds every entry.
function markMenu({ marks, controls }) {
  for (const old of document.querySelectorAll('[data-check-menu]')) {
    old.removeAttribute('data-check-menu')
  }
  const entries = marks
    .map((m) => document.querySelector(`[data-check-link="${m}"]`))
    .filter((e) => e !== null)
  let menu = controls === null ? null : document.getElementById(controls)
  if (menu === null || menu.getClientRects().length === 0) {
    menu = entries[0]?.parentElement ?? null
    while (menu !== null && !entries.every((e) => menu.contains(e))) menu = menu.parentElement
  }
  menu?.setAttribute('data-check-menu', '')
}

// In the page: where focus is, as a finding says it, and whether it is in the open menu (the
// toggle itself is not).
function focusFacts() {
  const a = document.activeElement
  const label =
    a === null || a === document.body
      ? 'the page'
      : `${a.tagName.toLowerCase()} "${(a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 24)}"`
  const inMenu =
    a !== null &&
    a !== document.body &&
    !a.hasAttribute('data-check-toggle') &&
    a.closest('[data-check-menu]') !== null
  return { label, inMenu }
}

// In the page: whether focus is on the menu's button, or on the button that stands for it while
// the menu is open (one that controls the same element, or bears the same name).
function onToggle(facts) {
  const a = document.activeElement
  if (a === null) return false
  if (a.hasAttribute('data-check-toggle')) return true
  if (a.tagName !== 'BUTTON') return false
  return (
    (facts.controls !== null && a.getAttribute('aria-controls') === facts.controls) ||
    (a.getAttribute('aria-label') ?? a.textContent ?? '').trim() === facts.label
  )
}

// The links a toggle brings into view: those usable after it opens and not before. The menu
// they open is marked for the focus checks.
async function opened(tab, how, facts) {
  const before = new Set((await tab.evaluate(usableLinks)).map((l) => l.mark))
  const toggle = toggleOf(tab)
  if (how === 'click') await toggle.click({ timeout: 3000 })
  else {
    await toggle.focus({ timeout: 3000 })
    await tab.keyboard.press('Enter')
  }
  await tab.waitForTimeout(500)
  const entries = (await tab.evaluate(usableLinks)).filter((l) => !before.has(l.mark))
  if (facts !== undefined) {
    await tab.evaluate(markMenu, { marks: entries.map((e) => e.mark), controls: facts.controls })
  }
  return entries
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

// Whether the menu has shut: none of its entries can be used.
const shut = async (tab, entries) =>
  (await drawn(
    tab,
    entries.map((e) => e.mark),
  )) === 0

// After the menu shut without a link followed: the phone menu's focus must be on its button.
async function focusBack(tab, add, name, facts, how) {
  if (await tab.evaluate(onToggle, facts)) return
  const { label } = await tab.evaluate(focusFacts)
  add({ menu: name, kind: 'focus-lost', detail: `after ${how}, focus on ${label}` })
}

// Escape, from inside a menu the keyboard opened: it must shut, and the phone menu must give
// focus back to its toggle.
async function escapePhase(tab, add, name, kind, facts) {
  const entries = await opened(tab, 'keyboard', facts)
  if (entries.length === 0) return
  // Into the menu first, as a visitor does before deciding to leave it.
  await tab.keyboard.press('Tab')
  await tab.keyboard.press('Escape')
  await tab.waitForTimeout(400)
  if (!(await shut(tab, entries))) {
    add({ menu: name, kind: 'escape-ignored' })
    return
  }
  if (kind === 'phone') await focusBack(tab, add, name, facts, 'Escape')
}

// Opened by the keyboard, focus must be in the menu, or reach it with the next Tab.
async function openFocusPhase(tab, add, name, facts) {
  const entries = await opened(tab, 'keyboard', facts)
  if (entries.length === 0) return
  if ((await tab.evaluate(focusFacts)).inMenu) return
  await tab.keyboard.press('Tab')
  const after = await tab.evaluate(focusFacts)
  if (!after.inMenu) {
    add({
      menu: name,
      kind: 'open-focus',
      detail: `the first Tab after opening went to ${after.label}`,
    })
  }
}

// In the page: the open menu's own close button, marked: a button in the menu, or one that came
// into view as it opened, named for closing. Null when the toggle is its only way to shut.
function markClose(shownBefore) {
  const named = (b) =>
    /\b(close|dismiss)\b/i.test(b.getAttribute('aria-label') ?? b.textContent ?? '')
  const close = [...document.querySelectorAll('button')].find(
    (b) =>
      !b.hasAttribute('data-check-toggle') &&
      window.__checks.shown(b) &&
      named(b) &&
      (b.closest('[data-check-menu]') !== null || !shownBefore.includes(b.dataset.checkButton)),
  )
  if (close === undefined) return null
  close.setAttribute('data-check-close', '')
  return (close.getAttribute('aria-label') ?? close.textContent ?? '').trim().slice(0, 24)
}

// In the page: every button drawn now, by a mark, so the close button can be told from the rest.
function shownButtons() {
  let n = 0
  return [...document.querySelectorAll('button')]
    .filter((b) => window.__checks.shown(b))
    .map((b) => {
      b.dataset.checkButton = String(n)
      n += 1
      return b.dataset.checkButton
    })
}

// The close button, pressed from the keyboard: the menu must shut and focus be on its button.
// With no close button of its own, the toggle is pressed again.
async function closeButtonPhase(tab, add, name, facts) {
  const before = await tab.evaluate(shownButtons)
  const entries = await opened(tab, 'keyboard', facts)
  if (entries.length === 0) return
  const close = await tab.evaluate(markClose, before)
  const button = close === null ? toggleOf(tab) : tab.locator('[data-check-close]')
  await button.focus({ timeout: 3000 })
  await tab.keyboard.press('Enter')
  await tab.waitForTimeout(400)
  const what = close === null ? 'its button pressed again' : `its close button "${close}"`
  if (!(await shut(tab, entries))) {
    add({ menu: name, kind: 'close-ignored', detail: what })
    return
  }
  await focusBack(tab, add, name, facts, what)
}

// In the page: a point a pointer can press outside the open menu, on nothing that acts (no link,
// button or field), or null when the menu covers the whole screen.
function outsidePoint() {
  const acts = 'a, button, input, select, textarea, label, summary, [role="button"], [tabindex]'
  for (let y = window.innerHeight - 12; y > 12; y -= 24) {
    for (let x = 12; x < window.innerWidth - 12; x += 24) {
      const at = document.elementFromPoint(x, y)
      if (at === null || at.closest('[data-check-menu], [data-check-toggle], ' + acts) !== null) {
        continue
      }
      return { x, y }
    }
  }
  return null
}

// A press outside the open menu (a pointer user leaving it): if the menu shuts, focus must be on
// its button. A menu that stays open is noted, not failed: the rule says where focus goes when a
// press outside shuts the menu, not that it must. One that covers the screen has no outside.
async function outsidePhase(tab, add, name, facts) {
  const entries = await opened(tab, 'click', facts)
  if (entries.length === 0) return
  const point = await tab.evaluate(outsidePoint)
  if (point === null) return
  await tab.mouse.click(point.x, point.y)
  await tab.waitForTimeout(400)
  if (!(await shut(tab, entries))) {
    add({
      menu: name,
      kind: 'outside-ignored',
      detail: `a press at ${String(point.x)},${String(point.y)}`,
    })
    return
  }
  await focusBack(tab, add, name, facts, 'a press outside')
}

// In the page: whether focus is in the section a link leads to, or (with after) past its start,
// so the next Tab continues from the section chosen; and where focus is.
function focusAtTarget({ hash, after }) {
  const target = document.getElementById(decodeURIComponent(hash.slice(1)))
  const a = document.activeElement
  if (target === null) return { ok: false, label: `no element ${hash}` }
  const label =
    a === null || a === document.body
      ? 'the page'
      : `${a.tagName.toLowerCase()} "${(a.getAttribute('aria-label') ?? a.textContent ?? '').trim().slice(0, 24)}"`
  if (a === null || a === document.body || a.hasAttribute('data-check-toggle')) {
    return { ok: false, label }
  }
  const inside = a === target || target.contains(a)
  const past = (target.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  return { ok: inside || (after && past), label }
}

// In the page: the in-page addresses whose target lies apart from the menu's button. A target
// that holds the button (#top, or a hero the header sits in) holds wherever focus goes back to,
// so it cannot tell a focus that followed the link from one sent back to the button.
function apartFromToggle(hrefs) {
  const toggle = document.querySelector('[data-check-toggle]')
  return hrefs.filter((href) => {
    const target = document.getElementById(decodeURIComponent(href.slice(1)))
    return target !== null && (toggle === null || !target.contains(toggle))
  })
}

// A link chosen from the keyboard: Tab to the first in-page entry whose target lies apart from
// the menu's button, Enter. Focus must be in its target, or the next Tab must land in the
// target or past its start, never on the menu's button or back at the top of the page.
async function choosePhase(tab, add, name, facts) {
  const entries = await opened(tab, 'keyboard', facts)
  const inPage = entries.filter((e) => e.href?.startsWith('#') === true && e.href.length > 1)
  const apart = await tab.evaluate(
    apartFromToggle,
    inPage.map((e) => e.href),
  )
  const first = inPage.find((e) => apart.includes(e.href))
  if (first === undefined) {
    if (inPage.length > 0) {
      add({ menu: name, kind: 'choose-untried', detail: 'every entry leads to a block holding it' })
    }
    return
  }
  let reached = false
  for (let i = 0; i < entries.length + 12 && !reached; i += 1) {
    await tab.keyboard.press('Tab')
    reached = (await activeMark(tab)) === first.mark
  }
  if (!reached) return // the reach phase reports it
  await tab.keyboard.press('Enter')
  await tab.waitForTimeout(500)
  // Back on the button fails at once: the next Tab from a button just above the first section
  // would land in that section and pass.
  if (await tab.evaluate(onToggle, facts)) {
    add({
      menu: name,
      kind: 'choose-focus',
      entry: first.text,
      detail: `after Enter, focus back on its button, not in ${first.href}`,
    })
    return
  }
  const now = await tab.evaluate(focusAtTarget, { hash: first.href, after: false })
  if (now.ok) return
  await tab.keyboard.press('Tab')
  const next = await tab.evaluate(focusAtTarget, { hash: first.href, after: true })
  if (!next.ok) {
    add({
      menu: name,
      kind: 'choose-focus',
      entry: first.text,
      detail: `after Enter, focus on ${now.label}; the next Tab went to ${next.label}, not into ${first.href}`,
    })
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

const PHONE_PHASES = ['pointer', 'keyboard', 'escape', 'open-focus', 'close', 'outside', 'choose']
// Kinds reported for the record and not counted as failures: a menu a press outside leaves open,
// and a menu whose every in-page entry leads to a block holding its button (choosePhase).
const NOTES = ['outside-ignored', 'choose-untried']
const DROP_DOWN_PHASES = ['pointer', 'keyboard', 'escape']

async function check(browser, page) {
  const findings = []
  for (const [size, viewport, kind] of [
    ['390x844', { width: 390, height: 844, phone: true }, 'phone'],
    ['1440x900', { width: 1440, height: 900, phone: false }, 'drop-down'],
  ]) {
    const add = (f) =>
      findings.push({
        templateId: page.templateId,
        page: page.label,
        size,
        ...f,
        note: NOTES.includes(f.kind),
      })
    // Each phase on a page of its own, so one phase's state never leaks into the next.
    const fresh = (work) =>
      withTab(browser, viewport, async (tab) => {
        await open(tab, urlOf(options.base, page, {}))
        await tab.evaluate(installHelpers)
        return work(tab)
      })
    const indices = await fresh(visibleToggles)
    if (kind === 'phone' && indices.length === 0) add({ menu: 'phone', kind: 'no-toggle' })
    for (const index of kind === 'phone' ? indices.slice(0, 1) : indices) {
      for (const phase of kind === 'phone' ? PHONE_PHASES : DROP_DOWN_PHASES) {
        await fresh(async (tab) => {
          const toggle = tab
            .locator('header button[aria-expanded], nav button[aria-expanded]')
            .nth(index)
          const facts = await mark(toggle)
          const name = `${kind} "${facts.label.slice(0, 20)}"`
          try {
            if (phase === 'pointer') await pointerPhase(tab, add, name)
            else if (phase === 'keyboard') await keyboardPhase(tab, add, name)
            else if (phase === 'escape') await escapePhase(tab, add, name, kind, facts)
            else if (phase === 'open-focus') await openFocusPhase(tab, add, name, facts)
            else if (phase === 'close') await closeButtonPhase(tab, add, name, facts)
            else if (phase === 'outside') await outsidePhase(tab, add, name, facts)
            else await choosePhase(tab, add, name, facts)
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
  `Menus: ${String(pages.length)} pages (${options.source}), the phone menu at 390 (reach, Escape and the focus rules) and any drop-down at 1440 (reach and Escape).`,
]
// What a finding says, in a summary line.
const said = (rows) => [
  ...new Set(
    rows.map(
      (r) =>
        `${r.size} ${r.menu}: ${r.kind}${r.entry === undefined ? '' : ` (${r.entry})`}${r.detail === undefined ? '' : ` [${r.detail}]`}`,
    ),
  ),
]
for (const templateId of [...new Set(pages.map((p) => p.templateId))].sort()) {
  const mine = results.filter((r) => r.templateId === templateId)
  const fails = mine.filter((r) => !NOTES.includes(r.kind))
  const notes = mine.filter((r) => NOTES.includes(r.kind))
  const noted = notes.length === 0 ? '' : ` (noted, not failed: ${said(notes).join('; ')})`
  if (fails.length === 0) {
    lines.push(
      `${templateId}: every entry reached by pointer and Tab; Escape shuts; focus moves in, comes back and follows a chosen link${noted}`,
    )
    continue
  }
  lines.push(
    `${templateId}: ${String(fails.length)} findings: ${said(fails).slice(0, 10).join('; ')}${noted}`,
  )
}
writeReport(outDir(options, 'menus'), results, lines)
