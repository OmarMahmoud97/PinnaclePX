import { expect, type Locator, type Page, test } from '@playwright/test'
import { CONFIG } from '@/lib/config'
import { layoutOf } from '@/lib/preview/descriptors'
import { openDone, refuseSends, statusFor, stubPhotos } from './helpers/start'

// The done view on a phone after the polish of 25 September 2026 (docs/start-page-journey-plan.md,
// 4.5, 4.9 and 9.1): a view opened from a link takes the build's colour and draws no draft, the
// log's marks sit level with their stamps on wrapped lines, the strip draws each design in its
// template's layout from the select stage on, on a phone on its side the poster strip keeps its
// air under the island, and on a short phone the progress comes before the page card, so the
// ring is in the first screen (the owner's departure from plan 9.1's order). Nothing here sends
// a brief.

const SLUG = 'mplsk7m2p9x4'

const FOREST = '#2f6f4e'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

async function settled(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('nothing to measure')
  return found
}

test('a done view opened from a link lights the strip with the build’s colour and draws no draft', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(page.locator('.done-strip')).toBeVisible()
  await expect(region(page)).toHaveAttribute('data-restored', '')
  await expect(region(page)).toHaveAttribute('data-coloured', '')
  await expect(region(page)).toHaveCSS('--draft-hex', FOREST)
  await expect(region(page).locator('.draft').first()).toHaveCSS('opacity', '0')
})

test('the log’s marks sit level with their stamps, and every line’s words share one edge', async ({
  page,
}) => {
  // The building example's copy stage is still running, so its line has no stamp (plan 9.2).
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(page.locator('.done-log')).toBeVisible()
  await settled(page)
  for (const line of await page.locator('.done-log li:has(.done-log-stamp)').all()) {
    const [mark, stamp] = await Promise.all([
      box(line.locator('.done-log-mark')),
      box(line.locator('.done-log-stamp')),
    ])
    expect(Math.abs(mark.y - stamp.y)).toBeLessThanOrEqual(2)
  }
  await expect(page.locator('.done-log li[data-running]')).toHaveCount(1)
  const edges = await page
    .locator('.done-log-words')
    .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().x)))
  expect(new Set(edges).size).toBe(1)
})

test('the strip draws each design in its template’s layout from the select stage on, and keeps it at ready', async ({
  page,
}) => {
  await page.clock.install()
  const chosen = statusFor(SLUG, 'building')
  await openDone(page, SLUG, [chosen, statusFor(SLUG, 'ready')])
  const strip = page.locator('.done-strip .design-poster')
  await expect(strip).toHaveCount(3)
  const layouts =
    chosen.status === 'missing' ? [] : chosen.concepts.map((c) => layoutOf(c.templateId))
  expect(new Set(layouts).size).toBe(3)
  const drawn = () =>
    strip.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-layout')))
  expect(await drawn()).toEqual(layouts)
  await expect(strip.locator('img')).toHaveCount(0)

  await page.clock.runFor(CONFIG.polling.statusMs)
  await expect(strip.locator('img')).toHaveCount(3)
  expect(await drawn()).toEqual(layouts)
  await settled(page)
  // Nothing a layout draws runs past its poster's edge, at the strip's size.
  const spills = await strip.evaluateAll(
    (nodes) => nodes.filter((node) => node.scrollWidth > node.clientWidth).length,
  )
  expect(spills).toBe(0)
})

test('a build that ended without designs, opened from a link, keeps only the island’s clearance', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'failed')])
  await expect(page.locator('main#main h1')).toBeFocused()
  await expect(region(page).locator('.start-stage')).toBeHidden()
  const [pane, title] = await Promise.all([box(region(page)), box(page.locator('main#main h1'))])
  expect(pane.height).toBeLessThan(160)
  expect(title.y).toBeLessThan(200)
})

test.describe('on a short phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  test('while the designs build the column reads heading, lead, progress, page card, rows, with the ring in the first screen', async ({
    page,
  }) => {
    await openDone(page, SLUG, [statusFor(SLUG, 'building')])
    await expect(page.locator('.done-log')).toBeVisible()
    await settled(page)
    await expect(page.locator('.stage-ring')).toBeInViewport({ ratio: 1 })
    const [heading, lead, progress, card, rows] = await Promise.all([
      box(page.locator('main#main h1')),
      box(page.locator('main#main h1 + p')),
      box(page.locator('.done-progress')),
      box(page.locator('.done-page[data-place="column"]')),
      box(page.locator('main#main').getByRole('list', { name: 'Your designs' })),
    ])
    expect(heading.y + heading.height).toBeLessThanOrEqual(lead.y)
    expect(lead.y + lead.height).toBeLessThanOrEqual(progress.y)
    expect(progress.y + progress.height).toBeLessThanOrEqual(card.y)
    expect(card.y + card.height).toBeLessThanOrEqual(rows.y)
  })
})

test.describe('on a phone on its side', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('the strip keeps a step of air under the island', async ({ page }) => {
    await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
    await expect(page.locator('.done-strip')).toBeVisible()
    await settled(page)
    const [island, strip] = await Promise.all([
      box(page.locator('header').first()),
      box(page.locator('.done-strip')),
    ])
    expect(strip.y - (island.y + island.height)).toBeGreaterThanOrEqual(16)
  })
})
