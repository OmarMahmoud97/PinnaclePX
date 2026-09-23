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

// The four watched sections' height together, against the ten phone screens the content plan
// set (docs/home-page-content-plan.md, decision 52). A report, never a failure: with Work one
// column on phones (ADR 0034) the four measure about twelve screens, and the number is written
// into the ADR each time it moves, so the cut order in the plan is applied on purpose, not by a
// red build. The report lands on the test as an annotation and in the run's output.
test('the added sections report their height in phone screens', async ({ page }) => {
  await page.goto('/')
  const heights = await page.evaluate(() =>
    Object.fromEntries(
      ['work', 'included', 'real-build', 'your-options'].map((id) => [
        id,
        document.getElementById(id)?.offsetHeight ?? 0,
      ]),
    ),
  )
  const total = Object.values(heights).reduce((sum, height) => sum + height, 0)
  const screens = (total / 844).toFixed(1)
  test.info().annotations.push({
    type: 'phone screens',
    description: `${String(total)} px, ${screens} screens of the 10 planned (${JSON.stringify(heights)})`,
  })
  expect(total).toBeGreaterThan(0)
})

// The walkthrough's phone used to be masked to its top strip on a phone; now the whole frame
// stays in view under the header while the beats scroll beneath it.
test('the walkthrough shows the whole phone frame under the header', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const section = page.locator('#how-it-works')
  await section.locator('[data-stages="3"]').scrollIntoViewIfNeeded()
  const frame = await section.locator('[data-frame="phone"]').boundingBox()
  expect(frame).not.toBeNull()
  expect(frame?.y ?? 0).toBeGreaterThanOrEqual(64)
  expect((frame?.y ?? 0) + (frame?.height ?? 0)).toBeLessThanOrEqual(844)
  expect(frame?.height ?? 0).toBeGreaterThan(300)
})

test('every list and answer is readable without any interaction', async ({ page }) => {
  await page.goto('/')
  for (const id of ['included', 'real-build', 'your-options', 'straight-answers', 'about', 'faq']) {
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
