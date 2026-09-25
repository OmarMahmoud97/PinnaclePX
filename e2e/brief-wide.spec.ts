import { expect, type Locator, type Page, test } from '@playwright/test'
import sharp from 'sharp'
import { settle } from './helpers/draft'
import { refuseSends, withDraft } from './helpers/start'

// The questions on a wide desk (docs/start-page-journey-plan.md, 4.2 and 5.3; the owner's cap of
// 25 September 2026): from 120rem the grid holds at 120rem and centres, so at 2560 by 1440 the
// composition verified at 1920 sits in the middle of the screen with the ramp sized to it, and
// the canvas either side carries the ramp's two ends on, white to the left and the ink to the
// right; nothing scrolls sideways, and the title and the draft's frame are in the first screen.
// At 1920 by 1080 the grid is the screen, as before. Nothing here sends a brief.

const WIDE = { width: 2560, height: 1440 } as const
const DESK = { width: 1920, height: 1080 } as const

// The capped grid at 2560: 120rem at the browser's 16 px, centred.
const CAP = { width: 1920, left: 320 } as const

// The two ends of the ramp, which the canvas past the grid carries on (app/globals.css).
const WHITE = [255, 255, 255] as const
const INK = [2, 10, 18] as const

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function frame(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' }).locator('[data-frame="browser"]')
}

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('nothing to measure')
  return found
}

async function open(page: Page, question: number) {
  await withDraft(page, { reached: 4 })
  await page.goto(`/start?q=${String(question)}`)
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
  await expect(heading(page)).toBeVisible()
  await settle(page)
}

// The colour of one pixel of the screen, from a shot of the page as the visitor sees it.
async function pixelAt(page: Page, x: number, y: number): Promise<readonly number[]> {
  const shot = await page.screenshot()
  const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const at = (y * info.width + x) * 3
  return [data[at] ?? -1, data[at + 1] ?? -1, data[at + 2] ?? -1]
}

for (const question of [1, 3]) {
  test(`at 2560 by 1440 question ${String(question)} is the 1920 composition centred on a two-tone canvas`, async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await open(page, question)
    const grid = await box(page.locator('.start-flow'))
    expect(grid.width).toBe(CAP.width)
    expect(grid.x).toBe(CAP.left)
    // The margins are the ramp's two ends, sampled well inside each margin near the foot of the
    // screen: beside the frame the lamp runs on over the canvas's ink and fades there (start.css).
    const foot = WIDE.height - 100
    expect(await pixelAt(page, CAP.left / 2, foot)).toEqual([...WHITE])
    expect(await pixelAt(page, WIDE.width - CAP.left / 2, foot)).toEqual([...INK])
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(WIDE.width)
    await expect(heading(page)).toBeInViewport({ ratio: 1 })
    await expect(frame(page)).toBeInViewport({ ratio: 1 })
  })
}

test('at 1920 by 1080 the grid is the whole screen', async ({ page }) => {
  await page.setViewportSize(DESK)
  await open(page, 1)
  const grid = await box(page.locator('.start-flow'))
  expect(grid.width).toBe(DESK.width)
  expect(grid.x).toBe(0)
})
