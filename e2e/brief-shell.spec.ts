import { expect, type Page, type Route, test } from '@playwright/test'

// The questionnaire's shell (app/start/_components/brief-flow.tsx, sketch-pane.tsx and
// start-layout.ts): the question first in the DOM and the sketch first on a phone's screen, the
// dark scope kept off the region that declares the sketch's colours, a desk page at 1440 by 900
// that never scrolls at any question, and a hydration that moves nothing.

// The flow restores a saved draft and allows any question up to the first unanswered one, so a
// draft written before the page's own scripts run opens the later questions directly. The key
// and the shape are lib/brief/draft.ts's and lib/brief/schema.ts's draftSchema.
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

// The most a box may move, in CSS pixels, between the server's skeleton and the mounted flow.
// The island's row settles 0.97 px wider at 1440, which is sub-pixel; anything the swap really
// moved would be far more. Boxes, not layout-shift entries: React replaces the skeleton's nodes
// with the flow's, and the browser reports a shift only for a node present in both frames, so a
// shift total cannot see this swap at all.
const MAX_HYDRATION_DRIFT = 1.5

// How long after the question shows before the flow's boxes are read: the island's first
// reading, the fonts and the entrance all land well inside it.
const SETTLE_MS = 1_000

async function withDraft(page: Page, draft: object) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DRAFT_KEY, value: JSON.stringify(draft) },
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

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

type Box = { x: number; y: number; width: number; height: number }

// The shell's boxes once the brand fonts have landed, so both readings share them: main, the
// region, its two frames and the island's row. The browser frame is hidden below lg, so it reads
// 0 by 0 there in both, which compares like any other box.
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
  await expect(page.getByRole('heading', { level: 1, name: 'First, your business.' })).toBeVisible()

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

  // On screen the sketch is on top and the question under it.
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

test('the dark scope sits on the ground layer, never on the region', async ({ page }) => {
  await withDraft(page, ANSWERED)
  await page.goto('/start?q=4')
  await expect(
    page.getByRole('heading', { level: 1, name: 'How should Ashgrove Physio look?' }),
  ).toBeVisible()
  const sketch = region(page)

  // Neither the region, which declares the sketch's colours, nor anything around it is a scope.
  expect(await sketch.evaluate((element) => element.closest('[data-theme]') === null)).toBe(true)

  // Its ground is, and paints the ink.
  const ground = sketch.locator(':scope > div[aria-hidden="true"][data-theme="dark"]')
  await expect(ground).toHaveCount(1)
  await expect(ground).toHaveCSS('background-color', 'rgb(2, 10, 18)')

  // So a light-style sketch keeps its white page on the ink. A scope on the region would turn it
  // the ink too, since the light scheme reads the surface where the region declares it.
  await expect(sketch.locator('[data-frame="browser"]')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )
})

test('at 1440 by 900 no question scrolls', async ({ page }) => {
  await withDraft(page, ANSWERED)
  for (const question of [1, 2, 3, 4, 5]) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
    await expect(page.locator('main#main h1')).toBeVisible()
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(height, `question ${String(question)}`).toBe(900)
  }
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
    await expect(
      page.getByRole('heading', { level: 1, name: 'First, your business.' }),
    ).toBeVisible()
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
