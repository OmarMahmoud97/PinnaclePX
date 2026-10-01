import { expect, type Page, test } from '@playwright/test'

// The owner's pages on a phone (ADR 0047): nothing wider than the screen at 360 and 390, every
// row and every control tall enough for a thumb, a new brief announced to a screen reader, every
// row a plain link to its brief with no fragment, and the example's buttons doing nothing.
const PAGE = '/examples/admin'

async function scrollWidth(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth)
}

test('fits the phone at 390 and 360', async ({ page }) => {
  await page.goto(PAGE)
  await expect(page.locator('main#main h1')).toBeVisible()
  expect(await scrollWidth(page)).toBeLessThanOrEqual(390)
  await page.setViewportSize({ width: 360, height: 780 })
  expect(await scrollWidth(page)).toBeLessThanOrEqual(360)
})

test('rows are links to briefs, tall enough, and a new one says so', async ({ page }) => {
  await page.goto(PAGE)
  const rows = page.locator('main ol > li > a')
  await expect(rows).toHaveCount(4)
  for (const row of await rows.all()) {
    const href = await row.getAttribute('href')
    expect(href).toMatch(/^\/admin\/[a-z0-9]+$/)
    expect(href).not.toContain('#')
    const box = await row.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(56)
  }
  await expect(rows.first().locator('.sr-only')).toHaveText('New.')
})

test('every control on the panel is a thumb target and does nothing on the example', async ({
  page,
}) => {
  await page.goto(PAGE)
  // The form's first submit button is hidden and disabled on purpose, so Enter in a field does
  // nothing; every visible control is a thumb target.
  const buttons = page.locator('form button:not([aria-hidden="true"])')
  expect(await buttons.count()).toBeGreaterThanOrEqual(6)
  for (const button of await buttons.all()) {
    await expect(button).toBeDisabled()
    const box = await button.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40)
  }
  const strip = page.locator('section[aria-labelledby="needs-you"] li')
  expect(await strip.count()).toBeGreaterThanOrEqual(3)
})

test('Enter in a field does nothing, so a key press can never press a button', async ({ page }) => {
  await page.goto(PAGE)
  const before = page.url()
  const quote = page.locator('form input[name="quotePounds"]')
  await quote.focus()
  await quote.press('Enter')
  await page.waitForTimeout(300)
  expect(page.url()).toBe(before)
  await expect(page.locator('main#main h1')).toBeVisible()
})
