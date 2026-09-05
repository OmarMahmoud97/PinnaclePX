import { expect, test } from '@playwright/test'

// The page on a 390x844 phone, where most visitors arrive.

test('the primary action and its trigger sit inside the first screen', async ({ page }) => {
  await page.goto('/')
  const cta = page.locator('#hero-cta')
  const box = await cta.boundingBox()
  expect(box).not.toBeNull()
  expect(box?.y ?? 0).toBeGreaterThanOrEqual(64)
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(844)
  const trigger = page
    .locator('#hero')
    .getByText('Free. No sign-up. Nobody calls you unless you book.')
  const triggerBox = await trigger.boundingBox()
  expect((triggerBox?.y ?? 0) + (triggerBox?.height ?? 0)).toBeLessThanOrEqual(844)
})

test('the page never scrolls sideways', async ({ page }) => {
  await page.goto('/')
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBe(390)
})

test('the header takes the primary action once the hero button has scrolled away', async ({
  page,
}) => {
  await page.goto('/')
  // Wait for hydration (the page arms motion on mount) before scrolling, or the router's scroll
  // restoration can undo the scroll.
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const headerCta = page.locator('header').getByRole('link', { name: 'Show me my three designs' })
  await expect(headerCta).toBeHidden()
  await page.locator('#straight-answers').scrollIntoViewIfNeeded()
  await expect(headerCta).toBeVisible()
  await page.locator('#hero').scrollIntoViewIfNeeded()
  await expect(headerCta).toBeHidden()
})

// The sections added for the burned buyer and the forwarded partner may not cost more than seven
// phone screens between them (docs/home-page-content-plan.md, section 2.3). A soft assertion:
// the run reports it and carries on, so the cut order in the plan is applied on purpose, not by
// a red build.
test('the added sections stay within seven phone screens together', async ({ page }) => {
  await page.goto('/')
  const total = await page.evaluate(() =>
    ['examples', 'outcomes', 'real-build', 'your-options'].reduce(
      (sum, id) => sum + (document.getElementById(id)?.offsetHeight ?? 0),
      0,
    ),
  )
  expect.soft(total).toBeLessThanOrEqual(7 * 844)
})

test('every list and answer is readable without any interaction', async ({ page }) => {
  await page.goto('/')
  for (const id of [
    'what-you-get',
    'outcomes',
    'real-build',
    'your-options',
    'straight-answers',
    'about',
    'faq',
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await expect(page.locator(`#${id}`)).toBeVisible()
  }
  await expect(page.locator('#straight-answers').getByRole('heading', { level: 3 })).toHaveCount(4)
})

test('the mobile menu closes on Escape and returns focus to its button', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: 'Menu' })
  await button.click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden()
  await expect(button).toBeFocused()
})
