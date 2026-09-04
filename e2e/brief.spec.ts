import { expect, type Page, test } from '@playwright/test'

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'

// A one-pixel PNG, enough for the browser to draw a thumbnail.
const PIXEL =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

// The submit test passes a fresh address: an identity that has seen every ready template is
// shown the book-a-call state instead of a design.
async function answerFirstTwo(page: Page, email = 'sam@ashgrove.example') {
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await page.getByLabel('Your name').fill('Sam')
  await page.getByLabel('Company').fill('Ashgrove Physio')
  await page.getByLabel('Email').fill(email)
}

// Which question shows comes from the URL, so a click is only done once the URL has moved.
async function nextTo(page: Page, question: number) {
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
}

test('every call to action on the home page leads to the start page', async ({ page }) => {
  await page.goto('/')
  for (const section of ['#hero', '#how-it-works', '#taster', '#cta']) {
    const link = page
      .locator(section)
      .getByRole('link', { name: /Show me my three designs|Answer the five questions/ })
      .first()
    await expect(link).toHaveAttribute('href', '/start')
  }
})

test('the first question shows alone, with a grey sketch', async ({ page }) => {
  await page.goto('/start')
  await expect(page.getByRole('heading', { level: 1, name: 'First, your business.' })).toBeVisible()
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
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByText(/Tell us a little more/)).toBeVisible()
  await expect(page).toHaveURL(/\/start$/)
})

test('the company name reaches the sketch and the headings', async ({ page }) => {
  await answerFirstTwo(page)
  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch.getByText('ashgrove-physio')).toBeVisible()
  // The headline, the wordmark, the chip, and the phone frame's copies of the first two.
  expect(await sketch.getByText('Ashgrove Physio', { exact: true }).count()).toBeGreaterThanOrEqual(
    3,
  )
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: "Add Ashgrove Physio's logo, or skip it." }),
  ).toBeVisible()
})

test('a question further along than the answers redirects back', async ({ page }) => {
  await page.goto('/start?q=4')
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.getByRole('heading', { level: 1, name: 'First, your business.' })).toBeVisible()
})

test('the browser back button returns to the previous question with answers intact', async ({
  page,
}) => {
  await answerFirstTwo(page)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/q=3$/)
  await page.goBack()
  await expect(page).toHaveURL(/q=2$/)
  await expect(page.getByLabel('Company')).toHaveValue('Ashgrove Physio')
})

test('a refresh keeps the answers and the place', async ({ page }) => {
  await answerFirstTwo(page)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(/q=3$/)
  await page.reload()
  await expect(page).toHaveURL(/q=3$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByLabel('Email')).toHaveValue('sam@ashgrove.example')
})

test('choosing a palette re-tints the sketch', async ({ page }) => {
  await answerFirstTwo(page)
  for (const question of [3, 4, 5]) await nextTo(page, question)
  // Both frames carry the button; the browser frame's is enough.
  const button = page
    .getByRole('region', { name: 'Your brief so far' })
    .getByText('Book with us')
    .first()
  const before = await button.evaluate((el) => getComputedStyle(el).backgroundColor)
  await page.getByRole('radio', { name: 'Plum' }).click()
  await expect
    .poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(before)
})

test('all five questions lead to the confirmation', async ({ page }) => {
  test.skip(test.info().config.metadata.canSubmit !== true, 'needs a database and Inngest')
  const email = `sam+${String(Date.now())}@ashgrove.example`
  await answerFirstTwo(page, email)
  for (const question of [3, 4, 5]) await nextTo(page, question)
  await expect(
    page.getByRole('heading', { level: 1, name: "Pick Ashgrove Physio's colours." }),
  ).toBeVisible()
  // A form finished in under CONFIG.form.minMs is taken for a bot's.
  await page.waitForTimeout(3_000)
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
  await expect(page).toHaveURL(/q=done$/)
  // One design while only Aurora is ready; the sentence follows the count. The pipeline can
  // finish inside the assertion's timeout, so the heading may already say ready.
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /Sam, your designs? (is|are) (on (its|their) way|ready)\./,
    }),
  ).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText(/[45]:\d\d|Ready/)
  // The pipeline names the design as soon as it has chosen the template, then links it.
  const design = page.getByRole('link', { name: 'Aurora' })
  await expect(design).toBeVisible({ timeout: 90_000 })
  await expect(design).toHaveAttribute('href', /\/preview\/[a-km-z2-9]{12}\/t01-aurora$/)
})

test('a logo replaces the mark in both frames and can be removed', async ({ page }) => {
  await answerFirstTwo(page)
  await nextTo(page, 3)
  await page.locator('input[type="file"]').setInputFiles({
    name: 'logo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(PIXEL, 'base64'),
  })
  const remove = page.getByRole('button', { name: 'Remove this logo' })
  await expect(remove).toBeVisible()
  // The browser frame's mark and the phone frame's, both drawn from the file in memory.
  const marks = page.getByRole('region', { name: 'Your brief so far' }).locator('[style*="blob:"]')
  await expect(marks).toHaveCount(2)
  await remove.click()
  await expect(marks).toHaveCount(0)
  await expect(page.getByText('Choose your logo')).toBeVisible()
})

test('own photos sit alongside the style and show in the sketch', async ({ page }) => {
  await answerFirstTwo(page)
  for (const question of [3, 4]) await nextTo(page, question)
  await page.getByRole('radio', { name: 'Dark and moody' }).click()
  await page.locator('input[type="file"]').setInputFiles({
    name: 'shop.png',
    mimeType: 'image/png',
    buffer: Buffer.from(PIXEL, 'base64'),
  })
  await expect(page.getByRole('img', { name: 'shop.png' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Dark and moody' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(page.getByText('Dark and moody, 1 photo', { exact: true })).toBeVisible()
})

test('the page fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/start')
  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch).toBeVisible()
  const box = await sketch.boundingBox()
  // The clipped sketch, its caption and the chips. The heading must still be on the first screen.
  expect(box?.height ?? 0).toBeLessThanOrEqual(320)
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
})
