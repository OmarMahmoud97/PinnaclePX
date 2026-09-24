import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

// WCAG 2.2 AA is a product promise, so it is a test: the page as it loads, with the menu open,
// and with every FAQ entry open.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

// axe reads colours as they are painted, and it scrolls each element into view itself, so it
// would start a list's reveal and read it mid-fade. The scan runs on a still page: every list
// shown, as the page's own fail-safe shows them, and every finite animation over.
async function settled(page: Page) {
  await page.evaluate(() => {
    for (const list of document.querySelectorAll('[data-reveal]')) {
      list.setAttribute('data-inview', '')
    }
  })
  // The scroll choreography, once armed, owns some reveals; wait for it to have finished them.
  await page.waitForFunction(() => {
    const html = document.documentElement
    return !html.hasAttribute('data-choreo') || html.hasAttribute('data-motion-settled')
  })
  // Only animations that end are waited for. The logo strip's marquee (app/tokens.css) runs
  // `infinite`, so waiting on every animation would never resolve once the strip is on screen,
  // and axe is the only automated check that reads colour, so it has to be able to run.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

test('the home page has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  await settled(page)
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(results.violations).toEqual([])
})

// Two scans, the open FAQ first and then the open menu: axe treats inert content as hidden, and
// the page under the open menu is inert (mobile-nav.tsx), so on a phone one scan with both open
// would skip the FAQ.
test('the open menu and the open FAQ have no accessibility violations', async ({ page }) => {
  await page.goto('/')
  // Opened directly: twelve clicks, each waiting for the height animation and the smooth scroll to
  // settle, outran the test's budget on a tablet. That a click opens an entry is home.spec's test;
  // this one scans the open state.
  await page.evaluate(() => {
    for (const entry of document.querySelectorAll<HTMLDetailsElement>('#faq details')) {
      entry.open = true
    }
  })
  await settled(page)
  const faq = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(faq.violations).toEqual([])
  const menu = page.getByRole('button', { name: 'Menu' })
  if (await menu.isVisible()) {
    await menu.click()
    await settled(page)
    const open = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    expect(open.violations).toEqual([])
  }
})
