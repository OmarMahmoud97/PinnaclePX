import { expect, type Locator, type Page, test } from '@playwright/test'
import { DRAFT_CAPTION } from '@/app/start/_components/draft-copy'
import { settle } from './helpers/draft'
import { refuseSends, withDraft } from './helpers/start'

// The questions on a laptop's desk (docs/start-page-journey-plan.md, 4.2; ADR 0037's polish of
// 25 September 2026): under 900 px tall the question is set to fit, so on arrival the first
// control is whole above the action row riding at the card's foot, and the row never hides what
// the question is about; under 640 px, where no question fits, the row waits in its place at the
// end of the question instead; the draft's board holds its own screen from lg, its frame level
// with the title and still from question to question, in view while a long question scrolls; the
// looks sit two up from 1280; and the send question's ask never widens its column. Nothing here
// sends a brief.

const TITLES = [
  'Start with a sentence.',
  'Put your name on it.',
  'Pick a look.',
  'Choose a colour.',
  'Where should we send them?',
] as const

// The laptop band the visual QA found the sticky row covering a control on, the desk at the
// line where the row starts to wait in its place, and one under it.
const LAPTOPS = [
  { width: 1366, height: 657 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 1024, height: 640 },
  { width: 1024, height: 600 },
] as const

// Under 40rem tall a desk's row waits at the end of the question, and the scroll padding that
// kept a focused control clear of it goes too (start.css).
const ROW_WAITS_UNDER_PX = 640

// How far above the ask's top a first control must start: the fade's own 24 px (plan 4.2).
const FADE_PX = 24
// A frame's top may differ from the title's by the title's own line box and rounding.
const LEVEL_PX = 1

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function frame(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' }).locator('[data-frame="browser"]')
}

// The question's first control: the description, the business name, the first look or colour
// card, the email.
function firstControl(page: Page) {
  return page
    .locator('main#main form [data-rise="controls"]')
    .locator('textarea, input:not([type="hidden"]), [role="radio"]')
    .first()
}

async function open(page: Page, question: number) {
  await withDraft(page, { reached: 4 })
  await page.goto(`/start?q=${String(question)}`)
  await expect(heading(page)).toHaveText(TITLES[question - 1] ?? '')
  await settle(page)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
}

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('nothing to measure')
  return found
}

function scrollPadding(page: Page) {
  return page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom),
  )
}

for (const laptop of LAPTOPS) {
  test.describe(`at ${String(laptop.width)} by ${String(laptop.height)}`, () => {
    test.use({ viewport: laptop })

    const waits = laptop.height < ROW_WAITS_UNDER_PX

    test('the first control of every question is whole above the action row on arrival', async ({
      page,
    }) => {
      for (const question of [1, 2, 3, 4, 5]) {
        await open(page, question)
        const control = await box(firstControl(page))
        const actions = page.locator('main .start-actions')
        await expect(actions).toHaveCSS('position', waits ? 'static' : 'sticky')
        const row = await box(actions)
        const ask = await box(page.locator('main .start-ask'))
        expect(control.y + control.height, `question ${String(question)}`).toBeLessThanOrEqual(
          row.y,
        )
        expect(ask.y - control.y, `question ${String(question)}`).toBeGreaterThanOrEqual(FADE_PX)
        await expect(heading(page)).toBeInViewport({ ratio: 1 })
      }
      if (waits) expect(await scrollPadding(page)).toBe(0)
      else expect(await scrollPadding(page)).toBeGreaterThan(0)
    })

    test('the board holds still, level with the title, from question to question', async ({
      page,
    }) => {
      let top: number | null = null
      for (const question of [1, 2, 3, 4, 5]) {
        await open(page, question)
        const [title, draft] = await Promise.all([box(heading(page)), box(frame(page))])
        expect(Math.abs(draft.y - title.y), `question ${String(question)}`).toBeLessThanOrEqual(
          LEVEL_PX,
        )
        top ??= draft.y
        expect(draft.y, `question ${String(question)}`).toBe(top)
      }
    })
  })
}

test.describe('at 1024 by 768', () => {
  test.use({ viewport: { width: 1024, height: 768 } })

  test('the board keeps its frame and caption in view while the look question scrolls', async ({
    page,
  }) => {
    await open(page, 3)
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(height).toBeGreaterThan(768)
    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await expect(frame(page)).toBeInViewport({ ratio: 1 })
    await expect(page.getByText(DRAFT_CAPTION.live)).toBeInViewport({ ratio: 1 })
  })

  test('the send question keeps the split where the others have it', async ({ page }) => {
    const region = page.getByRole('region', { name: 'Your brief so far' })
    await open(page, 4)
    const before = await box(region)
    await open(page, 5)
    const after = await box(region)
    expect(after.x).toBe(before.x)
    expect(after.width).toBe(before.width)
    await expect(region.locator('.draft-whisper p')).toHaveCSS('opacity', '1')
  })
})

test.describe('at 1280 by 800', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('the looks sit two to a row', async ({ page }) => {
    await open(page, 3)
    const looks = page.getByRole('radiogroup', { name: 'Look' }).getByRole('radio')
    await expect(looks).toHaveCount(4)
    const [first, second, third] = await Promise.all([
      box(looks.nth(0)),
      box(looks.nth(1)),
      box(looks.nth(2)),
    ])
    expect(second.y).toBe(first.y)
    expect(second.x).toBeGreaterThan(first.x)
    expect(third.x).toBe(first.x)
  })
})

test.describe('at 1440 by 900', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the frame sits level with the title and the page still fits the screen', async ({
    page,
  }) => {
    for (const question of [1, 3, 5]) {
      await open(page, question)
      const [title, draft] = await Promise.all([box(heading(page)), box(frame(page))])
      expect(Math.abs(draft.y - title.y), `question ${String(question)}`).toBeLessThanOrEqual(
        LEVEL_PX,
      )
      expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(900)
    }
  })
})
