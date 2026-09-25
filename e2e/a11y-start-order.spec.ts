import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { PIXEL_PNG, refuseSends, withDraft } from './helpers/start'

// WCAG 2.2 AA on /start in its new order (docs/start-page-journey-plan.md, package P3), at the
// desktop, the phone and the tablet: the first question as the hero's short sentence leaves it,
// the name question with its error and with a logo on its way, the look question, the colour
// question with a hex code that does not read, and in forced colours with a colour chosen, and
// the last question with both its errors. Nothing here sends a brief or stores a file.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

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

test("the first question, as the hero's short sentence leaves it, has no violations", async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#hero').getByRole('textbox').fill('Bike repair')
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.getByText('Nearly there. Add a little more about what you do.')).toBeVisible()
  expect(await violations(page)).toEqual([])
})

test('the name question with its error has no violations', async ({ page }) => {
  await withDraft(page, { reached: 1, company: '' })
  await page.goto('/start?q=2')
  await expect(heading(page)).toHaveText('Put your name on it.')
  await page.getByRole('button', { name: 'Next: pick a look' }).click()
  await expect(page.getByText('Tell us your business name.', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Business name' })).toBeFocused()
  expect(await violations(page)).toEqual([])
})

test('the name question with a logo on its way has no violations', async ({ page }) => {
  // The upload's token request is left unanswered, so the logo stays on its way.
  await page.route('**/api/upload**', () => {
    // Left unanswered on purpose.
  })
  await withDraft(page, { reached: 1 })
  await page.goto('/start?q=2')
  await page.getByRole('radio', { name: /Use my logo/ }).click()
  await page.getByLabel('Choose a file').setInputFiles(PIXEL_PNG)
  await expect(page.getByText('Uploading your logo.')).toBeVisible()
  expect(await violations(page)).toEqual([])
})

test('the look question has no violations', async ({ page }) => {
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await expect(heading(page)).toHaveText('Pick a look.')
  expect(await violations(page)).toEqual([])
})

test('the colour question with a broken hex has no violations', async ({ page }) => {
  // One digit short: the slip a visitor typing their brand colour makes.
  await withDraft(page, { reached: 3, colours: { kind: 'custom', hex: '#2f6f4' } })
  await page.goto('/start?q=4')
  await expect(heading(page)).toHaveText('Choose a colour.')
  await page.getByRole('button', { name: 'Next: one last step' }).click()
  await expect(page.getByText('Use a hex code such as #2F6F4E.', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Hex code' })).toBeFocused()
  expect(await violations(page)).toEqual([])
})

// Forced colours drop box shadows and fills, so a chosen card is marked by its own border and each
// swatch keeps the colour it shows (docs/start-page-journey-plan.md, 9.4).
test('the colour question in forced colours, a colour chosen, has no violations', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await withDraft(page, { reached: 3 })
  await page.goto('/start?q=4')
  const plum = page.getByRole('radio', { name: 'Plum' })
  await plum.click()
  await expect(plum).toHaveAttribute('aria-checked', 'true')
  await expect(plum).toHaveCSS('border-top-width', '2px')
  expect(await violations(page)).toEqual([])
})

test('the last question with both its errors has no violations', async ({ page }) => {
  await withDraft(page, { reached: 4, name: '', email: '' })
  await page.goto('/start?q=5')
  await expect(heading(page)).toHaveText('Where should we send them?')
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
  for (const message of ['That does not look like an email address.', 'Tell us your name.']) {
    await expect(page.getByText(message, { exact: true })).toBeVisible()
  }
  // The focus moves to the first control marked invalid, which reads its message.
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused()
  expect(await violations(page)).toEqual([])
})
