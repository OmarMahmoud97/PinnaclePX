import { expect, type Locator, type Page, test } from '@playwright/test'

// /start's ask where it rides at the foot of a phone's screen (app/_styles/start.css), and the
// focus around it (app/start/_components/question-pane.tsx): on a short phone's first screen every
// question's first control shows above it; a Next that finds errors moves the focus to the first
// and keeps it and its message clear of the ask; a field reached by Tab shows whole above it; and
// on a screen too short for it, a desktop at 400 per cent, it waits in its place instead.

// The flow restores a saved draft and allows any question up to the first unanswered one, so a
// draft written before the page's own scripts run opens the later questions directly. The key
// and the shape are lib/brief/draft.ts's and lib/brief/schema.ts's draftSchema.
const DRAFT_KEY = 'pinnaclepx.brief'
const ANSWERED = {
  description:
    'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.',
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

// How far above the ask's top a first control must start: the fade's own 24px, so the top of the
// control shows on the wash and not through the fade.
const FADE_PX = 24

async function withDraft(page: Page, overrides: object = {}) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DRAFT_KEY, value: JSON.stringify({ ...ANSWERED, ...overrides }) },
  )
}

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// sends one (the colour question's error stops the send in the page), and this makes sure: every
// request to /start other than a GET, which is how the Server Action travels, is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'GET' ? route.fallback() : route.abort()),
  )
})

// A box is read from the finished layout: the question's entrance and the sketch's paint-in
// over. Only animations that end are waited for, as in a11y.spec.ts.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

// How far a box ends below the top of the ask, with its fade, or of the ask's button, counting
// the focus ring when asked: at most 0 is clear of it.
async function overlap(
  control: Locator,
  part: '.start-ask' | '.start-ask button',
  { ring = false } = {},
) {
  return control.evaluate(
    (element, { selector, withRing }) => {
      const ask = element.closest('form')?.querySelector(selector)
      if (ask === null || ask === undefined) return Infinity
      const style = getComputedStyle(element)
      const outline = withRing
        ? parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
        : 0
      return element.getBoundingClientRect().bottom + outline - ask.getBoundingClientRect().top
    },
    { selector: part, withRing: ring },
  )
}

// Where each question's first control is found, and the box that draws it: question one's
// textarea sits in a card of its own, and question three's file picker is its label.
const FIRST_CONTROLS = [
  { question: 1, control: 'textarea', box: '.rounded-2xl' },
  { question: 3, control: 'label:has(input[type=file])', box: null },
  { question: 4, control: '[role=radio]', box: null },
  { question: 5, control: '[role=radio]', box: null },
] as const

// Safari's first screen on the common iPhones with its bars showing. There the phone in the
// sketch drops to half size (app/_styles/start.css), so the question's first control is on
// screen above the ask on arrival, not hidden under it.
test.describe('on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  for (const { question, control, box } of FIRST_CONTROLS) {
    test(`question ${String(question)} shows its first control above the ask on arrival`, async ({
      page,
    }) => {
      await withDraft(page)
      await page.goto(question === 1 ? '/start' : `/start?q=${String(question)}`)
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
      await settle(page)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      const clearance = await page.locator('main#main form').evaluate(
        (form, find) => {
          const found = form.querySelector(find.control)
          const drawn = find.box === null ? found : found?.closest(find.box)
          const ask = form.querySelector('.start-ask')
          if (drawn === null || drawn === undefined || ask === null) return -Infinity
          return ask.getBoundingClientRect().top - drawn.getBoundingClientRect().top
        },
        { control, box },
      )
      expect(clearance).toBeGreaterThanOrEqual(FADE_PX)
    })
  }

  // The description's card draws the ring for the text area inside it, and the question pane lifts
  // the card whole: lifting the text area alone left the card's foot and ring under the button.
  test('the description card reached by Tab shows whole above the ask', async ({ page }) => {
    await page.goto('/start')
    await expect(
      page.getByRole('heading', { level: 1, name: 'First, your business.' }),
    ).toBeFocused()
    await settle(page)
    await page.keyboard.press('Tab')
    const description = page.getByRole('textbox', { name: 'What does your business do?' })
    await expect(description).toBeFocused()
    const card = page.locator('main#main form .rounded-2xl:focus-within')
    await expect
      .poll(() => overlap(card, '.start-ask button', { ring: true }))
      .toBeLessThanOrEqual(0)
  })

  test('a Next that finds errors focuses the first, clear of the ask', async ({ page }) => {
    await withDraft(page, { name: '', company: '', email: '' })
    await page.goto('/start?q=2')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Where should we send your link?' }),
    ).toBeFocused()
    await settle(page)
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    const name = page.getByRole('textbox', { name: 'Your name' })
    await expect(name).toBeFocused()
    await expect(page.getByText('Tell us your name.', { exact: true })).toBeInViewport()
    await expect.poll(() => overlap(name, '.start-ask')).toBeLessThanOrEqual(0)
  })
})

test.describe('on a 320 by 640 phone', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  // A text field reached by Tab is lifted whole, ring and all, since browsers scroll only its
  // caret's line into view (question-pane.tsx).
  test('a field reached by Tab shows whole above the ask', async ({ page }) => {
    await withDraft(page)
    await page.goto('/start?q=2')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Where should we send your link?' }),
    ).toBeFocused()
    await settle(page)
    // The heading takes focus on arrival; name, company and email are the next three stops.
    for (let stop = 0; stop < 3; stop += 1) await page.keyboard.press('Tab')
    const email = page.getByRole('textbox', { name: 'Email', exact: true })
    await expect(email).toBeFocused()
    await expect
      .poll(() => overlap(email, '.start-ask button', { ring: true }))
      .toBeLessThanOrEqual(0)
  })

  test('a broken hex focuses the colour field and shows its message above the ask', async ({
    page,
  }) => {
    // One digit short: the slip a visitor typing their brand colour makes.
    await withDraft(page, { colours: { kind: 'custom', hex: '#2f6f4' } })
    await page.goto('/start?q=5')
    await expect(
      page.getByRole('heading', { level: 1, name: "Pick Ashgrove Physio's colours." }),
    ).toBeFocused()
    await settle(page)
    await page.getByRole('button', { name: 'Show me my three designs' }).click()
    await expect(page.getByRole('textbox', { name: 'Brand colour' })).toBeFocused()
    const message = page.getByText('Use a hex code such as #2F6F4E.', { exact: true })
    await expect(message).toBeVisible()
    await expect.poll(() => overlap(message, '.start-ask button')).toBeLessThanOrEqual(0)
  })
})

// A 1280 by 1024 desktop at 400 per cent (WCAG 1.4.10): too short for the ask to ride at the
// foot, so it waits at the end of the question and a field reached by Tab shows whole.
test.describe('at 320 by 256, a desktop at 400 per cent', () => {
  test.use({ viewport: { width: 320, height: 256 } })

  test('the ask waits in its place and a field reached by Tab shows whole', async ({ page }) => {
    await withDraft(page)
    await page.goto('/start?q=2')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Where should we send your link?' }),
    ).toBeFocused()
    await settle(page)
    expect(
      await page.locator('.start-ask').evaluate((element) => getComputedStyle(element).position),
    ).toBe('static')
    await page.keyboard.press('Tab')
    const name = page.getByLabel('Your name')
    await expect(name).toBeFocused()
    await expect(name).toBeInViewport({ ratio: 1 })
  })
})
