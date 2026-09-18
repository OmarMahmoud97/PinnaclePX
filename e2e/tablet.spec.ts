import { expect, test } from '@playwright/test'

// A tablet at 768 by 1024, where the desktop composition first appears: the hero fills the
// screen with its prompt box, caption and logo strip.

test('the primary action sits inside the first screen and the page never scrolls sideways', async ({
  page,
}) => {
  await page.goto('/')
  const box = await page.locator('#hero-cta').boundingBox()
  expect(box).not.toBeNull()
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(1024)
  const scrollX = await page.evaluate(() => {
    window.scrollTo(200, 0)
    return window.scrollX
  })
  expect(scrollX).toBe(0)
})

// The headline or the subhead, never a picture.
test('the largest contentful paint is text', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
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
  expect(['H1', 'P']).toContain(lcp)
})
