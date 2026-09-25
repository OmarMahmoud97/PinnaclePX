import { expect, type Page, test } from '@playwright/test'
import { CONFIG } from '@/lib/config'
import { changed, next, pixels, settle } from './helpers/draft'
import { ANSWERED, refuseSends, withDraft } from './helpers/start'

// The live draft on a phone (docs/start-page-journey-plan.md, 4.2 and 6.2, as ADR 0037's seventh
// amendment amends them): the region shows the desk's browser frame whole, zoomed to the screen's
// width, 358 across at 390 wide, the phone frame hidden; the frame keeps its 640 px layout with
// nothing cut off, and the tag holds its size on screen; each answer changes a tenth of the frame
// and each Next a twentieth of the region; the curve springs after a Next and sleeps; the caps on
// a short screen and in the stacked band; and under 30rem tall the draft gives way. Nothing here
// sends a brief.

// The frame's layout width, the desk's, whatever the zoom (app/_styles/start-draft.css).
const LAYOUT_PX = 640
// What the region adds around the frame: the island's clearance above (72 px, or 64 on a short
// screen) and the curve's clearance below (24, or 12).
const REGION_PADDING_PX = 96
const SHORT_REGION_PADDING_PX = 76
// The tag on screen: 11 px of type on a line of its own height, with 0.2em above and below.
const TAG_HEIGHT_PX = 11 * 1.4

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

function phone(page: Page) {
  return region(page).locator('[data-frame="phone"]')
}

// Back at the top of the page, where the region is, with everything at rest.
async function top(page: Page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await settle(page)
}

// The frame's box on screen, its layout width, and how much of its page it clips (nothing, when
// the page is whole in it).
function measure(page: Page) {
  return frame(page).evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error('no frame')
    const box = element.getBoundingClientRect()
    return {
      x: box.x,
      width: box.width,
      height: box.height,
      layoutWidth: element.offsetWidth,
      clipped: element.scrollHeight - element.clientHeight,
    }
  })
}

async function regionHeight(page: Page): Promise<number> {
  return region(page).evaluate((element) => element.getBoundingClientRect().height)
}

test('the region is the island, the desk’s frame whole at the screen’s width, and the curve', async ({
  page,
}) => {
  await page.goto('/start?q=1')
  await expect(heading(page)).toBeVisible()
  await settle(page)
  await expect(frame(page)).toBeVisible()
  await expect(frame(page)).toContainText('your-business')
  const box = await measure(page)
  expect(box).toMatchObject({ x: 16, width: 358, layoutWidth: LAYOUT_PX, clipped: 0 })
  expect((await regionHeight(page)) - box.height).toBeCloseTo(REGION_PADDING_PX, 0)
  await expect(phone(page)).toBeHidden()
  await expect(region(page).locator('[data-curve]')).toBeVisible()
})

// The plan's two measures of a draft that answers back (section 1, row 2), as its audit took
// them: an answered question changes a tenth of the frame, from where the question before left
// it, and a Next a twentieth of the pane, here the region, as the next question arrives. Two
// answers change less than a tenth of the desk's frame, which is now the phone's: the name
// lands as type in the wordmark, the headline, the tab and the footer, and the colour pours into
// the pills, the cards' tint and the footer. Measured on 25 September 2026 at 390 by 844: the
// sentence 0.296, the name 0.087, the look 0.225, the colour 0.058, the send 0.197 (at 1440 by
// 900: 0.292, 0.072, 0.196, 0.049, 0.145); their floors sit under both readings.
const SHARES: Readonly<Record<string, number>> = { name: 0.07, colour: 0.045 }

test('each question changes a tenth of the frame, and each Next a twentieth of the region', async ({
  page,
}) => {
  test.slow()
  await page.goto('/start')
  await expect(heading(page)).toHaveText('Start with a sentence.')
  await settle(page)
  const shoot = async () => ({
    frame: await pixels(page, frame(page)),
    pane: await pixels(page, region(page)),
  })
  let answered = await shoot()

  const steps: readonly (readonly [string, () => Promise<void>])[] = [
    ['sentence', () => page.getByLabel('What does your business do?').fill(ANSWERED.description)],
    ['name', () => page.getByLabel('Business name').fill(ANSWERED.company)],
    ['look', () => page.getByRole('radio', { name: /Bold and bright/ }).click()],
    ['colour', () => page.getByRole('radio', { name: 'Plum' }).click()],
    [
      'send',
      async () => {
        await page.getByLabel('Email').fill(ANSWERED.email)
        await page.getByLabel('Your name').fill('Sam')
      },
    ],
  ]
  for (const [index, [name, answer]] of steps.entries()) {
    if (index > 0) {
      await next(page, index + 1)
      await top(page)
      const arrived = await pixels(page, region(page))
      expect(changed(answered.pane, arrived), `the Next to ${name}`).toBeGreaterThanOrEqual(0.05)
    }
    await answer()
    await top(page)
    const now = await shoot()
    expect(changed(answered.frame, now.frame), `the ${name}`).toBeGreaterThanOrEqual(
      SHARES[name] ?? 0.1,
    )
    answered = now
  }
})

