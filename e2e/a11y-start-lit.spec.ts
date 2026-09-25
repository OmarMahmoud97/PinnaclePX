import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { refuseSends, withDraft } from './helpers/start'

// WCAG 2.2 AA on /start in the hero's light (docs/start-page-journey-plan.md, 9 and package P5),
// at the desktop, the phone and the tablet: every question on its ramp or wash with the white card,
// the palettes filled with their colour, a look chosen, the brief on its way with the question gone
// quiet, and forced colours, where a chosen tile is marked by the system's highlight and a palette
// keeps its colour. Nothing here sends a brief: the send's request is held in the browser.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

const TITLES = [
  'Start with a sentence.',
  'Put your name on it.',
  'Pick a look.',
  'Choose a colour.',
  'Where should we send them?',
] as const

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

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

test('every question in the light has no violations', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  for (const [index, title] of TITLES.entries()) {
    await page.goto(`/start?q=${String(index + 1)}`)
    await expect(heading(page)).toHaveText(title)
    expect(await violations(page), title).toEqual([])
  }
})

test('a look and a palette chosen have no violations', async ({ page }) => {
  await withDraft(page, { reached: 3 })
  await page.goto('/start?q=3')
  await expect(heading(page)).toHaveText(TITLES[2])
  await page.getByRole('radio', { name: /Dark and moody/ }).click()
  expect(await violations(page)).toEqual([])
  await page.getByRole('button', { name: 'Next: choose a colour', exact: true }).click()
  await expect(heading(page)).toHaveText(TITLES[3])
  await page.getByRole('radio', { name: 'Clay' }).click()
  expect(await violations(page)).toEqual([])
})

test('the brief on its way, the question gone quiet, has no violations', async ({ page }) => {
  // Held in the browser, never answered and never let through.
  await page.route(
    (url) => url.pathname === '/start',
    (route) =>
      route.request().method() === 'GET'
        ? route.fallback()
        : new Promise(() => {
            // Held on purpose.
          }),
  )
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(heading(page)).toHaveText(TITLES[4])
  await page.getByRole('button', { name: 'Show me my three designs', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sending', exact: true })).toBeFocused()
  expect(await violations(page)).toEqual([])
})

// Forced colours drop box shadows and fills, so a chosen tile is marked by its own border, and a
// palette keeps the colour it shows, the visitor's answer (docs/start-page-journey-plan.md, 9.4).
test('the looks and the palettes in forced colours have no violations', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await withDraft(page, { reached: 3 })
  await page.goto('/start?q=3')
  const warm = page.getByRole('radio', { name: /Warm and natural/ })
  await warm.click()
  await expect(warm).toHaveCSS('border-top-width', '2px')
  expect(await violations(page)).toEqual([])

  await page.goto('/start?q=4')
  const forest = page.getByRole('radio', { name: 'Forest' })
  await expect(forest).toHaveCSS('background-color', 'rgb(47, 111, 78)')
  expect(await violations(page)).toEqual([])
})
