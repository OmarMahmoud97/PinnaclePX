import { expect, type Page, test } from '@playwright/test'
import { oklch, parse, wcagContrast } from 'culori'
import type { DraftImagery } from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'
import { next, settle } from './helpers/draft'
import {
  ANSWERED,
  EDGE_NAMES,
  PIXEL_PNG,
  refuseSends,
  STUB_BLOB_ORIGIN,
  withDraft,
} from './helpers/start'

// The live draft at a desk (docs/start-page-journey-plan.md, 5.8 and package P6): a keystroke
// repaints it within 300 ms, a load or a refresh replays none of its landings (3.1) while an
// answer still lands, the business name lands in its places, a logo in both frames, the
// colour pours into a call to action that holds no words, nothing is blue before the colour
// question, the sweep of awkward colours, the display faces and the note when one never comes,
// and the whisper. How much each answer and each Next change is measured on the phone
// (mobile-draft.spec.ts), where the region is the pane the plan measures. Nothing here sends a
// brief or stores a file.

const COMPANY = ANSWERED.company

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

// The desk's frame, and the part of it each question feeds.
function frame(page: Page) {
  return region(page).locator('[data-frame="browser"]')
}

function part(page: Page, name: string) {
  return frame(page).locator(`.draft-${name}`)
}

// A computed colour's OKLCH chroma.
function chromaOf(colour: string): number {
  return oklch(parse(colour))?.c ?? Number.NaN
}

test('a keystroke repaints the draft within 300 ms', async ({ page }) => {
  await page.goto('/start?q=1')
  const field = page.getByLabel('What does your business do?')
  await expect(field).toBeVisible()
  await field.focus()
  // The watch is set before the key goes down: from the keydown to the first frame painted after
  // the headline shows the letter.
  await page.evaluate(() => {
    const head = document.querySelector('[data-frame="browser"] .draft-head')
    if (head === null) throw new Error('no headline')
    const repaint = new Promise<number>((resolve) => {
      let pressed = 0
      document.addEventListener(
        'keydown',
        () => {
          pressed = performance.now()
        },
        { once: true },
      )
      new MutationObserver(() => {
        if (head.textContent.includes('Q')) {
          requestAnimationFrame(() => {
            resolve(performance.now() - pressed)
          })
        }
      }).observe(head, { subtree: true, childList: true, characterData: true })
    })
    Object.assign(window, { repaint })
  })
  await page.keyboard.press('Q')
  const repaint = await page.evaluate(
    () => (window as unknown as { repaint: Promise<number> }).repaint,
  )
  expect(repaint).toBeLessThanOrEqual(300)
})

