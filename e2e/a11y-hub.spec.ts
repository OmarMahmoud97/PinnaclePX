import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { EXAMPLE_SLUG } from '@/lib/preview/example'
import { interceptStatus, refuseSends, statusFor, stubPhotos } from './helpers/start'

// WCAG 2.2 AA on the designs page (docs/start-page-journey-plan.md, 9 and 10; package P7), at the
// desktop, the phone and the tablet: every state of a build, forced colours, the design links in
// the accessibility tree, and one live region. The example build stands in for a real one
// (app/examples/hub/page.tsx), with its status poll answered here in the state it shows.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

const HUB = '/examples/hub'

const STATES = ['building', 'ready', 'partial', 'failed', 'exhausted'] as const

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

// axe reads colours as they are painted, so it scans a still page, as a11y-start-lit.spec.ts does.
async function violations(page: Page, disabled: readonly string[] = []) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .disableRules([...disabled])
    .analyze()
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(
      ({ target, failureSummary }) => `${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  }))
}

test('every state of a build has no violations', async ({ page }) => {
  for (const state of STATES) {
    await page.unrouteAll({ behavior: 'wait' })
    await refuseSends(page)
    await stubPhotos(page)
    await interceptStatus(page, EXAMPLE_SLUG, [statusFor(EXAMPLE_SLUG, state)])
    await page.goto(`${HUB}?state=${state}`)
    await expect(page.locator('main#main h1')).toBeVisible()
    expect(await violations(page), state).toEqual([])
  }
})

// Forced colours paint every word and ground in the system's own pair, and the page draws them so.
// Chromium still reports each word's authored fill to axe, though: on the ink that is a light
// colour, which axe then reads against the system's white ground. So contrast is checked in the
// ink's own colours above, and here every other rule is.
test('forced colours have no violations', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto(`${HUB}?state=ready`)
  await expect(page.locator('main#main h1')).toBeVisible()
  await expect(page.locator('.hub-design').first()).toHaveCSS('border-top-style', 'solid')
  expect(await violations(page, ['color-contrast'])).toEqual([])
})

test('the design links are in the accessibility tree, and the page has one live region', async ({
  page,
}) => {
  await page.goto(`${HUB}?state=ready`)
  const links = page.getByRole('list', { name: 'Your designs' }).getByRole('link')
  await expect(links).toHaveCount(3)
  for (const link of await links.all()) {
    expect(await link.evaluate((element) => element.closest('[aria-hidden="true"]'))).toBeNull()
  }
  await expect(page.locator('.hub [role="status"], .hub [aria-live]')).toHaveCount(1)
})
