import { expect, type Page, type Route, test } from '@playwright/test'

// The questionnaire's shell (app/start/_components/brief-flow.tsx, sketch-pane.tsx and
// start-layout.ts): the question first in the DOM and the draft first on a phone's screen, and a
// hydration that moves nothing. On a phone the window is the draft's phone frame, restyled at its
// own size (docs/start-page-journey-plan.md, D8), so its box is the one the phone reading holds
// still. brief-ground.spec.ts holds the desk page at 1440 by 900, which never scrolls at any
// question, and keeps the dark scope off the region that declares the draft's colours.

// The most a box may move, in CSS pixels, between the server's skeleton and the mounted flow.
// The island's row settles 0.97 px wider at 1440, which is sub-pixel; anything the swap really
// moved would be far more. Boxes, not layout-shift entries: React replaces the skeleton's nodes
// with the flow's, and the browser reports a shift only for a node present in both frames, so a
// shift total cannot see this swap at all.
const MAX_HYDRATION_DRIFT = 1.5

// How long after the question shows before the flow's boxes are read: the island's first
// reading, the fonts and the entrance all land well inside it.
const SETTLE_MS = 1_000

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// sends one, and this makes sure: every POST to /start, which is how the Server Action travels,
// is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

type Box = { x: number; y: number; width: number; height: number }

// The shell's boxes once the brand fonts have landed, so both readings share them: main, the
// region, the draft's two frames and the island's row. Below 36rem the browser frame is hidden and
// the phone frame is the window; a hidden frame reads 0 by 0 in both readings, which compares like
// any other box.
function shellBoxes(page: Page) {
  return page.evaluate(async () => {
    await document.fonts.ready
    const box = (selector: string): Box | null => {
      const element = document.querySelector(selector)
      if (element === null) return null
      const { x, y, width, height } = element.getBoundingClientRect()
      return { x, y, width, height }
    }
    const sketch = 'section[aria-label="Your brief so far"]'
    return {
      main: box('main#main'),
      region: box(sketch),
      browser: box(`${sketch} [data-frame="browser"]`),
      phone: box(`${sketch} [data-frame="phone"]`),
      row: box('header .header-row'),
    }
  })
}

test('the question comes first in the DOM and the sketch first on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/start')
  await expect(page.locator('main#main h1')).toBeVisible()

  // A screen reader hears the question, its control and the ask before the drawing.
  const mainFirst = await page.evaluate(() => {
    const main = document.getElementById('main')
    const sketch = document.querySelector('section[aria-label="Your brief so far"]')
    return (
      main !== null &&
      sketch !== null &&
      (main.compareDocumentPosition(sketch) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    )
  })
  expect(mainFirst).toBe(true)

  // On screen the draft is on top and the question under it.
  const sketchBox = await region(page).boundingBox()
  const mainBox = await page.locator('main#main').boundingBox()
  expect(sketchBox).not.toBeNull()
  expect(mainBox).not.toBeNull()
  if (sketchBox === null || mainBox === null) return
  expect(sketchBox.y + sketchBox.height).toBeLessThanOrEqual(mainBox.y + 1)

  // From lg the question is the left pane and the sketch the right.
  await page.setViewportSize({ width: 1440, height: 900 })
  const wideSketch = await region(page).boundingBox()
  const wideMain = await page.locator('main#main').boundingBox()
  if (wideSketch === null || wideMain === null) throw new Error('the shell lost a pane at 1440')
  expect(wideMain.x + wideMain.width).toBeLessThanOrEqual(wideSketch.x + 1)
})

for (const [width, height] of [
  [390, 844],
  [1440, 900],
] as const) {
  test(`hydration moves nothing at ${String(width)}`, async ({ page }) => {
    await page.setViewportSize({ width, height })

    // The server's skeleton, held on screen by refusing the page's scripts. This route is added
    // after the POST guard, so it runs first, and everything else falls back to the guard.
    const refuseScripts = (route: Route) =>
      route.request().resourceType() === 'script' ? route.abort() : route.fallback()
    await page.route('**/*', refuseScripts)
    await page.goto('/start')
    await expect(region(page)).toBeVisible()
    // No heading yet, so what is measured is the skeleton and not the flow.
    await expect(page.locator('main#main h1')).toHaveCount(0)
    const skeleton = await shellBoxes(page)

    // The same page with its scripts, once the flow has mounted over the skeleton and settled.
    await page.unroute('**/*', refuseScripts)
    await page.goto('/start')
    await expect(page.locator('main#main h1')).toBeVisible()
    await page.waitForTimeout(SETTLE_MS)
    const flow = await shellBoxes(page)

    const drift = (key: keyof typeof flow, sides: readonly (keyof Box)[]) => {
      const before = skeleton[key]
      const after = flow[key]
      expect(before, `${key} in the skeleton`).not.toBeNull()
      expect(after, `${key} in the flow`).not.toBeNull()
      if (before === null || after === null) return
      for (const side of sides) {
        expect(Math.abs(after[side] - before[side]), `${key}.${side}`).toBeLessThanOrEqual(
          MAX_HYDRATION_DRIFT,
        )
      }
    }
    for (const key of ['region', 'browser', 'phone', 'row'] as const) {
      drift(key, ['x', 'y', 'width', 'height'])
    }
    // main keeps its place and width. Below lg the real question makes it 48 px taller than the
    // bars, below the fold, and nothing above it moves.
    drift('main', ['x', 'y', 'width'])
  })
}
