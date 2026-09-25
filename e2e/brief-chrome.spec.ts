import { expect, test } from '@playwright/test'

// The questionnaire's island (app/start/_components/start-chrome.tsx on the site's own
// app/_components/header-chrome.tsx): solid, drawn in and dark in the server's HTML, never
// blended by difference, since the page has no white top for the blend to read; and one way out
// with one name at every width. brief-order.spec.ts follows the island down the look question:
// never blended, dark from its first frame, and dark again when the ground turns to the ink.

// The exit's ring below md: the phone menu button's own 40px.
const RING_PX = 40

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// sends one, and this makes sure: every POST to /start, which is how the Server Action travels,
// is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

test('the served questionnaire opens on the dark island', async ({ request }) => {
  const html = await (await request.get('/start')).text()
  // Every header in the document (the shell, and in development the streamed flow too) sits in
  // a wrapper that already carries the three states.
  const wrappers = [...html.matchAll(/<div([^>]*)><header[^>]*class="header-bar/g)].map(
    (match) => match[1] ?? '',
  )
  expect(wrappers.length).toBeGreaterThan(0)
  for (const attributes of wrappers) {
    expect(attributes).toContain('data-solid=""')
    expect(attributes).toContain('data-island=""')
    expect(attributes).toContain('data-over-dark=""')
  }
})

test('the way out is one link, a 40px ring on a phone, inside the screen', async ({ page }) => {
  await page.goto('/start')
  // The flow has mounted in place of the shell, so the header read below is the one that stays.
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  const banner = page.getByRole('banner')
  const exit = banner.getByRole('link', { name: 'Back to site' })
  await expect(exit).toBeVisible()
  await expect(exit).toHaveAttribute('href', '/')
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await expect(exit).toHaveAccessibleName('Back to site')
    await expect(async () => {
      const ring = await exit.boundingBox()
      expect(ring?.width).toBe(RING_PX)
      expect(ring?.height).toBe(RING_PX)
      const island = await banner.locator('.header-row').boundingBox()
      expect(island?.x ?? -1).toBeGreaterThanOrEqual(0)
      expect((island?.x ?? 0) + (island?.width ?? Infinity)).toBeLessThanOrEqual(width)
    }).toPass()
  }
})
