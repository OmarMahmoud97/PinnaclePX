import { expect, type Page, test } from '@playwright/test'

// The questionnaire's island (app/start/_components/start-chrome.tsx on the site's own
// app/_components/header-chrome.tsx): solid, drawn in and dark in the server's HTML, never
// blended by difference, since the page has no white top for the blend to read; one way out
// with one name at every width; and a ground that turns to the ink after load, as the whole page
// does once the brief is sent, read as dark under the bar.

// The flow restores a saved draft and allows any question up to the first unanswered one, so a
// draft written before the page's own scripts run opens question five, the longest, directly.
// The key and the shape are lib/brief/draft.ts's and lib/brief/schema.ts's draftSchema.
const DRAFT_KEY = 'pinnaclepx.brief'
const ANSWERED = {
  description:
    'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.',
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

// A short phone, so question five scrolls well past the region and its pooled curve and the bar
// ends over the wash. The curve's box ends about 283px down the page (the region's 228px on a
// short screen, app/_styles/start.css, and the pool's 55px); the bar's middle line is 32px down
// the screen.
const PHONE = { width: 390, height: 664 }
const CURVE_FOOT_PX = 283 - 32

// The exit's ring below md: the phone menu button's own 40px.
const RING_PX = 40

async function withDraft(page: Page) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DRAFT_KEY, value: JSON.stringify(ANSWERED) },
  )
}

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// sends one, and this makes sure: every POST to /start, which is how the Server Action travels,
// is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

function wrapper(page: Page) {
  return page.locator('header').locator('xpath=..')
}

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

test('the island is never blended, and dark from its first frame', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await withDraft(page)
  // A sampler that starts before the page's first byte is parsed and reads the header in every
  // frame it exists, through the shell, hydration and the flow's mount.
  await page.addInitScript(() => {
    type Sample = { blend: string; solid: boolean; dark: boolean; y: number }
    const seen: Sample[] = []
    Object.assign(window, { __islandFrames: seen })
    const tick = () => {
      const header = document.querySelector('header')
      const wrap = header?.parentElement
      if (header && wrap) {
        seen.push({
          blend: getComputedStyle(header).mixBlendMode,
          solid: wrap.hasAttribute('data-solid'),
          dark: wrap.hasAttribute('data-over-dark'),
          y: window.scrollY,
        })
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.goto('/start?q=5')
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  // Down to the end a step a frame, as a thumb would, and back up again. At the end the pooled
  // curve's box has left the bar's middle line, so the bar is over the wash.
  const end = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const STEP = 30
        let down = true
        let deepest = 0
        const move = () => {
          const before = window.scrollY
          window.scrollBy({ top: down ? STEP : -STEP, behavior: 'instant' })
          deepest = Math.max(deepest, window.scrollY)
          if (down && window.scrollY === before) down = false
          if (!down && window.scrollY === 0) {
            resolve(deepest)
            return
          }
          requestAnimationFrame(move)
        }
        requestAnimationFrame(move)
      }),
  )
  expect(end).toBeGreaterThan(CURVE_FOOT_PX)
  await expect(wrapper(page)).toHaveAttribute('data-over-dark', '')
  type Sample = { blend: string; solid: boolean; dark: boolean; y: number }
  const frames = await page.evaluate(
    () => (window as unknown as { __islandFrames: Sample[] }).__islandFrames,
  )
  expect(frames.length).toBeGreaterThan(30)
  expect(frames.filter((frame) => frame.blend !== 'normal' || !frame.solid)).toEqual([])
  // From load to the first scroll the sketch's ink is under the bar in every frame, so the island
  // stays dark: the mount never clears the server's attribute before the observer has reported.
  const atRest = frames.slice(
    0,
    frames.findIndex((frame) => frame.y > 0),
  )
  expect(atRest.length).toBeGreaterThan(0)
  expect(atRest.filter((frame) => !frame.dark)).toEqual([])
  // Over the wash the island turned light, so the observer was watching all along.
  expect(frames.some((frame) => frame.y === end && !frame.dark)).toBe(true)
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

test('a ground that turns to the ink after load reads as dark', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await withDraft(page)
  await page.goto('/start?q=5')
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
  })
  await expect(wrapper(page)).not.toHaveAttribute('data-over-dark')
  // What the flow does to main once the brief is sent (brief-flow.tsx), without sending one.
  await page.locator('main').evaluate((main) => {
    main.setAttribute('data-theme', 'dark')
  })
  await expect(wrapper(page)).toHaveAttribute('data-over-dark', '')
  await page.locator('main').evaluate((main) => {
    main.removeAttribute('data-theme')
  })
  await expect(wrapper(page)).not.toHaveAttribute('data-over-dark')
})
