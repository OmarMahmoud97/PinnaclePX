import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// WCAG 2.2 AA is a product promise, so it is a test: the page as it loads, with the menu open,
// and with every FAQ entry open.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

// axe reads colours as they are painted, and it scrolls each element into view itself, so it
// would start a list's reveal and read it mid-fade, and it would catch the sketch mid-type.
// The scan runs on a still page: the hero holding its built page, which it keeps for
// CONFIG.demo.builtHoldMs (longer than a scan takes), and every list shown, as the page's own
// fail-safe shows them.
// The loop starts once a quarter of the sketch stage is on screen. On a phone the stage sits at
// the fold, so bring its frame up first, as a visitor glancing down would.
async function built(page: Page) {
  await page.locator('#hero [data-frame]:visible').first().scrollIntoViewIfNeeded()
  await expect(page.locator('#hero')).toHaveAttribute('data-built', '', { timeout: 25_000 })
}

async function settled(page: Page) {
  await page.evaluate(() => {
    for (const list of document.querySelectorAll('[data-reveal]')) {
      list.setAttribute('data-inview', '')
    }
  })
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  )
}

test('the home page has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  await built(page)
  await settled(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations).toEqual([])
})

test('the open menu and the open FAQ have no accessibility violations', async ({ page }) => {
  await page.goto('/')
  await built(page)
  const menu = page.getByRole('button', { name: 'Menu' })
  if (await menu.isVisible()) await menu.click()
  for (const summary of await page.locator('#faq summary').all()) await summary.click()
  await settled(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations).toEqual([])
})
