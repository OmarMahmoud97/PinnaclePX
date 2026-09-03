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
  await expect(section.getByText(/Question \d of 5/)).toHaveCount(1)
})

test('the walkthrough paints the example brief as its beats scroll into view', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('#how-it-works')
  await section.locator('[data-beat="5"]').scrollIntoViewIfNeeded()
  await expect(section.getByText('Question 5 of 5')).toBeVisible()
  await expect(section.getByText('VetPres').first()).toBeVisible()
})

// Two passes, because the second is the one that breaks: it must build from a clean sketch
// rather than from whatever the first pass left behind.
test('the hero sketch builds the example brief into a page, twice over', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/')
  const hero = page.locator('#hero')
  const sketching = hero.getByText(
    'Sketch of an example brief. A first look, not one of the designs.',
  )
  const built = hero.getByText(
    'The same example brief, built as an illustration. Not a client, and not one of the designs.',
  )

  await expect(sketching).toBeVisible({ timeout: 15_000 })
  await expect(hero).toHaveAttribute('data-built', '', { timeout: 20_000 })
  await expect(hero).toHaveAttribute('data-tinted', '')
  await expect(built).toBeVisible()

  await expect(hero).not.toHaveAttribute('data-built', '', { timeout: 15_000 })
  await expect(sketching).toBeVisible()
  await expect(hero).toHaveAttribute('data-built', '', { timeout: 25_000 })
  await expect(built).toBeVisible()
})

// A photograph that first paints at full size nine seconds in would become the LCP element for
// a visitor who has not yet moved. It first paints small, so the H1 must stay the LCP element
// after a whole build with no input.
test('the hero photograph never becomes the largest contentful paint', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#hero')).toHaveAttribute('data-built', '', { timeout: 25_000 })
  const lcp = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1) as
            (PerformanceEntry & { element?: Element }) | undefined
          resolve(last?.element?.tagName ?? 'none')
          observer.disconnect()
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })
      }),
  )
  expect(lcp).toBe('H1')
})

test('a sentence typed in the hero reaches question one on the start page', async ({ page }) => {
  await page.goto('/')
  const sentence =
    'Family-run cafe by Whitby harbour. Breakfasts, cakes, dog-friendly, open from seven.'
  await page.getByLabel('What does your business do?').fill(sentence)
  await expect(page.locator('#hero').getByText(sentence).first()).toBeVisible()
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByLabel('What does your business do?')).toHaveValue(sentence)
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
