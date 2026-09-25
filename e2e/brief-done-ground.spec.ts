import { expect, type Page, test } from '@playwright/test'
import sharp from 'sharp'
import { openDone, refuseSends, statusFor, stubPhotos } from './helpers/start'

// Ready's ground at a desk (docs/start-page-journey-plan.md, 5.3, 5.4 and package P8): once the
// designs can be opened the page rises to the hero's ramp again, its light stops shifted so every
// text box in main outside a card stands on #c6dcee or lighter and every link on #e2eef7 or
// lighter, at the six desk sizes the plan names; and the first design's poster is in the first
// screen of the shortest of them. Nothing here sends a brief.

const SLUG = 'grndk7m2p9x4'

const DESKS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1366, height: 657 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

// The two stops the plan's text rules name (5.4).
const BODY_FLOOR = '#c6dcee'
const LINK_FLOOR = '#e2eef7'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

function channel(value: number): number {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function luminanceOf(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16)
  return luminance((n >> 16) & 255, (n >> 8) & 255, n & 255)
}

type Box = { what: string; link: boolean; x: number; y: number; width: number; height: number }

// Every line of text in main that stands on the ground itself, box by box, in the page's own
// coordinates: not inside a card of its own ground (the page link's, a design row, the ask), and
// not hidden. Links and the early finish, set in brand ink, take the link's floor.
function textBoxes(page: Page): Promise<Box[]> {
  return page.evaluate(() => {
    const main = document.getElementById('main')
    if (main === null) return []
    const boxes: Box[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      const parent = node.parentElement
      if (parent === null || node.textContent?.trim() === '') continue
      if (
        parent.closest(
          '.done-page, .design-item, .start-done-ask, .sr-only, [aria-hidden="true"]',
        ) !== null
      ) {
        continue
      }
      if (!parent.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width < 1 || rect.height < 1) continue
        boxes.push({
          what: (node.textContent ?? '').trim().slice(0, 40),
          link: parent.closest('a, .done-early') !== null,
          x: Math.round(rect.left + window.scrollX),
          y: Math.round(rect.top + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        })
      }
    }
    return boxes
  })
}

// The darkest pixel of the ground under each box, from shots with main's text made transparent,
// a screen at a time down the page, so a box below the first screen is sampled too. A box no
// shot reached keeps Infinity, which fails it.
async function groundUnder(page: Page, boxes: readonly Box[]) {
  await page.addStyleTag({
    content:
      'main#main, main#main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; }',
  })
  const darkest = boxes.map(() => Infinity)
  const foot = Math.max(...boxes.map((box) => box.y + box.height))
  const { height } = page.viewportSize() ?? { height: 0 }
  for (let wanted = 0; wanted < foot && height > 0; wanted += height) {
    const top = await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' })
      return window.scrollY
    }, wanted)
    const shot = await page.screenshot()
    const { data, info } = await sharp(shot)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    boxes.forEach((box, index) => {
      const from = Math.max(0, box.y - top)
      const to = Math.min(info.height, box.y + box.height - top)
      for (let y = from; y < to; y += 1) {
        for (let x = Math.max(0, box.x); x < Math.min(info.width, box.x + box.width); x += 1) {
          const at = (y * info.width + x) * 3
          const seen = luminance(data[at] ?? 0, data[at + 1] ?? 0, data[at + 2] ?? 0)
          darkest[index] = Math.min(darkest[index] ?? Infinity, seen)
        }
      }
    })
  }
  return boxes.map((box, index) => ({ ...box, darkest: darkest[index] ?? Infinity }))
}

// Every animation and transition over, the ground's rise and the ramp's shift among them.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

async function openReady(page: Page, desk: { width: number; height: number }) {
  await page.setViewportSize(desk)
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await expect(page.getByRole('list', { name: 'Your designs' })).toBeVisible()
  await expect(page.locator('.start-flow')).toHaveAttribute('data-lit', '')
  await settle(page)
}

for (const desk of DESKS) {
  test(`at ready every text box on the ground stands on a light enough stop at ${String(desk.width)} by ${String(desk.height)}`, async ({
    page,
  }) => {
    await openReady(page, desk)
    const boxes = await textBoxes(page)
    expect(boxes.length, 'the heading and the lead are on the ground').toBeGreaterThan(1)
    const body = luminanceOf(BODY_FLOOR)
    const link = luminanceOf(LINK_FLOOR)
    const misses = (await groundUnder(page, boxes))
      .filter(
        (box) => !Number.isFinite(box.darkest) || box.darkest < (box.link ? link : body) * 0.99,
      )
      .map((box) => `"${box.what}" at ${String(box.x)},${String(box.y)}`)
    expect(misses).toEqual([])
  })
}

test('the first design is in the first screen of a short laptop', async ({ page }) => {
  await openReady(page, { width: 1366, height: 657 })
  await expect(
    page.getByRole('list', { name: 'Your designs' }).locator('.done-poster').first(),
  ).toBeInViewport({ ratio: 1 })
})

test('while the designs build the page is the ink, and the canvas past its ends too', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(page.getByRole('list', { name: 'Your designs' })).toBeVisible()
  await settle(page)
  const main = page.locator('main#main')
  await expect(main).toHaveAttribute('data-theme', 'dark')
  // main's ground lies under the ink's layer, whole.
  expect(await main.evaluate((node) => getComputedStyle(node, '::before').opacity)).toBe('1')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
    'rgb(2, 10, 18)',
  )
})
