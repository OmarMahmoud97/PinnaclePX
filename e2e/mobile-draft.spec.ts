import { expect, type Page, test } from '@playwright/test'
import { CONFIG } from '@/lib/config'
import { changed, next, pixels, settle } from './helpers/draft'
import { ANSWERED, refuseSends, withDraft } from './helpers/start'

// The live draft on a phone (docs/start-page-journey-plan.md, D8, 4.2, 6.2 and package P6): the
// phone frame is a window onto the draft, 358 by 212 in a 308 px region; each answer changes a
// tenth of the window and each Next a twentieth of the region; the window moves to the part each
// question feeds
// and crossfades as it does; the curve springs after a Next and sleeps; the crops at other sizes;
// and nothing an answer changes set under 12 px. Nothing here sends a brief.

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

// Back at the top of the page, where the region is, with everything at rest.
async function top(page: Page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await settle(page)
}

async function heightOf(page: Page, selector: string): Promise<number> {
  const box = await page.locator(selector).first().boundingBox()
  return box?.height ?? Number.NaN
}

test('the region is the island, a 358 by 212 window onto the draft, and the curve', async ({
  page,
}) => {
  await page.goto('/start?q=1')
  await expect(heading(page)).toBeVisible()
  expect(await region(page).evaluate((element) => element.getBoundingClientRect().height)).toBe(308)
  await expect(draftWindow(page)).toHaveCount(1)
  const box = await draftWindow(page).boundingBox()
  expect(box).toMatchObject({ x: 16, y: 72, width: 358, height: 212 })
  await expect(draftWindow(page)).toContainText('Live draft')
  await expect(draftWindow(page)).toContainText('your-business')
  await expect(region(page).locator('[data-frame="browser"]')).toBeHidden()
  await expect(region(page).locator('[data-curve]')).toBeVisible()
})

// The plan's two measures of a draft that answers back (section 1, row 2), as its audit took
// them: an answered question changes a tenth of the frame, here the window, from where the
// question before left it, and a Next a twentieth of the pane, here the region, as the next
// question arrives.
test('each question changes a tenth of the window, and each Next a twentieth of the region', async ({
  page,
}) => {
  test.slow()
  await page.goto('/start')
  await expect(heading(page)).toHaveText('Start with a sentence.')
  await settle(page)
  const shoot = async () => ({
    frame: await pixels(page, draftWindow(page)),
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
    expect(changed(answered.frame, now.frame), `the ${name}`).toBeGreaterThanOrEqual(0.1)
    answered = now
  }
})

test('the window moves to the part each question feeds, crossfading as it does', async ({
  page,
}) => {
  await withDraft(page, { reached: 4 })
  for (const [index, offset] of CONFIG.start.window.offsetsPx.entries()) {
    await page.goto(`/start?q=${String(index + 1)}`)
    await expect(heading(page)).toBeVisible()
    const shift = await draftWindow(page).evaluate((phone) => {
      const screen = phone.querySelector('.draft-screen')
      const page = screen?.querySelector('.draft-page')
      if (!screen || !page) throw new Error('no window')
      return screen.getBoundingClientRect().top - page.getBoundingClientRect().top
    })
    expect(shift, `question ${String(index + 1)}`).toBe(offset)
  }

  // From the name to the look the window moves, so it fades out and back while it jumps.
  await page.goto('/start?q=2')
  await expect(heading(page)).toHaveText('Put your name on it.')
  await next(page, 3)
  const screen = draftWindow(page).locator('.draft-screen')
  await expect(screen).toHaveAttribute('data-turn', /^[01]$/)
  expect(
    await screen.evaluate((element) =>
      element
        .getAnimations()
        .map((animation) => (animation instanceof CSSAnimation ? animation.animationName : '')),
    ),
  ).toEqual([expect.stringMatching(/^draft-turn-[01]$/)])
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

  test('the window is 288 wide and its short crop, and nothing scrolls sideways', async ({
    page,
  }) => {
    await withDraft(page, { reached: 4 })
    await page.goto('/start?q=3')
    await expect(heading(page)).toBeVisible()
    expect(await draftWindow(page).boundingBox()).toMatchObject({ width: 288, height: 150 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  })
})

test.describe('on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  test('the window takes its short crop and the region 226 px', async ({ page }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeVisible()
    expect(await heightOf(page, 'section[aria-label="Your brief so far"]')).toBe(226)
    expect(await draftWindow(page).boundingBox()).toMatchObject({ width: 358, height: 150 })
  })
})

test.describe('from 36rem to lg', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('the region shows the desk page cropped at 300 px, and no window', async ({ page }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeVisible()
    const browser = region(page).locator('[data-frame="browser"]')
    expect(await browser.boundingBox()).toMatchObject({ width: 704, height: 300 })
    await expect(draftWindow(page)).toBeHidden()
    expect(await heightOf(page, 'section[aria-label="Your brief so far"]')).toBe(396)
  })
})

test.describe('on a 700 by 500 screen', () => {
  test.use({ viewport: { width: 700, height: 500 } })

  test('the desk page takes the short crop, and the title is in the first screen', async ({
    page,
  }) => {
    await page.goto('/start?q=1')
    await expect(heading(page)).toBeInViewport({ ratio: 1 })
    const browser = region(page).locator('[data-frame="browser"]')
    expect((await browser.boundingBox())?.height).toBe(CONFIG.start.window.shortCropPx)
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

// The picture's note shows until the draft is signed, and the signature from the last question.
const SET_AT = [
  [
    4,
    [
      '.draft-head',
      '.draft-mark .draft-name',
      '.draft-para',
      '.draft-art .draft-note',
      '.draft-tab',
    ],
  ],
  [5, [':scope > .draft-sign']],
] as const

test('nothing an answer changes is set under 12 px in the window', async ({ page }) => {
  await withDraft(page, { reached: 4, imagery: { style: 'warm', photos: [] } })
  for (const [question, selectors] of SET_AT) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(heading(page)).toBeVisible()
    const sizes = await draftWindow(page).evaluate(
      (phone, wanted) =>
        wanted.map((selector) => {
          const element = phone.querySelector(selector)
          return [selector, element === null ? 0 : parseFloat(getComputedStyle(element).fontSize)]
        }),
      [...selectors],
    )
    for (const [selector, size] of sizes) expect(size, String(selector)).toBeGreaterThanOrEqual(12)
  }
})
