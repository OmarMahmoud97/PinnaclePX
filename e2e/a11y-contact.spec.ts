import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { REFUSED, SENDING, WRITE } from '@/app/contact/_components/contact-copy'
import {
  answerContact,
  holdContact,
  hydrated,
  refuseContactSends,
  SEND_SETTLES_MS,
  settled,
  stubCal,
} from './helpers/contact'

// WCAG 2.2 AA on /contact (ADR 0040), a page that takes a visitor's details: every state the
// form can be in, the open calendar and the open phone menu, and the focus of every control in
// both cards in forced colours. Runs on the desktop, the phone and the tablet, as the other scans
// do. No send leaves the browser: each is held or answered here.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

test.beforeEach(async ({ page }) => {
  await refuseContactSends(page)
})

// Named by rule and element, so a failure says what to fix rather than printing axe's report.
async function violations(page: Page) {
  await settled(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(
      ({ target, failureSummary }) => `${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  }))
}

// While the form has the focus the page's ink withdraws, and the H1 then sits on white alone.
// It paints #0f0f0f there, its #f0f0f0 turned by the difference blend, but axe compares the
// #f0f0f0 with the white and reports 1.13:1. With the ink on screen axe cannot read the ground
// under the blend and leaves the H1 for a person to check, as it does the home page's hero (ADR
// 0040). So a state reached with the focus in the form is scanned once the focus has left it and
// the ink has come back, which a visitor's own click elsewhere does. The state itself stands.
async function leaveTheForm(page: Page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  })
}

// One visit through every state, in the order a visitor meets them: as the page loads, with the
// fields marked, while the message is on its way, refused, and sent. The status line is watched
// through the send: it says its words once, however long the answer takes.
test('every state of the form has no accessibility violations', async ({ page }) => {
  await page.goto('/contact')
  await hydrated(page)
  expect(await violations(page), 'as it loads').toEqual([])

  const send = page.locator('#hero-cta')
  await send.click()
  await expect(page.getByRole('textbox', { name: WRITE.messageLabel })).toBeFocused()
  await leaveTheForm(page)
  expect(await violations(page), 'with every field marked').toEqual([])

  await page.getByRole('textbox', { name: WRITE.messageLabel }).fill('Do you build sites?')
  await page.getByRole('textbox', { name: WRITE.name }).fill('Sam')
  await page.getByRole('textbox', { name: WRITE.email, exact: true }).fill('sam@example.com')
  const status = page.locator('#write [role="status"]')
  await status.evaluate((line) => {
    new MutationObserver(() => {
      const said = line.getAttribute('data-said') ?? ''
      line.setAttribute('data-said', `${said}|${line.textContent}`)
    }).observe(line, { childList: true, characterData: true, subtree: true })
  })
  const held = await holdContact(page)
  await send.click()
  await held.arrived
  await expect(status).toHaveText(SENDING.status)
  await leaveTheForm(page)
  expect(await violations(page), 'while the message is on its way').toEqual([])
  const said = (await status.getAttribute('data-said')) ?? ''
  expect(said.split('|').filter((words) => words === SENDING.status)).toHaveLength(1)

  held.release({ ok: false, reason: 'too_many' })
  await expect(page.locator('#contact-alert')).toContainText(REFUSED.too_many)
  await leaveTheForm(page)
  expect(await violations(page), 'refused').toEqual([])

  await answerContact(page, { ok: true, value: null })
  await send.click()
  await expect(page.locator('#contact-sent-heading')).toBeFocused({ timeout: SEND_SETTLES_MS })
  expect(await violations(page), 'sent').toEqual([])
})

test('the open calendar has no accessibility violations', async ({ page }) => {
  await stubCal(page)
  await page.goto('/contact')
  await hydrated(page)
  await page.locator('#call button[aria-controls="booking"]').click()
  await expect(page.locator('#booking [data-cal]')).toHaveAttribute('data-cal', 'ready')
  expect(await violations(page)).toEqual([])
})

// axe treats inert content as hidden, and the page under the open menu is inert, so the menu is
// scanned on its own. Only a phone shows the menu's button.
test('the open menu has no accessibility violations', async ({ page }) => {
  await page.goto('/contact')
  await hydrated(page)
  const menu = page.getByRole('button', { name: 'Menu' })
  test.skip(!(await menu.isVisible()), 'the menu is a phone’s')
  await menu.click()
  expect(await violations(page)).toEqual([])
})

// Forced colours drop box shadows, so a ring drawn with one vanishes there. Every control in
// the two cards is reached by Tab, as a keyboard reaches it, and must show an outline, or for a
// text field the edge forced colours give it.
test('every control in both cards shows its focus in forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/contact')
  await hydrated(page)
  type Focus = Readonly<{ control: string; shown: boolean; where: 'before' | 'cards' | 'after' }>
  const seen: Focus[] = []
  for (let press = 0; press < 40; press += 1) {
    await page.keyboard.press('Tab')
    const focus = await page.evaluate((): Focus => {
      const control = document.activeElement ?? document.body
      const style = getComputedStyle(control)
      const field = control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement
      const name = control.getAttribute('aria-label') ?? control.textContent
      return {
        control: `${control.tagName.toLowerCase()} ${name.trim().slice(0, 40)}`,
        shown:
          (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
          (field && Number.parseFloat(style.borderTopWidth) > 0),
        where:
          control.closest('#write, #call') !== null
            ? 'cards'
            : control.closest('#answers, footer') === null
              ? 'before'
              : 'after',
      }
    })
    if (focus.where === 'after') break
    if (focus.where === 'cards') seen.push(focus)
  }
  expect(seen.length).toBeGreaterThanOrEqual(7)
  expect(seen.filter((focus) => !focus.shown)).toEqual([])
})
