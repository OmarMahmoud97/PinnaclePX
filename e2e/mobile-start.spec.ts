import { expect, type Page, test } from '@playwright/test'

// /start on a 390 by 844 phone, where most visitors answer it: the first screen holds the sketch,
// the question and the ask, which below lg, on a screen at least 30rem tall, rides at the foot
// (app/_styles/start.css). mobile-order.spec.ts walks the five questions at 390 and 320 wide,
// never scrolling sideways and never with the ask over a control.

const REASSURANCE = 'Free. No sign-up. Nobody calls you unless you book.'

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// presses the last button, and this makes sure: every POST to /start, which is how the Server
// Action travels, is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

// A box is read from the finished layout: the question's entrance and the sketch's paint-in
// over. Only animations that end are waited for, as in a11y.spec.ts.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

test('the first screen holds the sketch, the question and the ask', async ({ page }) => {
  await page.goto('/start')
  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch).toBeVisible()
  await settle(page)
  expect((await sketch.boundingBox())?.height ?? Infinity).toBeLessThanOrEqual(320)
  await expect(page.locator('main#main h1')).toBeInViewport()
  await expect(page.getByRole('button', { name: /^Next/ })).toBeInViewport({ ratio: 1 })
  await expect(page.locator('main').getByText(REASSURANCE)).toBeInViewport({ ratio: 1 })
  // There is nothing to go back to, so there is no Back, not even as kept space.
  await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0)
})
