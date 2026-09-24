import { expect, test } from '@playwright/test'

// The hero's prompt box on the desktop (ADR 0031, amended 24 September 2026): a pill of the wash
// that reads as a field at rest, the box in the subhead's 768px column, and the fine print at the
// button's shoulder. The box keeps the height the headline's fills were measured against.

test('the prompt field reads as a field and its caption sits at the button', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  const input = page.getByLabel('What does your business do?')
  await expect(input).toHaveCSS('background-color', 'rgb(226, 238, 247)')
  expect((await input.boundingBox())?.height).toBe(48)
  const form = await page.locator('#hero form').boundingBox()
  expect(form?.width).toBe(768)
  expect(form?.height ?? 0).toBeCloseTo(156, 0)
  const caption = await page.locator('#hero form p').boundingBox()
  const cta = await page.locator('#hero-cta').boundingBox()
  expect((cta?.x ?? 0) - (caption?.x ?? 0) - (caption?.width ?? 0)).toBeCloseTo(16, 0)
  await expect(page.locator('#hero form p')).toHaveCSS('font-size', '14px')
  await input.focus()
  await expect(input).toHaveCSS('outline-width', '2px')
  await expect(input).toHaveCSS('outline-color', 'rgb(3, 105, 161)')
})

test('Enter in the hero field carries the sentence', async ({ page }) => {
  await page.goto('/')
  // Wait for hydration (the page arms motion on mount): before it, Enter is the form's own
  // submission, which lands on /start without the sentence, as it does with JavaScript off.
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const field = page.getByLabel('What does your business do?')
  await expect(field).toHaveAttribute('enterkeyhint', 'go')
  await expect(page.locator('#hero form')).toHaveAttribute('action', '/start')
  await field.fill(
    'Family-run cafe by Whitby harbour. Breakfasts, cakes, dog-friendly, open from seven.',
  )
  await field.press('Enter')
  await expect(page).toHaveURL(/\/start\?q=2$/)
})
