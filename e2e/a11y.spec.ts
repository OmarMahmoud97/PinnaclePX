import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// WCAG 2.2 AA is a product promise, so it is a test: the page as it loads, with the menu open,
// and with every FAQ entry open.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

// axe reads colours as they are painted, so a list still rising in reads as low contrast. Let
// every transition and keyframe finish first.
async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  )
}

test('the home page has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  await settled(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations).toEqual([])
})

test('the open menu and the open FAQ have no accessibility violations', async ({ page }) => {
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Menu' })
  if (await menu.isVisible()) await menu.click()
  for (const summary of await page.locator('#faq summary').all()) await summary.click()
  await settled(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations).toEqual([])
})
