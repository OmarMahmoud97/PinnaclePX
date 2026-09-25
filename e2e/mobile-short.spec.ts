import { expect, type Locator, type Page, test } from '@playwright/test'
import { settle } from './helpers/draft'
import { refuseSends, withDraft } from './helpers/start'

// The short screens (docs/start-page-journey-plan.md, 4.2; ADR 0037's polish of 25 September
// 2026 and its seventh amendment): at 320 by 640 the ask waits in its place, so every question's
// first control shows above it on arrival, the description's whole box among them; on a phone
// under 43.75rem tall the draft's frame is capped at 0.3, so at 390 by 664 every question's
// title, its first field's own top edge and, on the typed questions, the label above it are
// clear of the ask's fade on arrival (mobile-start-ask.spec.ts and mobile-order.spec.ts hold the
// control itself 24 px clear); and in the stacked band under 52rem tall the frame is capped at 0.4 and the region
// tightens, so at 640 by 800 every first control starts clear of the ask and, from the second
// question, sits whole above it. Nothing here sends a brief.

// How far above the ask's top a first control must start: the fade's own 24 px (plan 4.2).
const FADE_PX = 24

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

function frame(page: Page) {
  return region(page).locator('[data-frame="browser"]')
}

function controls(page: Page) {
  return page.locator('main#main form [data-rise="controls"]')
}

function firstControl(page: Page) {
  return controls(page).locator('textarea, input:not([type="hidden"]), [role="radio"]').first()
}

// What the eye takes for the first field: the edge of its well or its first tile, and on the
// typed questions the label above it (the look and the colour name their tiles for a screen
// reader alone).
function firstField(page: Page) {
  return controls(page).locator('.start-well, [role="radio"]').first()
}

const LABELLED = [1, 2, 5]

function firstLabel(page: Page) {
  return controls(page).locator('label').first()
}

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('nothing to measure')
  return found
}

async function open(page: Page, question: number, draft: Parameters<typeof withDraft>[1] = {}) {
  await withDraft(page, { reached: 4, ...draft })
  await page.goto(`/start?q=${String(question)}`)
  await expect(heading(page)).toBeVisible()
  await settle(page)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
}

test.describe('at 320 by 640', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('the ask waits in its place and every first control starts above it', async ({ page }) => {
    for (const question of [1, 2, 3, 4, 5]) {
      await open(page, question)
      await expect(page.locator('main .start-ask')).toHaveCSS('position', 'static')
      const [control, ask] = await Promise.all([
        box(firstControl(page)),
        box(page.locator('main .start-ask')),
      ])
      expect(ask.y - control.y, `question ${String(question)}`).toBeGreaterThanOrEqual(FADE_PX)
      await expect(heading(page)).toBeInViewport({ ratio: 1 })
    }
    // The description's box, which the stuck ask hid whole, is in the first screen.
    await open(page, 1, { reached: 0, description: '' })
    await expect(page.getByLabel('What does your business do?')).toBeInViewport({ ratio: 1 })
  })
})

test.describe('at 390 by 664', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  test('the frame is capped at 0.3, and each first field’s label and edge are clear of the ask', async ({
    page,
  }) => {
    for (const question of [1, 2, 3, 4, 5]) {
      await open(page, question)
      expect((await box(frame(page))).width, `question ${String(question)}`).toBe(192)
      await expect(heading(page)).toBeInViewport({ ratio: 1 })
      const [field, ask] = await Promise.all([
        box(firstField(page)),
        box(page.locator('main .start-ask')),
      ])
      expect(field.y, `question ${String(question)}`).toBeLessThanOrEqual(ask.y)
      if (LABELLED.includes(question)) {
        const label = await box(firstLabel(page))
        expect(label.y + label.height, `question ${String(question)}`).toBeLessThanOrEqual(ask.y)
      }
    }
  })
})

test.describe('at 640 by 800', () => {
  test.use({ viewport: { width: 640, height: 800 } })

  test('the frame is capped at 0.4, and every first control starts clear of the ask, whole from the second question', async ({
    page,
  }) => {
    for (const question of [1, 2, 3, 4, 5]) {
      await open(page, question)
      expect((await box(frame(page))).width, `question ${String(question)}`).toBe(256)
      const [control, ask] = await Promise.all([
        box(firstControl(page)),
        box(page.locator('main .start-ask')),
      ])
      expect(ask.y - control.y, `question ${String(question)}`).toBeGreaterThanOrEqual(FADE_PX)
      if (question > 1) {
        expect(control.y + control.height, `question ${String(question)}`).toBeLessThanOrEqual(
          ask.y,
        )
      }
    }
  })
})