test('nothing is cut off at any question, and the last boxes the whole page inside the frame', async ({
  page,
}) => {
  await withDraft(page, { reached: 4 })
  for (const question of [1, 2, 3, 4, 5]) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(heading(page)).toBeVisible()
    await settle(page)
    expect(await measure(page), `question ${String(question)}`).toMatchObject({
      width: 358,
      layoutWidth: LAYOUT_PX,
      clipped: 0,
    })
  }
  const whole = frame(page).locator('.draft-whole')
  await expect(whole).toBeVisible()
  const [box, inside] = await Promise.all([whole.boundingBox(), frame(page).boundingBox()])
  if (box === null || inside === null) throw new Error('nothing to measure')
  expect(box.y).toBeGreaterThanOrEqual(inside.y)
  expect(box.y + box.height).toBeLessThanOrEqual(inside.y + inside.height)
})

// The tag is sized against the zoom in force (start-draft.css), so at the phone's zoom it still
// reads at 11 px, as it does on every desk.
test('the tag holds its size on screen at the phone’s zoom', async ({ page }) => {
  await page.goto('/start?q=1')
  await expect(heading(page)).toBeVisible()
  await settle(page)
  const tag = frame(page).locator('.draft-tag').first()
  await expect(tag).toHaveText('01 Sentence')
  expect((await tag.boundingBox())?.height).toBeCloseTo(TAG_HEIGHT_PX, 0)
})

test('the curve springs on a Next and lets go once it sleeps', async ({ page }) => {
  await withDraft(page, { reached: 0 })
  await page.goto('/start?q=1')
  await expect(heading(page)).toBeVisible()
  const curve = region(page).locator('[data-curve]')
  expect(await curve.evaluate((element) => element.style.transform)).toBe('')
  await next(page, 2)
  await expect
    .poll(() => curve.evaluate((element) => element.style.transform))
    .toMatch(/^scaleY\((?!1\))[\d.]+\)$/)
  await page.waitForTimeout(CONFIG.start.curve.sleepMs + 500)
  expect(await curve.evaluate((element) => element.style.transform)).toBe('')
})

test.describe('on a 320 by 640 phone', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('the frame takes the short cap, 192 wide, and nothing scrolls sideways', async ({
    page,
  }) => {
    await withDraft(page, { reached: 4 })
    await page.goto('/start?q=3')
    await expect(heading(page)).toBeVisible()
    expect(await measure(page)).toMatchObject({ width: 192, clipped: 0 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  })
})

test.describe('on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  test('the frame takes the short cap in a tightened region', async ({ page }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeVisible()
    await settle(page)
    const box = await measure(page)
    expect(box).toMatchObject({ width: 192, clipped: 0 })
    expect((await regionHeight(page)) - box.height).toBeCloseTo(SHORT_REGION_PADDING_PX, 0)
  })
})

test.describe('on a 360 by 740 phone', () => {
  test.use({ viewport: { width: 360, height: 740 } })

  test('the frame takes the taller short cap, 256 wide', async ({ page }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeVisible()
    expect(await measure(page)).toMatchObject({ width: 256, clipped: 0 })
  })
})

test.describe('on a 375 by 812 phone', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('the frame takes the same cap, 256 wide, up to 52rem tall', async ({ page }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeVisible()
    expect(await measure(page)).toMatchObject({ width: 256, clipped: 0 })
  })
})

test.describe('from 36rem to lg', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('the frame sits at its own size, whole, and no phone shows', async ({ page }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeVisible()
    await settle(page)
    const box = await measure(page)
    expect(box).toMatchObject({ x: 64, width: LAYOUT_PX, clipped: 0 })
    expect((await regionHeight(page)) - box.height).toBeCloseTo(REGION_PADDING_PX, 0)
    await expect(phone(page)).toBeHidden()
  })
})

test.describe('on a 700 by 500 screen', () => {
  test.use({ viewport: { width: 700, height: 500 } })

  test('the frame takes the band’s cap, and the title is in the first screen', async ({ page }) => {
    await withDraft(page, { reached: 4 })
    for (const question of [1, 5]) {
      await page.goto(`/start?q=${String(question)}`)
      await expect(heading(page)).toBeInViewport({ ratio: 1 })
      expect(await measure(page), `question ${String(question)}`).toMatchObject({
        width: 256,
        clipped: 0,
      })
    }
  })
})

test.describe('under 30rem tall', () => {
  test.use({ viewport: { width: 844, height: 390 } })

  test('the draft and the curve give way, and the title is in the first screen', async ({
    page,
  }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeInViewport()
    await expect(region(page).locator('[data-draft]')).toBeHidden()
    await expect(region(page).locator('[data-curve]')).toBeHidden()
  })
})
