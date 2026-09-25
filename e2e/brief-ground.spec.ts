import { expect, type Page, test } from '@playwright/test'
import sharp from 'sharp'
import { CARRIED_KEY } from '@/lib/brief/draft'
import { refuseSends, withDraft } from './helpers/start'

// The ground the questions stand on at a desk (docs/start-page-journey-plan.md, 5.3, 5.4 and
// package P5): the hero's ramp under main, with every text box outside the white card on #c6dcee or
// lighter and every link on #e2eef7 or lighter, at the six desk sizes the plan names and at every
// question; a 1440 by 900 page that never scrolls, the colour question's hex field open included;
// and the ramp on main's ground while the region that declares the sketch's colours stays outside
// every dark scope. Nothing here sends a brief.

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'
// A first sentence long enough that the receipt echoes the most it can, 42 characters cut at a
// word, so its link falls as far across the ramp as it ever will.
const LONG_SENTENCE =
  'Plumber in Leeds, 24-hour call-outs and boiler servicing for homes and small businesses.'

const DESKS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1366, height: 657 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
] as const

// Each question as a returning visitor sees it, and the name question as the hero's sentence
// lands on it, which echoes the sentence with its link on a desk of any height, a short sentence
// and the longest echo.
const STATES = [
  { name: 'question 1', question: 1, carried: null },
  { name: 'question 2', question: 2, carried: null },
  { name: 'question 2 from the hero', question: 2, carried: SENTENCE },
  { name: 'question 2 from the hero, echoed at length', question: 2, carried: LONG_SENTENCE },
  { name: 'question 3', question: 3, carried: null },
  { name: 'question 4', question: 4, carried: null },
  { name: 'question 5', question: 5, carried: null },
] as const

// The two stops the plan's text rules name (5.4): body text on the first or lighter, brand-ink
// text and links on the second or lighter.
const BODY_FLOOR = '#c6dcee'
const LINK_FLOOR = '#e2eef7'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
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

// Every line of text in main outside the question's card, box by box, as its text nodes lay it
// out, and whether it is a link.
function textBoxes(page: Page): Promise<Box[]> {
  return page.evaluate(() => {
    const main = document.getElementById('main')
    if (main === null) return []
    const boxes: Box[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      const parent = node.parentElement
      if (parent === null || node.textContent?.trim() === '') continue
      if (parent.closest('.start-card, .sr-only, [aria-hidden="true"], noscript') !== null) continue
      if (!parent.checkVisibility()) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width < 1 || rect.height < 1) continue
        boxes.push({
          what: (node.textContent ?? '').trim().slice(0, 40),
          link: parent.closest('a') !== null,
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        })
      }
    }
    return boxes
  })
}

// The darkest pixel of the ground under each box, read from a shot of the page with main's text
// made transparent, so what is read is the ground and never a glyph.
async function groundUnder(page: Page, boxes: readonly Box[]) {
  await page.addStyleTag({
    content:
      'main#main, main#main * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; caret-color: transparent !important; }',
  })
  const shot = await page.screenshot()
  const { data, info } = await sharp(shot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return boxes.map((box) => {
    let darkest = Infinity
    for (let y = Math.max(0, box.y); y < Math.min(info.height, box.y + box.height); y += 1) {
      for (let x = Math.max(0, box.x); x < Math.min(info.width, box.x + box.width); x += 1) {
        const at = (y * info.width + x) * 3
        darkest = Math.min(darkest, luminance(data[at] ?? 0, data[at + 1] ?? 0, data[at + 2] ?? 0))
      }
    }
    return { ...box, darkest }
  })
}

// A still page: the question's entrance and every colour change over.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

// A question in a fresh tab: the answered draft, and the hero's sentence when it hands one over.
async function open(page: Page, question: number, carried: string | null) {
  await withDraft(page, { reached: 4 })
  if (carried !== null) {
    await page.addInitScript(
      ({ key, sentence }) => {
        sessionStorage.setItem(key, sentence)
      },
      { key: CARRIED_KEY, sentence: carried },
    )
  }
  await page.goto(`/start?q=${String(question)}`)
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
  await expect(page.locator('main#main h1')).toBeVisible()
  await settle(page)
}

for (const desk of DESKS) {
  test(`every text box outside the card stands on a light enough ground at ${String(desk.width)} by ${String(desk.height)}`, async ({
    page,
  }) => {
    const body = luminanceOf(BODY_FLOOR)
    const link = luminanceOf(LINK_FLOOR)
    const misses: string[] = []
    for (const state of STATES) {
      // A tab of its own for each state, so each begins as a visit does.
      const tab = await page.context().newPage()
      await tab.setViewportSize(desk)
      await refuseSends(tab)
      await open(tab, state.question, state.carried)
      const boxes = await textBoxes(tab)
      expect(boxes.length, `${state.name} shows its title`).toBeGreaterThan(0)
      for (const box of await groundUnder(tab, boxes)) {
        const floor = box.link ? link : body
        // A hair under the stop, for the gradient's own rounding.
        if (box.darkest < floor * 0.99) {
          misses.push(`${state.name}: "${box.what}" at ${String(box.x)},${String(box.y)}`)
        }
      }
      await tab.close()
    }
    expect(misses).toEqual([])
  })
}

test('at 1440 by 900 no question scrolls, the hex field open included', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  for (const question of [1, 2, 3, 4, 5]) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
    await expect(page.locator('main#main h1')).toBeVisible()
    await settle(page)
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(height, `question ${String(question)}`).toBe(900)
  }
  await page.goto('/start?q=4')
  await expect(page.locator('main#main h1')).toHaveText('Choose a colour.')
  await page.getByRole('radio', { name: /My own colour/ }).click()
  await page.getByRole('textbox', { name: 'Hex code' }).fill('#6b2d5b')
  await settle(page)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(900)
})

test('the ramp is main’s ground, and the region that declares the sketch’s colours is no scope', async ({
  page,
}) => {
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await expect(page.locator('main#main h1')).toHaveText('Pick a look.')
  const main = page.locator('main#main')
  expect(await main.evaluate((element) => getComputedStyle(element).backgroundImage)).toMatch(
    /linear-gradient/,
  )
  await expect(main).not.toHaveAttribute('data-theme', 'dark')
  // The canvas past the page's ends is white while the visitor answers on a desk.
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
    'rgb(255, 255, 255)',
  )
  // Neither the region, which declares the sketch's colours, nor anything around it is a scope,
  // so a light-style sketch keeps its white page.
  const region = page.getByRole('region', { name: 'Your brief so far' })
  expect(await region.evaluate((element) => element.closest('[data-theme]') === null)).toBe(true)
  await expect(region.locator('[data-frame="browser"]')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  )

  // Below lg main is the wash, never the ink, and the canvas the region's ink.
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(main).toHaveCSS('background-color', 'rgb(226, 238, 247)')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
    'rgb(2, 10, 18)',
  )
})
