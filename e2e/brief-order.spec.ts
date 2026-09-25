import { expect, type Page, type Route, test } from '@playwright/test'
import sharp from 'sharp'
import { SEND_PICTURE_FAILED } from '@/app/start/_components/start-copy'
import {
  ANSWERED,
  interceptStatus,
  PIXEL_PNG,
  refuseSends,
  statusFor,
  withDraft,
} from './helpers/start'

// The questionnaire in its new order (docs/start-page-journey-plan.md, D2 and package P3):
// sentence, name, look, colour, send. Each question's title, tab, receipt and ask; the controls
// as radio groups; the hero's hand-off landing on the name; pictures that never hold up Next; and
// the walk from the first question to the done view, which is reached as a send reaches it, with
// the status poll answered from fixtures. Nothing here sends a brief or stores a file.

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'
const SLUG = 'bq7m2p9x4w3h'

// Each question's title, the tab it names and the ask that moves on from it (plan 4.6).
const QUESTIONS = [
  { title: 'Start with a sentence.', tab: '1 of 5: Start with a sentence', ask: 'Next: your name' },
  { title: 'Put your name on it.', tab: '2 of 5: Put your name on it', ask: 'Next: pick a look' },
  { title: 'Pick a look.', tab: '3 of 5: Pick a look', ask: 'Next: choose a colour' },
  { title: 'Choose a colour.', tab: '4 of 5: Choose a colour', ask: 'Next: one last step' },
  {
    title: 'Where should we send them?',
    tab: '5 of 5: Where should we send them',
    ask: 'Show me my three designs',
  },
] as const

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function sketch(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

function question(n: number) {
  const found = QUESTIONS[n - 1]
  if (found === undefined) throw new Error(`No question ${String(n)}`)
  return found
}

function ask(page: Page, n: number) {
  return page.getByRole('button', { name: question(n).ask, exact: true })
}

// Which question shows comes from the address, so a press is only done once the address moves.
async function moveTo(page: Page, from: number, to: number) {
  await ask(page, from).click()
  await expect(page).toHaveURL(new RegExp(`/start\\?q=${String(to)}$`))
  await expect(heading(page)).toHaveText(question(to).title)
}

// An upload that never answers: the token request waits for good, so the picture stays on its way
// and nothing reaches Blob. Registered after refuseSends, so it answers first.
async function holdUploads(page: Page) {
  await page.route('**/api/upload**', () => {
    // Left unanswered on purpose.
  })
}

const WHITE = { r: 250, g: 250, b: 250 }
const BLACK = { r: 10, g: 10, b: 10 }

// A logo of one colour on a transparent ground, drawn on the spot.
async function logoIn(colour: { r: number; g: number; b: number }, name: string) {
  const mark = await sharp({
    create: { width: 120, height: 60, channels: 4, background: { ...colour, alpha: 1 } },
  })
    .png()
    .toBuffer()
  const buffer = await sharp({
    create: { width: 200, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: mark, left: 40, top: 70 }])
    .png()
    .toBuffer()
  return { name, mimeType: 'image/png', buffer }
}

test('the questions run sentence, name, look, colour, send, to the done view', async ({ page }) => {
  await page.goto('/start')
  await expect(heading(page)).toHaveText(question(1).title)
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  await moveTo(page, 1, 2)

  // The name lands in the tab, the headline, the wordmark and the phone's copies.
  await page.getByLabel('Business name').fill('Ashgrove Physio')
  await expect(sketch(page).getByText('ashgrove-physio').first()).toBeVisible()
  expect(
    await sketch(page).getByText('Ashgrove Physio', { exact: true }).count(),
  ).toBeGreaterThanOrEqual(3)
  await moveTo(page, 2, 3)

  await page.getByRole('radio', { name: /Dark and moody/ }).click()
  await moveTo(page, 3, 4)

  await page.getByRole('radio', { name: 'Plum' }).click()
  await moveTo(page, 4, 5)

  await page.getByLabel('Email').fill(ANSWERED.email)
  await page.getByLabel('Your name').fill('Sam')
  await expect(ask(page, 5)).toBeEnabled()

  // The done view arrives in the page as a send brings it (brief-flow.tsx, send): the entry moves
  // to the done address in place, keeping the flow's marks and leaving Next to add its own, and
  // the poll answers from a fixture. Nothing is sent.
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  await page.evaluate((slug) => {
    const state: unknown = window.history.state
    const marks =
      typeof state === 'object' && state !== null
        ? Object.fromEntries(Object.entries(state).filter(([key]) => key.startsWith('start')))
        : {}
    window.history.replaceState(marks, '', `/start?q=done&s=${slug}`)
  }, SLUG)
  await expect(heading(page)).toHaveText('Your designs are on their way.')
  await expect(page.getByRole('list', { name: 'Your designs' })).toBeVisible()
})

test('each question names itself in the tab and its next step on the ask', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  for (const [index, { title, tab, ask: label }] of QUESTIONS.entries()) {
    await page.goto(`/start?q=${String(index + 1)}`)
    await expect(heading(page)).toHaveText(title)
    await expect(page).toHaveTitle(`${tab} | PinnaclePX`)
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
  }
})