// The draft's animations and the whisper's seen running at any frame since the page began.
async function watchLandings(page: Page) {
  await page.addInitScript(() => {
    const running = new Set<string>()
    Object.assign(window, { draftRunning: running })
    function sample() {
      for (const animation of document.getAnimations()) {
        const { effect } = animation
        if (animation.playState !== 'running' || !(effect instanceof KeyframeEffect)) continue
        if (effect.target?.closest('[data-draft], .draft-whisper') == null) continue
        running.add(animation instanceof CSSAnimation ? animation.animationName : 'other')
      }
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  return () =>
    page.evaluate(() => [...(window as unknown as { draftRunning: Set<string> }).draftRunning])
}

test('a load or a refresh replays nothing, and an answer still lands', async ({ page }) => {
  const landings = await watchLandings(page)
  await withDraft(page, { reached: 1 })
  for (const arrive of [() => page.goto('/start?q=2'), () => page.reload()]) {
    await arrive()
    await expect(heading(page)).toHaveText('Put your name on it.')
    await expect(whisper(page)).toHaveText(COMPANY)
    await page.waitForTimeout(1_000)
    expect(await landings()).toEqual([])
  }
  await page.getByLabel('Business name').fill('')
  await page.getByLabel('Business name').fill(COMPANY)
  await expect.poll(landings).toContain('draft-land')
})

test('the business name lands in the tab and its places, and a logo in both frames', async ({
  page,
}) => {
  // An upload that never answers: the logo stays in memory and nothing reaches Blob.
  await page.route('**/api/upload**', () => {
    // Left unanswered on purpose.
  })
  await withDraft(page, { reached: 1, company: '' })
  await page.goto('/start?q=2')
  await page.getByLabel('Business name').fill(COMPANY)
  await expect(region(page).getByText('ashgrove-physio').first()).toBeVisible()
  expect(await region(page).getByText(COMPANY, { exact: true }).count()).toBeGreaterThanOrEqual(3)

  await page.getByRole('radio', { name: /Use my logo/ }).click()
  await page.getByLabel('Choose a file').setInputFiles(PIXEL_PNG)
  await expect(region(page).locator('[style*="blob:"]')).toHaveCount(2)
})

test('the call to action is a pill, ink until the colour pours into it', async ({ page }) => {
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await expect(heading(page)).toHaveText('Pick a look.')
  const cta = part(page, 'cta')
  // Nothing blue before the colour question: the house's ink.
  const ink = await cta.evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(chromaOf(ink)).toBeLessThan(CONFIG.colour.greyChroma)

  await next(page, 4)
  await page.getByRole('radio', { name: 'Plum' }).click()
  await expect
    .poll(async () => chromaOf(await cta.evaluate((e) => getComputedStyle(e).backgroundColor)))
    .toBeGreaterThan(0.05)
  // Its only words are the question's tag: a pill with a bar, never a label.
  await expect(cta).toHaveText('04 Colour')
})

test('the region says the brief in words, and the visitor’s photo takes the picture', async ({
  page,
}) => {
  const photo = `${STUB_BLOB_ORIGIN}/photos/shop.png`
  await page.route(`${STUB_BLOB_ORIGIN}/**`, (route) =>
    route.fulfill({ body: PIXEL_PNG.buffer, contentType: PIXEL_PNG.mimeType }),
  )
  await withDraft(page, {
    reached: 3,
    imagery: { style: 'dark', photos: [{ id: 'shop', fileName: 'shop.png', url: photo }] },
  })
  await page.goto('/start?q=4')
  await expect(heading(page)).toHaveText('Choose a colour.')
  await expect(region(page).locator('p.sr-only')).toHaveText(
    'Your brief so far: Sentence, Ashgrove Physio, Dark and moody, 1 photo.',
  )
  // The chips are retired: the sentence is the region's only words about the brief.
  await expect(region(page).locator('ul')).toHaveCount(0)
  await expect(part(page, 'art').locator('img')).toHaveAttribute('src', photo)
  await expect(part(page, 'art').locator('.draft-note')).toHaveCount(0)
})

// The plan's sweep (5.8): colours that broke the old sketch or sit at the edges, greys among them.
const SWEEP = [
  ['#ffff00', false],
  ['#ff5a1f', false],
  ['#339906', false],
  ['#e91e63', false],
  ['#4e8a15', false],
  ['#000000', true],
  ['#ffffff', true],
  ['#808080', true],
  ['#fafaf0', true],
] as const

test('any colour keeps the headline readable, and a grey keeps the studio’s light', async ({
  page,
}) => {
  await withDraft(page, { reached: 3 })
  await page.goto('/start?q=4')
  await page.getByRole('radio', { name: /My own colour/ }).click()
  const field = page.getByRole('textbox', { name: 'Hex code' })
  const draft = region(page).locator('[data-draft]')
  for (const [hex, grey] of SWEEP) {
    await field.fill(hex)
    await expect(draft).toHaveAttribute('data-coloured', '')
    if (grey) await expect(draft, hex).toHaveAttribute('data-grey', '')
    else await expect(draft, hex).not.toHaveAttribute('data-grey', '')
    await settle(page)
    const [head, ground] = await Promise.all([
      part(page, 'head').evaluate((element) => getComputedStyle(element).color),
      part(page, 'page').evaluate((element) => getComputedStyle(element).backgroundColor),
    ])
    expect(wcagContrast(head, ground), hex).toBeGreaterThanOrEqual(4.5)
  }
})

const WARM: DraftImagery = { style: 'warm', photos: [] }

test('the look sets the draft’s headline and wordmark in its display face', async ({ page }) => {
  await withDraft(page, { reached: 2, imagery: WARM })
  await page.goto('/start?q=3')
  await expect
    .poll(() => part(page, 'head').evaluate((element) => getComputedStyle(element).fontFamily), {
      timeout: 10_000,
    })
    .toContain('Fraunces')
  expect(
    await part(page, 'mark').evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain('Fraunces')
  await expect(region(page).getByText('set in Fraunces in your designs')).toHaveCount(0)
})

test('a face that never arrives leaves Mona Sans, and says which face the designs use', async ({
  page,
}) => {
  await withDraft(page, { reached: 1, imagery: WARM })
  await page.goto('/start?q=2')
  await expect(heading(page)).toHaveText('Put your name on it.')
  await page.evaluate(() => document.fonts.ready)
  // From here no font file answers.
  await page.route('**/*.woff2', () => {
    // Left unanswered on purpose.
  })
  await next(page, 3)
  await expect(region(page).getByText('set in Fraunces in your designs').first()).toBeVisible({
    timeout: CONFIG.start.fonts.timeoutMs + 5_000,
  })
  expect(
    await part(page, 'head').evaluate((element) => getComputedStyle(element).fontFamily),
  ).not.toContain('Fraunces')
})

function whisper(page: Page) {
  return region(page).locator('.draft-whisper p')
}

test('the business name whispers at the foot where it fits, and nowhere else', async ({ page }) => {
  await withDraft(page, { reached: 1 })
  await page.goto('/start?q=2')
  await expect(whisper(page)).toHaveText(COMPANY)
  await expect(whisper(page)).toHaveCSS('opacity', '1')

  // A 24-grapheme name would shrink under 3rem at 1024 wide, so it does not show there.
  await page.setViewportSize({ width: 1024, height: 768 })
  await page.getByLabel('Business name').fill(EDGE_NAMES.whisperLongest)
  await expect(whisper(page)).toHaveCSS('opacity', '0')
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(whisper(page)).toHaveCSS('opacity', '1')

  // A longer name, or one in a script the faces do not carry, has none.
  await page.getByLabel('Business name').fill(`${EDGE_NAMES.whisperLongest}s`)
  await expect(whisper(page)).toHaveCount(0)
  await page.getByLabel('Business name').fill('東京カフェ')
  await expect(whisper(page)).toHaveCount(0)
})
