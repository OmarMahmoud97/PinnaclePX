import { expect, type Locator, type Page, test } from '@playwright/test'
import { refuseSends, withDraft } from './helpers/start'

// /start's ask where it rides at the foot of a phone's screen (app/_styles/start.css), and the
// focus around it (app/start/_components/question-pane.tsx), at the first question: on a short
// phone's first screen its card shows above the ask, and a Tab to it lifts it whole above the ask.
// mobile-order.spec.ts holds the other four questions to the same rules, with a Next that finds
// errors and the ask that waits in its place on a screen too short for it.

// How far above the ask's top a first control must start: the fade's own 24px, so the top of the
// control shows on the wash and not through the fade.
const FADE_PX = 24

// Nothing here sends a brief.
test.beforeEach(async ({ page }) => {
  await refuseSends(page)
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

// Safari's first screen on the common iPhones with its bars showing. There the phone in the
// sketch drops to half size (app/_styles/start.css), so the question's first control is on
// screen above the ask on arrival, not hidden under it.
test.describe('on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  // The text area sits in a card of its own, which is the box that must clear the ask.
  test('question 1 shows its first control above the ask on arrival', async ({ page }) => {
    await withDraft(page)
    // By its address: bare /start resumes a saved draft where it left off.
    await page.goto('/start?q=1')
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await settle(page)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    const clearance = await page.locator('main#main form').evaluate((form) => {
      const card = form.querySelector('textarea')?.closest('.rounded-2xl')
      const ask = form.querySelector('.start-ask')
      if (card === null || card === undefined || ask === null) return -Infinity
      return ask.getBoundingClientRect().top - card.getBoundingClientRect().top
    })
    expect(clearance).toBeGreaterThanOrEqual(FADE_PX)
  })

  // The description's card draws the ring for the text area inside it, and the question pane lifts
  // the card whole: lifting the text area alone left the card's foot and ring under the button.
  test('the description card reached by Tab shows whole above the ask', async ({ page }) => {
    await page.goto('/start')
    await expect(page.locator('main#main h1')).toBeFocused()
    await settle(page)
    await page.keyboard.press('Tab')
    const description = page.getByRole('textbox', { name: 'What does your business do?' })
    await expect(description).toBeFocused()
    const card = page.locator('main#main form .rounded-2xl:focus-within')
    await expect
      .poll(() => overlap(card, '.start-ask button', { ring: true }))
      .toBeLessThanOrEqual(0)
  })
})
