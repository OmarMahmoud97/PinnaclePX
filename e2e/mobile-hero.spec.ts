import { expect, test } from '@playwright/test'

// The hero's prompt box on a 390x844 phone (ADR 0031, amended 24 September 2026): the field, then
// the button across the same column, then its fine print under it. The box keeps the height the
// headline's fills were measured against (app/_components/hero-prompt.tsx), so the H1 never moves.

test('the hero field, its button and its caption stack on a phone', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const box = await page.locator('#hero-cta').boundingBox()
  const triggerBox = await page
    .locator('#hero')
    .getByText('Free. No sign-up. Nobody calls you unless you book.')
    .boundingBox()
  const field = await page.getByLabel('What does your business do?').boundingBox()
  expect(box).not.toBeNull()
  expect(triggerBox).not.toBeNull()
  expect(field).not.toBeNull()
  expect(field?.height ?? 0).toBeGreaterThanOrEqual(48)
  expect(field?.width ?? 0).toBeCloseTo(box?.width ?? 0, 0)
  expect((field?.y ?? 0) + (field?.height ?? 0)).toBeLessThanOrEqual(box?.y ?? 0)
  expect(triggerBox?.y ?? 0).toBeGreaterThanOrEqual((box?.y ?? 0) + (box?.height ?? 0))
  // One of the two heights the fills were measured against (ADR 0031): 180.8 with the fine print
  // on one line, 197.6 with it on two. The line has about 13px of slack at this width, so which
  // one a browser lands on depends on its text rasterisation — CI wraps where this machine does
  // not. Both are measured states the H1 sits still above; a third would mean the box has grown.
  const formHeight = (await page.locator('#hero form').boundingBox())?.height ?? 0
  expect(
    [180.8, 197.6].some((measured) => Math.abs(formHeight - measured) < 0.5),
    `the prompt box at ${String(formHeight)}px is neither measured height`,
  ).toBe(true)
})

// The phone's button spans the column with 20px each side, and under 22.4rem the label and the
// arrow no longer fit, so the arrow goes rather than being squeezed to a sliver. The breakpoint
// rests on the label's measured width: a longer label fails here rather than on a phone.
test('the hero button shows its arrow whole or not at all', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const arrow = page.locator('#hero-cta svg')
  for (const width of [320, 340, 356, 360, 375, 390]) {
    await page.setViewportSize({ width, height: 844 })
    const drawn = Math.round((await arrow.boundingBox())?.width ?? 0)
    expect([0, 20], `the arrow at ${String(width)}`).toContain(drawn)
  }
  await page.setViewportSize({ width: 360, height: 844 })
  expect((await arrow.boundingBox())?.width).toBe(20)
})
