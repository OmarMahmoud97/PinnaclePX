import { expect, test } from '@playwright/test'

test('home page renders the promise and the two actions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'See your new website before you hire anyone.',
  )
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()

  const hero = page.locator('#hero')
  await expect(hero.getByRole('link', { name: 'Show me my three designs' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a 20-minute call' })).toHaveAttribute(
    'href',
    /cal\.com/,
  )
})

test('how it works never lists the questions', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('#how-it-works')
  await expect(section.getByRole('heading', { name: 'One question at a time.' })).toBeVisible()
  await expect(section.getByText(/^Question \d$/)).toHaveCount(0)
  await expect(section.getByText('Question 4 of 5')).toHaveCount(1)
})

test('the taster section carries the call to action', async ({ page }) => {
  await page.goto('/')
  const taster = page.locator('#taster')
  await expect(taster.getByRole('heading', { name: /Imagine what an hour does/ })).toBeVisible()
  await expect(taster.getByRole('link', { name: 'Book a 20-minute call' })).toHaveAttribute(
    'href',
    /cal\.com/,
  )
})

test('FAQ entries expand', async ({ page }) => {
  await page.goto('/')
  const entry = page.locator('#faq details').first()
  await expect(entry).not.toHaveAttribute('open', '')
  await entry.locator('summary').click()
  await expect(entry).toHaveAttribute('open', '')
})

test('mobile menu opens and holds the primary action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Menu' }).click()
  const menu = page.getByRole('navigation', { name: 'Mobile' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Show me my three designs' })).toBeVisible()
})

test('metadata and structured data are present', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/See your new website before you hire anyone/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /opengraph-image/,
  )
  const jsonLd = await page.locator('script[type="application/ld+json"]').innerHTML()
  expect(jsonLd).toContain('"@type":"Organization"')
})
