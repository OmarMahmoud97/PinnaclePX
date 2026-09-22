import { expect, test } from '@playwright/test'

// With prefers-reduced-motion the page shows every finished state and nothing moves. (That the
// GSAP chunk is never in the initial script tags is checked on the production build by
// scripts/bundle-budget.mjs; the dev server bundles every chunk up front, so it cannot be
// asserted here.)

test('nothing moves', async ({ page }) => {
  await page.goto('/')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  )
  // The hero's ink is never started: its canvas keeps the size it was sent with.
  await expect(page.locator('#hero canvas')).toHaveJSProperty('width', 300)

  for (const id of [
    'work',
    'included',
    'how-it-works',
    'real-build',
    'your-options',
    'straight-answers',
    'faq',
    'cta',
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
  }
  await expect(page.locator('#how-it-works').getByText('Question 5 of 5')).toHaveCount(1)
  const moving = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => {
        const effect = animation.effect
        return effect instanceof KeyframeEffect
          ? effect.getKeyframes().flatMap((frame) => Object.keys(frame))
          : []
      })
      .flat()
      .filter((property) => property === 'transform' || property === 'translate'),
  )
  expect(moving).toEqual([])
  // Lenis was never loaded: scrolling is the browser's own (ADR 0021).
  await expect(page.locator('html')).not.toHaveClass(/lenis/)
})
