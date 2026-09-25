import { expect, type Locator, type Page, test } from '@playwright/test'
import { refuseSends, withDraft } from './helpers/start'

// The new order on a phone (docs/start-page-journey-plan.md, package P3), where most visitors
// answer it: every question's first control above the ask on a short phone's first screen; a Next
// that finds errors focusing the first, clear of the ask; a field reached by Tab shown whole; the
// ask waiting in its place on a screen too short for it; the walk never scrolling sideways; and the
// hero's hand-off standing in for the helper. Nothing here sends a brief.

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'

// How far above the ask's top a first control must start: the fade's own 24 px, so the top of the
// control shows on the wash and not through the fade.
const FADE_PX = 24

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

// A box is read from the finished layout: the question's entrance and the sketch's paint-in over.
// Only animations that end are waited for, as in a11y.spec.ts.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

// How far a box ends below the top of the ask, with its fade, or of the ask's button, counting the
// focus ring when asked: at most 0 is clear of it.
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

async function scrollWidth(page: Page) {
  await settle(page)
  return page.evaluate(() => document.documentElement.scrollWidth)
}

async function next(page: Page, question: number) {
  await page.getByRole('button', { name: /^Next/ }).click()
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
}

// Every question answered in turn, the widest content included: the colour chosen, and at the
// last the ask that reads "Show me my three designs".
async function widthsOfTheWalk(page: Page) {
  const widths: Record<string, number> = {}
  await page.goto('/start')
  await page.getByLabel('What does your business do?').fill(SENTENCE)
  widths['question 1'] = await scrollWidth(page)
  await next(page, 2)
  await page.getByLabel('Business name').fill('Ashgrove Physio')
  await page.getByRole('radio', { name: /Use my logo/ }).click()
  widths['question 2'] = await scrollWidth(page)
  await next(page, 3)
  widths['question 3'] = await scrollWidth(page)
  await next(page, 4)
  await page.getByRole('radio', { name: /My own colour/ }).click()
  await page.getByRole('textbox', { name: 'Hex code' }).fill('#6b2d5b')
  widths['question 4'] = await scrollWidth(page)
  await next(page, 5)
  await page.getByLabel('Email').fill('sam@ashgrove.example')
  await page.getByLabel('Your name').fill('Sam')
  widths['question 5'] = await scrollWidth(page)
  return widths
}

function everyQuestionAt(width: number) {
  return Object.fromEntries([1, 2, 3, 4, 5].map((n) => [`question ${String(n)}`, width]))
}

test('no question scrolls sideways', async ({ page }) => {
  expect(await widthsOfTheWalk(page)).toEqual(everyQuestionAt(390))
})

test("the hero's hand-off stands in for the helper, under the title in the first screen", async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#hero').getByRole('textbox').fill(SENTENCE)
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await expect(heading(page)).toBeInViewport()
  await expect(page.locator('main .start-receipt:visible')).toHaveText(
    'Your sentence is in. Change it',
  )
  await expect(page.locator('main .start-helper')).toBeHidden()
})

