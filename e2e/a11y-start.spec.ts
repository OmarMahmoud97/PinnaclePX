import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// WCAG 2.2 AA on /start, the page that takes a visitor's details: the first question as it
// loads, and the ask's focus in forced colours. a11y-start-order.spec.ts scans the other four
// questions, with their errors, in the order they are asked. Runs on the desktop, the phone and
// the tablet, as the home page's scans do.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. No case here
// means to send one, and this makes sure: every POST to /start, which is how the Server Action
// travels, is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

// axe reads colours as they are painted, so it scans a still page: the question's entrance and
// every colour change over. Only animations that end are waited for, as in a11y.spec.ts.
async function violations(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  // Named by rule and element, so a failure says what to fix rather than printing axe's report.
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(
      ({ target, failureSummary }) => `${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  }))
}

test('the first question has no accessibility violations', async ({ page }) => {
  await page.goto('/start')
  await expect(page.locator('main#main h1')).toBeVisible()
  expect(await violations(page)).toEqual([])
})

// Forced colours drop box shadows, so the ask's focus ring vanishes there; the outline stands in.
test('the ask shows its focus in forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/start')
  await page
    .getByRole('textbox', { name: 'What does your business do?' })
    .fill('Physiotherapy clinic in Sheffield with same-week appointments.')
  await page.keyboard.press('Tab')
  const next = page.getByRole('button', { name: /^Next/ })
  await expect(next).toBeFocused()
  await expect(next).toHaveCSS('outline-style', 'solid')
  await expect(next).toHaveCSS('outline-width', '2px')
})
