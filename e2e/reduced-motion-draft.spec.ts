import { expect, type Page, test } from '@playwright/test'
import { next } from './helpers/draft'
import { refuseSends, withDraft } from './helpers/start'

// The live draft under reduced motion (docs/start-page-journey-plan.md, 6.2, 9.5 and package P6):
// the phone's curve never springs, sampled a second after each Next; what the draft animates
// changes only opacity, colour and clip, never position or size; and the display faces still load
// by the look question, since a face is information rather than movement. Nothing here sends a
// brief.

// What moves.
const MOVING = ['transform', 'translate', 'scale', 'rotate']

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

test('the curve stays at rest after every Next on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await withDraft(page, { reached: 0 })
  await page.goto('/start?q=1')
  await expect(heading(page)).toBeVisible()
  const curve = page.locator('[data-curve]')
  for (const to of [2, 3, 4, 5]) {
    await next(page, to)
    await page.waitForTimeout(1_000)
    expect(
      await curve.evaluate((element) => element.style.transform),
      `after the Next to ${String(to)}`,
    ).toBe('')
  }
})

test('the draft’s own animations fade and pour, and never move', async ({ page }) => {
  await page.addInitScript(() => {
    const seen: { name: string; keys: string[] }[] = []
    const noted = new WeakSet<Animation>()
    Object.assign(window, { draftSeen: seen })
    function sample() {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect
        if (noted.has(animation) || !(effect instanceof KeyframeEffect)) continue
        noted.add(animation)
        if (effect.target?.closest('[data-draft]') == null) continue
        seen.push({
          name: animation instanceof CSSAnimation ? animation.animationName : 'other',
          keys: [...new Set(effect.getKeyframes().flatMap((frame) => Object.keys(frame)))],
        })
      }
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  await withDraft(page, { reached: 1, company: '' })
  await page.goto('/start?q=2')
  await page.getByLabel('Business name').fill('Ashgrove Physio')
  await next(page, 3)
  await page.getByRole('radio', { name: /Bold and bright/ }).click()
  await next(page, 4)
  await page.getByRole('radio', { name: 'Plum' }).click()
  await page.waitForTimeout(1_000)

  const seen = await page.evaluate(
    () => (window as unknown as { draftSeen: { name: string; keys: string[] }[] }).draftSeen,
  )
  const names = new Set(seen.map((animation) => animation.name))
  expect([...names]).toEqual(expect.arrayContaining(['draft-land', 'draft-pop', 'draft-box']))
  for (const animation of seen) {
    expect(
      animation.keys.filter((key) => MOVING.includes(key)),
      animation.name,
    ).toEqual([])
  }
})

test('the display faces still load by the look question', async ({ page }) => {
  await withDraft(page, { reached: 2, imagery: { style: 'warm', photos: [] } })
  await page.goto('/start?q=3')
  await expect
    .poll(
      () =>
        page
          .locator('[data-frame="browser"] .draft-head')
          .evaluate((element) => getComputedStyle(element).fontFamily),
      { timeout: 10_000 },
    )
    .toContain('Fraunces')
})
