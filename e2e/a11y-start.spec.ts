import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// WCAG 2.2 AA on /start, the page that takes a visitor's details: the first question as it
// loads, the details question with all three of its errors showing, the style question, and the
// colour question with a hex code that does not read. Runs on the desktop, the phone and the
// tablet, as the home page's scans do.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

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

async function withDraft(page: Page, draft: object) {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DRAFT_KEY, value: JSON.stringify(draft) },
  )
}

// Sending the brief runs the paid pipeline, writes a lead and emails the owner. No case here
// means to send one (the colour question's error stops the send in the page), and this makes
// sure: every POST to /start, which is how the Server Action travels, is refused.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
})

// axe reads colours as they are painted, so it scans a still page: the question's entrance and
// every colour change over. Only animations that end are waited for, as in a11y.spec.ts.
async function violations(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  // Named by rule and element, so a failure says what to fix rather than printing axe's report.
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(
      ({ target, failureSummary }) => `${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  }))
}

test('the first question has no accessibility violations', async ({ page }) => {
  await page.goto('/start')
  await expect(page.getByRole('heading', { level: 1, name: 'First, your business.' })).toBeVisible()
  expect(await violations(page)).toEqual([])
})

test('the details question with its three errors has no accessibility violations', async ({
  page,
}) => {
  await withDraft(page, { ...ANSWERED, name: '', company: '', email: '' })
  await page.goto('/start?q=2')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Where should we send your link?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  for (const message of [
    'Tell us your name.',
    'Tell us your company name.',
    'That does not look like an email address.',
  ]) {
    await expect(page.getByText(message, { exact: true })).toBeVisible()
  }
  // The focus moves to the first control marked invalid, which reads its message.
  await expect(page.getByRole('textbox', { name: 'Your name' })).toBeFocused()
  expect(await violations(page)).toEqual([])
})

test('the style question has no accessibility violations', async ({ page }) => {
  await withDraft(page, ANSWERED)
  await page.goto('/start?q=4')
  await expect(
    page.getByRole('heading', { level: 1, name: 'How should Ashgrove Physio look?' }),
  ).toBeVisible()
  expect(await violations(page)).toEqual([])
})

test('the colour question with a broken hex has no accessibility violations', async ({ page }) => {
  // One digit short: the slip a visitor typing their brand colour makes.
  await withDraft(page, { ...ANSWERED, colours: { kind: 'custom', hex: '#2f6f4' } })
  await page.goto('/start?q=5')
  await expect(
    page.getByRole('heading', { level: 1, name: "Pick Ashgrove Physio's colours." }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
  await expect(page.getByText('Use a hex code such as #2F6F4E.', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Brand colour' })).toBeFocused()
  expect(await violations(page)).toEqual([])
})

// Forced colours drop box shadows, so the ask's focus ring vanishes there; the outline stands in.
test('the ask shows its focus in forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/start')
  await page
    .getByRole('textbox', { name: 'What does your business do?' })
    .fill('Physiotherapy clinic in Sheffield with same-week appointments.')
  await page.keyboard.press('Tab')
  const next = page.getByRole('button', { name: 'Next', exact: true })
  await expect(next).toBeFocused()
  await expect(next).toHaveCSS('outline-style', 'solid')
  await expect(next).toHaveCSS('outline-width', '2px')
})