test('on a tall desk each receipt says what the answer before it set', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  const receipts = [
    [2, 'Your sentence is in: “Physiotherapy clinic in Sheffield.” Change it'],
    [3, 'Ashgrove Physio is on the page.'],
    [4, 'Clean and minimal it is.'],
    [5, 'Forest it is. Your draft is finished.'],
  ] as const
  for (const [n, words] of receipts) {
    await page.goto(`/start?q=${String(n)}`)
    await expect(page.locator('main .start-receipt:visible')).toHaveText(words)
  }
  // A fresh first question has none.
  await page.goto('/start?q=1')
  await expect(heading(page)).toBeVisible()
  await expect(page.locator('main .start-receipt:visible')).toHaveCount(0)
})

test('on a short desk only the hero hand-off keeps a receipt, beside the helper', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 657 })
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=3')
  await expect(heading(page)).toBeVisible()
  await expect(page.locator('main .start-receipt:visible')).toHaveCount(0)

  await page.goto('/')
  await page.locator('#hero').getByRole('textbox').fill(SENTENCE)
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await expect(page.locator('main .start-receipt:visible')).toHaveText(
    'Your sentence is in: “Physiotherapy clinic in Sheffield.” Change it',
  )
  await expect(page.locator('main .start-helper')).toBeVisible()
})

test("the hero's sentence lands on the name, and Change it goes back to it and on again", async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#hero').getByRole('textbox').fill(SENTENCE)
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await expect(heading(page)).toHaveText(question(2).title)

  await page.getByRole('link', { name: 'Change it' }).click()
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.getByLabel('What does your business do?')).toHaveValue(SENTENCE)
  await moveTo(page, 1, 2)
})

test('the browser back button returns to the name with the answers intact', async ({ page }) => {
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  await moveTo(page, 1, 2)
  await page.getByLabel('Business name').fill('Ashgrove Physio')
  await moveTo(page, 2, 3)
  await page.goBack()
  await expect(page).toHaveURL(/q=2$/)
  await expect(page.getByLabel('Business name')).toHaveValue('Ashgrove Physio')
})

test('a refresh keeps the answers and the place', async ({ page }) => {
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  await moveTo(page, 1, 2)
  await page.getByLabel('Business name').fill('Ashgrove Physio')
  await moveTo(page, 2, 3)
  await page.reload()
  await expect(page).toHaveURL(/q=3$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByLabel('Business name')).toHaveValue('Ashgrove Physio')
})

test('the first question meters the sentence, and Enter goes on only once it is enough', async ({
  page,
}) => {
  await page.goto('/start')
  const field = page.getByLabel('What does your business do?')
  await expect(field).toHaveAccessibleDescription(/Aim for a sentence or two\./)
  await expect(field).toHaveAccessibleDescription(
    /Enter to go on, Shift and Enter for a new line\./,
  )
  await field.fill('Bike repair')
  await expect(page.getByText('19 more to go.', { exact: true })).toBeVisible()
  await field.press('Enter')
  await expect(page.getByText('Tell us a little more, a sentence or two is plenty.')).toBeVisible()
  await expect(page).toHaveURL(/\/start$/)

  await field.fill(SENTENCE)
  await field.press('Shift+Enter')
  await expect(field).toHaveValue(`${SENTENCE}\n`)
  await expect(page.getByText('That is plenty to start from.', { exact: true })).toBeVisible()
  await field.press('Enter')
  await expect(page).toHaveURL(/\/start\?q=2$/)
})

