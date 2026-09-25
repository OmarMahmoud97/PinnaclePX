import { expect, test } from '@playwright/test'
import { refuseSends } from './helpers/start'

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'

// Nothing here sends a brief or stores a file.
test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('every call to action on the home page leads to the start page', async ({ page }) => {
  await page.goto('/')
  for (const section of ['#hero', '#work', '#how-it-works', '#cta']) {
    const link = page
      .locator(section)
      .getByRole('link', { name: /Show me my three designs|Answer the five questions/ })
      .first()
    await expect(link).toHaveAttribute('href', '/start')
  }
})

test('the first question shows alone, beside a blank draft', async ({ page }) => {
  await page.goto('/start')
  await expect(page.locator('main#main h1')).toBeVisible()
  await expect(page.getByLabel('Your name')).toHaveCount(0)
  await expect(page.getByText('Your brief so far is empty.')).toBeAttached()
})

test('the sketch fills in with the sentence as it is typed', async ({ page }) => {
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch.getByText(SENTENCE).first()).toBeVisible()
})

test('a short answer stays on the first question with a message', async ({ page }) => {
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill('We sell things')
  await page.getByRole('button', { name: /^Next/ }).click()
  await expect(page.getByText(/Tell us a little more/)).toBeVisible()
  await expect(page).toHaveURL(/\/start$/)
})

test('a question further along than the answers redirects back', async ({ page }) => {
  await page.goto('/start?q=4')
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.locator('main#main h1')).toBeVisible()
})

test('the page fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/start')
  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch).toBeVisible()
  const box = await sketch.boundingBox()
  // The island's clearance, the window onto the draft (its phone frame at its own size, 212 px
  // under its bar) and the pooled curve; the browser frame and the caption show from lg only
  // (ADR 0037). The heading must still be on the first screen.
  expect(box?.height ?? 0).toBeLessThanOrEqual(320)
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
})
