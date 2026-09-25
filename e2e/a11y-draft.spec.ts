import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { settle } from './helpers/draft'
import { refuseSends, withDraft } from './helpers/start'

// The live draft and assistive technology (docs/start-page-journey-plan.md, 5.8, 9.1 and package
// P6), at the desktop, the phone and the tablet: the draft is decoration, hidden from assistive
// technology and holding nothing to focus, while the region's one sentence says the brief in
// words; and every stage of it, the awkward colours and the dark scheme among them, leaves the
// page with no axe violation. Nothing here sends a brief.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

async function violations(page: Page) {
  await settle(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(
      ({ target, failureSummary }) => `${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  }))
}

test('the draft is hidden from assistive technology and holds nothing to focus', async ({
  page,
}) => {
  await page.goto('/start?q=1')
  await expect(page.locator('main#main h1')).toBeVisible()
  const draft = region(page).locator('[data-draft]')
  await expect(draft).toHaveAttribute('aria-hidden', 'true')
  expect(
    await region(page).evaluate(
      (element) =>
        element.querySelectorAll('a, button, input, select, textarea, [tabindex]').length,
    ),
  ).toBe(0)
  // The one sentence the region speaks, once.
  await expect(page.getByText('Your brief so far is empty.', { exact: true })).toHaveCount(1)
})

test('every stage of the draft has no violations', async ({ page }) => {
  await withDraft(page, { reached: 4, imagery: { style: 'warm', photos: [] } })
  for (const question of [1, 2, 3, 4, 5]) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
    await expect(page.locator('main#main h1')).toBeVisible()
    expect(await violations(page), `question ${String(question)}`).toEqual([])
  }
})

test('a dark look and awkward colours have no violations', async ({ page }) => {
  await withDraft(page, { reached: 3, imagery: { style: 'dark', photos: [] } })
  await page.goto('/start?q=4')
  await page.getByRole('radio', { name: /My own colour/ }).click()
  for (const hex of ['#ffff00', '#808080', '#000000']) {
    await page.getByRole('textbox', { name: 'Hex code' }).fill(hex)
    expect(await violations(page), hex).toEqual([])
  }
})
