import { expect, type Page, test } from '@playwright/test'

// /start on a 390 by 844 phone, where most visitors answer it: the page never scrolls sideways
// at any question, the first screen holds the sketch, the question and the ask, and below lg, on
// a screen at least 30rem tall, the ask rides at the foot (app/_styles/start.css) without ever
// covering a control.

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'
const REASSURANCE = 'Free. No sign-up. Nobody calls you unless you book.'

// The flow restores a saved draft and allows any question up to the first unanswered one, so a
// draft written before the page's own scripts run opens the later questions directly. The key
// and the shape are lib/brief/draft.ts's and lib/brief/schema.ts's draftSchema.
const DRAFT_KEY = 'pinnaclepx.brief'
const ANSWERED = {
  description: SENTENCE,
  name: 'Sam',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'minimal', photos: [] },
  colours: { kind: 'palette', paletteId: 'forest' },
}

async function withDraft(page: Page) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DRAFT_KEY, value: JSON.stringify(ANSWERED) },
  )
}

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// presses the last button, and this makes sure: every POST to /start, which is how the Server
// Action travels, is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

// A width or a box is read from the finished layout: the question's entrance and the sketch's
// paint-in over. Only animations that end are waited for, as in a11y.spec.ts.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

async function scrollWidth(page: Page) {
  await settle(page)
  return page.evaluate(() => document.documentElement.scrollWidth)
}

async function next(page: Page, question: number) {
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
}

// Every question answered in turn, the widest content included: at the fifth the ask reads "Show
// me my three designs", which once pushed the page to 411 beside Back. The palette is chosen
// too, since a choice re-tints the sketch beside the question.
async function widthsOfTheWalk(page: Page) {
  const widths: Record<string, number> = {}
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  widths['question 1'] = await scrollWidth(page)
  await next(page, 2)
  await page.getByLabel('Your name').fill('Sam')
  await page.getByLabel('Company').fill('Ashgrove Physio')
  await page.getByLabel('Email').fill('sam@ashgrove.example')
  widths['question 2'] = await scrollWidth(page)
  await next(page, 3)
  widths['question 3'] = await scrollWidth(page)
  await next(page, 4)
  widths['question 4'] = await scrollWidth(page)
  await next(page, 5)
  widths['question 5'] = await scrollWidth(page)
  await page.getByRole('radio', { name: 'Plum' }).click()
  widths['question 5, Plum chosen'] = await scrollWidth(page)
  return widths
}

function everyQuestionAt(width: number) {
  return Object.fromEntries(
    [
      'question 1',
      'question 2',
      'question 3',
      'question 4',
      'question 5',
      'question 5, Plum chosen',
    ].map((question) => [question, width]),
  )
}

test('no question scrolls sideways', async ({ page }) => {
  expect(await widthsOfTheWalk(page)).toEqual(everyQuestionAt(390))
})

test('the first screen holds the sketch, the question and the ask', async ({ page }) => {
  await page.goto('/start')
  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch).toBeVisible()
  await settle(page)
  expect((await sketch.boundingBox())?.height ?? Infinity).toBeLessThanOrEqual(320)
  await expect(
    page.getByRole('heading', { level: 1, name: 'First, your business.' }),
  ).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeInViewport({ ratio: 1 })
  await expect(page.locator('main').getByText(REASSURANCE)).toBeInViewport({ ratio: 1 })
  // There is nothing to go back to, so there is no Back, not even as kept space.
  await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0)
})

// The two questions longer than a phone's screen. At the top the ask is already in reach; at the
// end of the scroll it has settled into its place under the question, below the last control
// and the sentence that closes the step, so it never sits over either.
for (const { question, heading, ask, lastControl, closing } of [
  {
    question: 4,
    heading: 'How should Ashgrove Physio look?',
    ask: 'Next',
    lastControl: (page: Page) => page.getByText('Add your own photos', { exact: true }),
    closing: (page: Page) => page.getByText(/Your style is applied to them/),
  },
  {
    question: 5,
    heading: "Pick Ashgrove Physio's colours.",
    ask: 'Show me my three designs',
    lastControl: (page: Page) => page.getByLabel('Pick a colour'),
    closing: (page: Page) => page.getByText(/Your colour stays/),
  },
]) {
  test(`question ${String(question)} keeps the ask in reach and settles it below the last control`, async ({
    page,
  }) => {
    await withDraft(page)
    await page.goto(`/start?q=${String(question)}`)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await settle(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    const button = page.getByRole('button', { name: ask, exact: true })
    await expect(button).toBeInViewport({ ratio: 1 })
    await expect(page.locator('main').getByText(REASSURANCE)).toBeInViewport({ ratio: 1 })

    await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    })
    await expect
      .poll(() =>
        page.evaluate(
          () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1,
        ),
      )
      .toBe(true)
    const askTop = (await button.boundingBox())?.y ?? -Infinity
    const bottomOf = (el: Element) => el.getBoundingClientRect().bottom
    expect(askTop).toBeGreaterThanOrEqual(await lastControl(page).evaluate(bottomOf))
    expect(askTop).toBeGreaterThanOrEqual(await closing(page).evaluate(bottomOf))
  })
}

// A keyboard or a switch arrowing down the palette scrolls each card into view; the page's scroll
// padding (app/_styles/start.css) keeps the focused card clear of the ask riding at the foot.
test('a palette card reached by the keyboard ends above the ask', async ({ page }) => {
  await withDraft(page)
  await page.goto('/start?q=5')
  const heading = page.getByRole('heading', { level: 1, name: "Pick Ashgrove Physio's colours." })
  await expect(heading).toBeFocused()
  await settle(page)
  // The heading takes focus on arrival; the palette is the next stop, on the chosen card, and
  // the arrows walk it to Plum, the fourth.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('radio', { name: 'Forest' })).toBeFocused()
  for (let card = 0; card < 3; card += 1) await page.keyboard.press('ArrowDown')
  const plum = page.getByRole('radio', { name: 'Plum' })
  await expect(plum).toBeFocused()
  await expect(plum).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() =>
      plum.evaluate((card) => {
        const ask = card.closest('form')?.querySelector('.start-ask')
        if (ask === null || ask === undefined) return Infinity
        return card.getBoundingClientRect().bottom - ask.getBoundingClientRect().top
      }),
    )
    .toBeLessThanOrEqual(0)
})

test.describe('on a 320 by 640 phone', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('no question scrolls sideways', async ({ page }) => {
    expect(await widthsOfTheWalk(page)).toEqual(everyQuestionAt(320))
  })
})
