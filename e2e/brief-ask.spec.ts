import { expect, type Page, test } from '@playwright/test'

// /start's ask on a desk window shorter than the question (app/_styles/start.css): from lg the
// actions row, Back and the ask, rides at the foot of the screen, so "Next" and "Show me my three
// designs" are on screen at every question of a short laptop without a scroll, as a phone's ask is.

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

async function withDraft(page: Page, overrides: object = {}) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DRAFT_KEY, value: JSON.stringify({ ...ANSWERED, ...overrides }) },
  )
}

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. Nothing here
// sends one, and this makes sure: every request to /start other than a GET, which is how the
// Server Action travels, is refused.
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

// 1366 by 657, the most common laptop screen with the browser's bars. A row that stayed in its
// place put the ask 19, 117 and 42px below the fold at questions two, four and five.
test('on a short laptop the ask is on screen at every question', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 657 })
  await withDraft(page)
  for (const question of [1, 2, 3, 4, 5]) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(page.locator('main#main h1')).toBeVisible()
    await settle(page)
    const ask = page.getByRole('button', {
      name: question === 5 ? 'Show me my three designs' : 'Next',
      exact: true,
    })
    await expect(ask, `question ${String(question)}`).toBeInViewport({ ratio: 1 })
  }
})
