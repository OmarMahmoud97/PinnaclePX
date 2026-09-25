import { expect, type Locator, type Page, test } from '@playwright/test'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { CONFIG } from '@/lib/config'
import { settle } from './helpers/draft'
import { EDGE_NAMES, refuseSends, withDraft } from './helpers/start'

// The short screens (docs/start-page-journey-plan.md, 4.2; ADR 0037's polish of 25 September
// 2026): at 320 by 640 the ask waits in its place, so every question's first control shows above
// it on arrival, the description's whole box among them; on a short phone the window's crop has
// offsets of its own, so the part each question feeds is whole in it, its selection box included,
// whether the headline takes one line or two; and in the stacked band under 52rem tall the desk
// page takes its short crop and the region tightens, so the first control clears the ask.
// Nothing here sends a brief.

// How far above the ask's top a first control must start: the fade's own 24 px (plan 4.2).
const FADE_PX = 24
// A part may meet the crop's edge, never cross it by more than the rounding of a line box.
const EDGE_PX = 1

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

function draftWindow(page: Page) {
  return region(page).locator('[data-frame="phone"]')
}

function firstControl(page: Page) {
  return page
    .locator('main#main form [data-rise="controls"]')
    .locator('textarea, input:not([type="hidden"]), [role="radio"]')
    .first()
}

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('nothing to measure')
  return found
}

// How far the selection box drawn on a part reaches past it (start-draft.css, [data-now]::after,
// 6 px on every side); nothing, for a part that carries no box.
function boxReach(part: Locator) {
  return part.evaluate((element) => {
    const reach = -parseFloat(getComputedStyle(element, '::after').top)
    return Number.isFinite(reach) ? reach : 0
  })
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

// The part each question feeds, in the window: the headline's words, the wordmark and its tag,
// the picture's tag, the call to action, and the whole-page box with its tag.
const PARTS = [
  ['.draft-head [data-now]'],
  ['.draft-mark', '.draft-mark .draft-tag'],
  ['.draft-art .draft-tag'],
  ['.draft-cta', '.draft-cta .draft-tag'],
  [':scope > .draft-whole', ':scope > .draft-whole .draft-tag'],
] as const

// The window's page sits at the question's short offset, and the question's parts, each with
// the box drawn on it, are whole in the window.
async function partsWhole(page: Page, index: number) {
  const id = QUESTION_IDS[index] ?? ''
  const phone = draftWindow(page)
  const shift = await phone.evaluate((element) => {
    const screen = element.querySelector('.draft-screen')
    const page = screen?.querySelector('.draft-page')
    if (!screen || !page) throw new Error('no window')
    return screen.getBoundingClientRect().top - page.getBoundingClientRect().top
  })
  expect(shift, id).toBe(CONFIG.start.window.shortOffsetsPx[index])
  // The whole-page box sits against the window; every other part against its screen.
  const inside = await box(index === 4 ? phone : phone.locator('.draft-screen'))
  for (const selector of PARTS[index] ?? []) {
    const part = phone.locator(selector)
    const [found, reach] = await Promise.all([box(part), boxReach(part)])
    expect(found.y - reach, `${id}: ${selector}`).toBeGreaterThanOrEqual(inside.y - EDGE_PX)
    expect(found.y + found.height + reach, `${id}: ${selector}`).toBeLessThanOrEqual(
      inside.y + inside.height + EDGE_PX,
    )
  }
}

test.describe('at 390 by 664', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  test('the short crop opens on the part each question feeds, whole', async ({ page }) => {
    for (const index of QUESTION_IDS.keys()) {
      await open(page, index + 1)
      await partsWhole(page, index)
    }
  })

  test('a two-line headline is whole: the blank note, a sentence, a long name', async ({
    page,
  }) => {
    const headlines = [
      // Every new visitor's arrival: the note that holds the sentence's place.
      { reached: 0, description: '' },
      // The sentence, set small, before the name takes the headline.
      { reached: 0 },
      // A name at the clamp.
      { company: EDGE_NAMES.longestCompany },
    ]
    for (const headline of headlines) {
      await open(page, 1, headline)
      const words = draftWindow(page).locator('.draft-head [data-now]')
      expect((await box(words)).height, JSON.stringify(headline)).toBeGreaterThan(24)
      await partsWhole(page, 0)
    }
  })
})

test.describe('at 640 by 800', () => {
  test.use({ viewport: { width: 640, height: 800 } })

  test('the desk page takes its short crop and every first control is whole above the ask', async ({
    page,
  }) => {
    for (const question of [1, 2, 3, 4, 5]) {
      await open(page, question)
      const browser = region(page).locator('[data-frame="browser"]')
      expect((await box(browser)).height).toBe(CONFIG.start.window.shortCropPx)
      const [control, ask] = await Promise.all([
        box(firstControl(page)),
        box(page.locator('main .start-ask')),
      ])
      expect(control.y + control.height, `question ${String(question)}`).toBeLessThanOrEqual(ask.y)
      expect(ask.y - control.y, `question ${String(question)}`).toBeGreaterThanOrEqual(FADE_PX)
    }
  })
})