test('the mark is a choice, and a logo replaces it in both frames until removed', async ({
  page,
}) => {
  await holdUploads(page)
  await withDraft(page, { reached: 1 })
  await page.goto('/start?q=2')
  const group = page.getByRole('radiogroup', { name: 'Your mark' })
  await expect(group.getByRole('radio', { name: /Use my name/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(page.getByLabel('Choose a file')).toHaveCount(0)

  // An arrow chooses the logo and shows its picker, which it never opens.
  await group.getByRole('radio', { name: /Use my name/ }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(group.getByRole('radio', { name: /Use my logo/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await page.getByLabel('Choose a file').setInputFiles(PIXEL_PNG)
  const remove = page.getByRole('button', { name: 'Remove logo' })
  await expect(remove).toBeVisible()
  // The browser frame's mark and the phone frame's, both drawn from the file in memory.
  const marks = sketch(page).locator('[style*="blob:"]')
  await expect(marks).toHaveCount(2)
  await remove.click()
  await expect(marks).toHaveCount(0)
  await expect(page.getByLabel('Choose a file')).toBeVisible()
})

test('a light logo is shown on the ink and a dark one on the wash, as the designs set them', async ({
  page,
}) => {
  await holdUploads(page)
  await withDraft(page, { reached: 1 })
  await page.goto('/start?q=2')
  await page.getByRole('radio', { name: /Use my logo/ }).click()
  const thumbnail = page.locator('main img[src^="blob:"]')

  // The browser reads each file as the logo stage will (lib/logo/polarity.ts).
  await page.getByLabel('Choose a file').setInputFiles(await logoIn(WHITE, 'white.png'))
  await expect(thumbnail).toHaveAttribute('data-artwork', 'light-artwork')
  await expect(thumbnail).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: 'Remove logo' }).click()
  await page.getByLabel('Choose a file').setInputFiles(await logoIn(BLACK, 'black.png'))
  await expect(thumbnail).toHaveAttribute('data-artwork', 'dark-artwork')
  await expect(thumbnail).not.toHaveAttribute('data-theme', 'dark')
})

test('a picture still uploading never holds up Next, and the send waits for it', async ({
  page,
}) => {
  const sends: string[] = []
  page.on('request', (request) => {
    if (request.method() !== 'GET' && new URL(request.url()).pathname === '/start') {
      sends.push(request.method())
    }
  })
  await holdUploads(page)
  await withDraft(page, { reached: 1, name: '', email: '' })
  await page.goto('/start?q=2')
  await page.getByRole('radio', { name: /Use my logo/ }).click()
  await page.getByLabel('Choose a file').setInputFiles(PIXEL_PNG)
  await expect(page.getByText('Uploading your logo.')).toBeVisible()
  await expect(ask(page, 2)).toBeEnabled()
  await moveTo(page, 2, 3)
  await page.locator('main input[type="file"]').setInputFiles(PIXEL_PNG)
  await expect(page.getByText('Uploading.', { exact: true })).toBeVisible()
  await moveTo(page, 3, 4)
  await moveTo(page, 4, 5)

  await page.getByLabel('Email').fill(ANSWERED.email)
  await page.getByLabel('Your name').fill('Sam')
  await ask(page, 5).click()
  const waiting = page.getByRole('button', { name: 'Finishing your uploads' })
  await expect(waiting).toBeDisabled()
  // The disabled ask loses the focus, so the status line says it once.
  await expect(page.getByRole('status').filter({ hasText: 'Finishing your uploads.' })).toHaveCount(
    1,
  )
  await page.waitForTimeout(500)
  expect(sends).toEqual([])
})

// An upload held until the spec lets it fail, as a dropped connection would: the token request
// waits, then is refused. Registered after refuseSends, so it answers first.
async function uploadsThatFailLater(page: Page) {
  const held: Route[] = []
  let failing = false
  await page.route('**/api/upload**', async (route) => {
    if (failing) await route.abort()
    else held.push(route)
  })
  return async () => {
    failing = true
    await Promise.all(held.map((route) => route.abort()))
  }
}

test('a picture that fails after its question stops the send, saying where to put it right', async ({
  page,
}) => {
  const sends: string[] = []
  page.on('request', (request) => {
    if (request.method() !== 'GET' && new URL(request.url()).pathname === '/start') {
      sends.push(request.method())
    }
  })
  const fail = await uploadsThatFailLater(page)
  await withDraft(page, { reached: 1, name: '', email: '' })
  await page.goto('/start?q=2')
  await page.getByRole('radio', { name: /Use my logo/ }).click()
  await page.getByLabel('Choose a file').setInputFiles(PIXEL_PNG)
  await expect(page.getByText('Uploading your logo.')).toBeVisible()
  await moveTo(page, 2, 3)
  await moveTo(page, 3, 4)
  await moveTo(page, 4, 5)
  await page.getByLabel('Email').fill(ANSWERED.email)
  await page.getByLabel('Your name').fill('Sam')
  await ask(page, 5).click()
  await expect(page.getByRole('button', { name: 'Finishing your uploads' })).toBeDisabled()

  // The logo fails while the send waits for it: the send stops and says which picture, and where.
  await fail()
  const refusal = page.getByRole('alert').filter({ hasText: SEND_PICTURE_FAILED.logo })
  await expect(refusal).toBeVisible()
  await expect(ask(page, 5)).toBeEnabled()

  // Pressed again with nothing on its way, it stops at once rather than asking the server.
  await ask(page, 5).click()
  await expect(refusal).toBeVisible()
  await page.waitForTimeout(500)
  expect(sends).toEqual([])
})

test('own photos sit alongside the look', async ({ page }) => {
  await holdUploads(page)
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await page.getByRole('radio', { name: /Dark and moody/ }).click()
  await page.getByLabel('Add your own photos').setInputFiles({ ...PIXEL_PNG, name: 'shop.png' })
  await expect(page.getByRole('img', { name: 'shop.png' })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Dark and moody/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
})

test('a look and a colour are radio groups the keys move through', async ({ page }) => {
  await withDraft(page, { reached: 3 })
  await page.goto('/start?q=3')
  const looks = page.getByRole('radiogroup', { name: 'Look' })
  await looks.getByRole('radio', { name: /Clean and minimal/ }).focus()
  await page.keyboard.press('4')
  await expect(looks.getByRole('radio', { name: /Dark and moody/ })).toBeFocused()
  await expect(looks.getByRole('radio', { name: /Dark and moody/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  // Enter on a chosen look goes on.
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/start\?q=4$/)

  // "My own colour" is the fifth; choosing it shows the hex field and leaves the focus on it.
  const colours = page.getByRole('radiogroup', { name: 'Colour' })
  await colours.getByRole('radio', { name: 'Forest' }).focus()
  for (let card = 0; card < 4; card += 1) await page.keyboard.press('ArrowDown')
  const own = colours.getByRole('radio', { name: /My own colour/ })
  await expect(own).toHaveAttribute('aria-checked', 'true')
  await expect(own).toBeFocused()
  const hex = page.getByRole('textbox', { name: 'Hex code' })
  await expect(hex).toBeVisible()

  // Enter in the field checks the code, keeps the focus and says so; it never sends.
  await hex.fill('#2f6f4e')
  await hex.press('Enter')
  await expect(hex).toBeFocused()
  await expect(hex).toHaveAccessibleDescription(/Colour set\./)
  await expect(page).toHaveURL(/\/start\?q=4$/)

  await colours.getByRole('radio', { name: /My own colour/ }).focus()
  await page.keyboard.press('2')
  await expect(colours.getByRole('radio', { name: 'Ink' })).toHaveAttribute('aria-checked', 'true')
  await expect(hex).toHaveCount(0)
})

test('main comes before the one region, which says it is empty once', async ({ page }) => {
  await page.goto('/start')
  await expect(heading(page)).toBeVisible()
  await expect(sketch(page)).toHaveCount(1)
  await expect(page.getByText('Your brief so far is empty.')).toHaveCount(1)
  const mainFirst = await page.evaluate(() => {
    const main = document.getElementById('main')
    const region = document.querySelector('section[aria-label="Your brief so far"]')
    return (
      main !== null &&
      region !== null &&
      (main.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    )
  })
  expect(mainFirst).toBe(true)
})

// A short phone, so the look question scrolls well past the region and its pooled curve and the
// bar ends over the wash. The curve's box ends about 283 px down the page; the bar's middle line is
// 32 px down the screen.
const PHONE = { width: 390, height: 664 }
const CURVE_FOOT_PX = 283 - 32

function wrapper(page: Page) {
  return page.locator('header').locator('xpath=..')
}

test('the island is never blended, and dark from its first frame, at the look question', async ({
  page,
}) => {
  await page.setViewportSize(PHONE)
  await withDraft(page, { reached: 2 })
  // A sampler that starts before the page's first byte is parsed and reads the header in every
  // frame it exists, through the shell, hydration and the flow's mount.
  await page.addInitScript(() => {
    type Sample = { blend: string; solid: boolean; dark: boolean; y: number }
    const seen: Sample[] = []
    Object.assign(window, { __islandFrames: seen })
    const tick = () => {
      const header = document.querySelector('header')
      const wrap = header?.parentElement
      if (header && wrap) {
        seen.push({
          blend: getComputedStyle(header).mixBlendMode,
          solid: wrap.hasAttribute('data-solid'),
          dark: wrap.hasAttribute('data-over-dark'),
          y: window.scrollY,
        })
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.goto('/start?q=3')
  await expect(heading(page)).toBeFocused()
  const end = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const STEP = 30
        let down = true
        let deepest = 0
        const move = () => {
          const before = window.scrollY
          window.scrollBy({ top: down ? STEP : -STEP, behavior: 'instant' })
          deepest = Math.max(deepest, window.scrollY)
          if (down && window.scrollY === before) down = false
          if (!down && window.scrollY === 0) {
            resolve(deepest)
            return
          }
          requestAnimationFrame(move)
        }
        requestAnimationFrame(move)
      }),
  )
  expect(end).toBeGreaterThan(CURVE_FOOT_PX)
  await expect(wrapper(page)).toHaveAttribute('data-over-dark', '')
  type Sample = { blend: string; solid: boolean; dark: boolean; y: number }
  const frames = await page.evaluate(
    () => (window as unknown as { __islandFrames: Sample[] }).__islandFrames,
  )
  expect(frames.length).toBeGreaterThan(30)
  expect(frames.filter((frame) => frame.blend !== 'normal' || !frame.solid)).toEqual([])
  const atRest = frames.slice(
    0,
    frames.findIndex((frame) => frame.y > 0),
  )
  expect(atRest.length).toBeGreaterThan(0)
  expect(atRest.filter((frame) => !frame.dark)).toEqual([])
  // Over the wash the island turned light, so main is never dark while the visitor answers.
  expect(frames.some((frame) => frame.y === end && !frame.dark)).toBe(true)
})

test('a ground that turns to the ink after load reads as dark, at the look question', async ({
  page,
}) => {
  await page.setViewportSize(PHONE)
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await expect(heading(page)).toBeFocused()
  await page.evaluate(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
  })
  await expect(wrapper(page)).not.toHaveAttribute('data-over-dark')
  // What the flow does to main once the brief is sent (brief-flow.tsx), without sending one.
  await page.locator('main').evaluate((main) => {
    main.setAttribute('data-theme', 'dark')
  })
  await expect(wrapper(page)).toHaveAttribute('data-over-dark', '')
  await page.locator('main').evaluate((main) => {
    main.removeAttribute('data-theme')
  })
  await expect(wrapper(page)).not.toHaveAttribute('data-over-dark')
})
