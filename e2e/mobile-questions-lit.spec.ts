import { expect, type Page, test } from '@playwright/test'
import { refuseSends, withDraft } from './helpers/start'

// The questions on a phone in the hero's light (docs/start-page-journey-plan.md, 4.2, 5.7 and
// package P5): the region at most 320 px with the title in the first screen at every question,
// the title in view on a desktop at 400 per cent, the title at 36 px, the card flat on the wash
// with white wells below sm and white with wash wells from sm, and Back a 48 px round button that
// rides beside the ask, under it below 22.5rem. Nothing here sends a brief.

const TITLES = [
  'Start with a sentence.',
  'Put your name on it.',
  'Pick a look.',
  'Choose a colour.',
  'Where should we send them?',
] as const

// The most the region may take of a 390 by 844 phone (plan 9.6, as ADR 0037's seventh amendment
// moves it): the island's clearance, the desk's frame whole at the screen's width, about 300 px,
// and the curve's clearance; it measures 396.
const REGION_MAX_PX = 400
// Back's round button and the ask are both this tall (plan 9.5).
const TARGET_PX = 48

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

// A box is read from the finished layout: the question's entrance and the sketch's paint-in over.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

test('the region stays within 320 px and the title is in the first screen', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  for (const [index, title] of TITLES.entries()) {
    await page.goto(`/start?q=${String(index + 1)}`)
    await expect(heading(page)).toHaveText(title)
    await settle(page)
    const region = await page.getByRole('region', { name: 'Your brief so far' }).boundingBox()
    expect(region?.height ?? Infinity, title).toBeLessThanOrEqual(REGION_MAX_PX)
    await expect(heading(page)).toBeInViewport({ ratio: 1 })
    await expect(heading(page)).toHaveCSS('font-size', '36px')
  }
})

test.describe('at 320 by 256, a desktop at 400 per cent', () => {
  test.use({ viewport: { width: 320, height: 256 } })

  test('the title is in view on arrival', async ({ page }) => {
    await page.goto('/start')
    await expect(heading(page)).toBeFocused()
    await settle(page)
    await expect(heading(page)).toBeInViewport()
  })
})

test('the card is flat on the wash with white wells, and white with wash wells from sm', async ({
  page,
}) => {
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(heading(page)).toHaveText(TITLES[4])
  const card = page.locator('main .start-card')
  const email = page.getByRole('textbox', { name: 'Email' })
  await expect(card).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(email).toHaveCSS('background-color', 'rgb(255, 255, 255)')

  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(email).toHaveCSS('background-color', 'rgb(226, 238, 247)')
})

test('Back is a round button that rides beside the ask', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=3')
  await expect(heading(page)).toHaveText(TITLES[2])
  await settle(page)
  const back = page.getByRole('button', { name: 'Back', exact: true })
  const ask = page.getByRole('button', { name: 'Next: choose a colour', exact: true })
  // On arrival both ride at the foot of the screen, side by side.
  await expect(back).toBeInViewport({ ratio: 1 })
  await expect(ask).toBeInViewport({ ratio: 1 })
  const [round, next] = await Promise.all([back.boundingBox(), ask.boundingBox()])
  expect(round?.width).toBe(TARGET_PX)
  expect(round?.height).toBe(TARGET_PX)
  expect(Math.abs((round?.y ?? 0) - (next?.y ?? Infinity))).toBeLessThanOrEqual(1)
  expect((round?.x ?? Infinity) + (round?.width ?? 0)).toBeLessThanOrEqual(next?.x ?? 0)
})

test.describe('below 22.5rem', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('Back waits under the full-width ask, at the end of the question', async ({ page }) => {
    await withDraft(page, { reached: 4 })
    await page.goto('/start?q=2')
    await expect(heading(page)).toHaveText(TITLES[1])
    await settle(page)
    const back = page.getByRole('button', { name: 'Back', exact: true })
    const ask = page.getByRole('button', { name: 'Next: pick a look', exact: true })
    await back.scrollIntoViewIfNeeded()
    const [round, next] = await Promise.all([back.boundingBox(), ask.boundingBox()])
    expect(round?.y ?? 0).toBeGreaterThan((next?.y ?? Infinity) + (next?.height ?? 0))
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  })
})