// The two questions longer than a phone's screen. At the top the ask is already in reach with the
// reward under it; at the end of the scroll it has settled into its place under the question,
// below the last control and the line that closes the step, so it never sits over either.
for (const { question, title, ask, lastControl, closing } of [
  {
    question: 3,
    title: 'Pick a look.',
    ask: 'Next: choose a colour',
    lastControl: (page: Page) => page.getByText('Add your own photos', { exact: true }),
    closing: (page: Page) => page.getByText(/Up to 6\. Without any/),
  },
  {
    question: 4,
    title: 'Choose a colour.',
    ask: 'Next: one last step',
    lastControl: (page: Page) => page.getByRole('radio', { name: /My own colour/ }),
    closing: (page: Page) => page.getByText(/Your colour stays/),
  },
]) {
  test(`question ${String(question)} keeps the ask in reach and settles it below the last control`, async ({
    page,
  }) => {
    await withDraft(page, { reached: 4 })
    await page.goto(`/start?q=${String(question)}`)
    await expect(heading(page)).toHaveText(title)
    await settle(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    const button = page.getByRole('button', { name: ask, exact: true })
    await expect(button).toBeInViewport({ ratio: 1 })
    await expect(
      page.locator('main').getByText('Three designs, about five minutes after the last question.'),
    ).toBeInViewport({ ratio: 1 })

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

// A keyboard or a switch arrowing down the colours scrolls each card into view; the page's scroll
// padding keeps the focused card clear of the ask riding at the foot.
test('a colour card reached by the keyboard ends above the ask', async ({ page }) => {
  await withDraft(page, { reached: 3 })
  await page.goto('/start?q=4')
  await expect(heading(page)).toBeFocused()
  await settle(page)
  // The heading takes focus on arrival; the colours are the next stop, on the chosen card, and the
  // arrows walk them to "My own colour", the fifth.
  await page.keyboard.press('Tab')
  await expect(page.getByRole('radio', { name: 'Forest' })).toBeFocused()
  for (let card = 0; card < 4; card += 1) await page.keyboard.press('ArrowDown')
  const own = page.getByRole('radio', { name: /My own colour/ })
  await expect(own).toBeFocused()
  await expect(own).toHaveAttribute('aria-checked', 'true')
  await expect.poll(() => overlap(own, '.start-ask')).toBeLessThanOrEqual(0)
})

// Safari's first screen on the common iPhones with its bars showing.
test.describe('on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  const FIRST_CONTROLS = [
    { question: 2, control: 'input[autocomplete="organization"]' },
    { question: 3, control: '[role=radio]' },
    { question: 4, control: '[role=radio]' },
    { question: 5, control: 'input[type=email]' },
  ] as const

  for (const { question, control } of FIRST_CONTROLS) {
    test(`question ${String(question)} shows its first control above the ask on arrival`, async ({
      page,
    }) => {
      await withDraft(page, { reached: 4 })
      await page.goto(`/start?q=${String(question)}`)
      await expect(heading(page)).toBeFocused()
      await settle(page)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      const clearance = await page.locator('main#main form').evaluate((form, find) => {
        const found = form.querySelector(find)
        const ask = form.querySelector('.start-ask')
        if (found === null || ask === null) return -Infinity
        return ask.getBoundingClientRect().top - found.getBoundingClientRect().top
      }, control)
      expect(clearance).toBeGreaterThanOrEqual(FADE_PX)
    })
  }

  test('a Next that finds errors focuses the first, clear of the ask', async ({ page }) => {
    await withDraft(page, { reached: 4, name: '', email: '' })
    await page.goto('/start?q=5')
    await expect(heading(page)).toBeFocused()
    await settle(page)
    await page.getByRole('button', { name: 'Show me my three designs' }).click()
    const email = page.getByRole('textbox', { name: 'Email' })
    await expect(email).toBeFocused()
    await expect(
      page.getByText('That does not look like an email address.', { exact: true }),
    ).toBeInViewport()
    await expect(page.getByText('Tell us your name.', { exact: true })).toBeVisible()
    await expect.poll(() => overlap(email, '.start-ask')).toBeLessThanOrEqual(0)
  })

  test('a business name left empty is focused, clear of the ask', async ({ page }) => {
    await withDraft(page, { reached: 1, company: '' })
    await page.goto('/start?q=2')
    await expect(heading(page)).toBeFocused()
    await settle(page)
    await page.getByRole('button', { name: 'Next: pick a look' }).click()
    const name = page.getByRole('textbox', { name: 'Business name' })
    await expect(name).toBeFocused()
    await expect(page.getByText('Tell us your business name.', { exact: true })).toBeInViewport()
    await expect.poll(() => overlap(name, '.start-ask')).toBeLessThanOrEqual(0)
  })
})

test.describe('on a 320 by 640 phone', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('no question scrolls sideways', async ({ page }) => {
    expect(await widthsOfTheWalk(page)).toEqual(everyQuestionAt(320))
  })

  // A text field reached by Tab is lifted whole, ring and all, since browsers scroll only its
  // caret's line into view (question-pane.tsx).
  test('a field reached by Tab shows whole above the ask', async ({ page }) => {
    await withDraft(page, { reached: 4 })
    await page.goto('/start?q=5')
    await expect(heading(page)).toBeFocused()
    await settle(page)
    // The heading takes focus on arrival; the email and the name are the next two stops.
    await page.keyboard.press('Tab')
    const email = page.getByRole('textbox', { name: 'Email' })
    await expect(email).toBeFocused()
    await expect
      .poll(() => overlap(email, '.start-ask button', { ring: true }))
      .toBeLessThanOrEqual(0)
    await page.keyboard.press('Tab')
    const name = page.getByRole('textbox', { name: 'Your name' })
    await expect(name).toBeFocused()
    await expect
      .poll(() => overlap(name, '.start-ask button', { ring: true }))
      .toBeLessThanOrEqual(0)
  })

  test('a broken hex focuses the colour field and shows its message above the ask', async ({
    page,
  }) => {
    // One digit short: the slip a visitor typing their brand colour makes.
    await withDraft(page, { reached: 3, colours: { kind: 'custom', hex: '#2f6f4' } })
    await page.goto('/start?q=4')
    await expect(heading(page)).toBeFocused()
    await settle(page)
    await page.getByRole('button', { name: 'Next: one last step' }).click()
    await expect(page.getByRole('textbox', { name: 'Hex code' })).toBeFocused()
    const message = page.getByText('Use a hex code such as #2F6F4E.', { exact: true })
    await expect(message).toBeVisible()
    await expect.poll(() => overlap(message, '.start-ask button')).toBeLessThanOrEqual(0)
  })
})

// A 1280 by 1024 desktop at 400 per cent (WCAG 1.4.10): too short for the ask to ride at the foot,
// so it waits at the end of the question and a field reached by Tab shows whole.
test.describe('at 320 by 256, a desktop at 400 per cent', () => {
  test.use({ viewport: { width: 320, height: 256 } })

  test('the ask waits in its place and a field reached by Tab shows whole', async ({ page }) => {
    await withDraft(page, { reached: 1 })
    await page.goto('/start?q=2')
    await expect(heading(page)).toBeFocused()
    await settle(page)
    expect(
      await page.locator('.start-ask').evaluate((element) => getComputedStyle(element).position),
    ).toBe('static')
    await page.keyboard.press('Tab')
    const name = page.getByLabel('Business name')
    await expect(name).toBeFocused()
    await expect(name).toBeInViewport({ ratio: 1 })
  })
})
