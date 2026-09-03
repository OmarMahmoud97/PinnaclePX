import { expect, test } from '@playwright/test'

// A tablet at 768 by 1024, where the desktop composition first appears: the browser frame with
// the phone over its corner, narrower than on desktop so the sketch's photograph never outgrows
// the subhead as the largest contentful paint.

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

test('the hero builds the example brief in the browser frame', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('#hero')
  await expect(hero.locator('[data-frame="browser"]')).toBeVisible()
  await expect(hero).toHaveAttribute('data-built', '', { timeout: 25_000 })
  await expect(
    hero.getByText(
      'The same example brief, built as an illustration. Not a client, and not one of the designs.',
    ),
  ).toBeVisible()
})

// The frame is narrower here than on desktop for exactly this reason.
test('the photograph never becomes the largest contentful paint', async ({ page }) => {
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
  expect(['H1', 'P']).toContain(lcp)
})
