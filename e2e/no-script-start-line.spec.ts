import { expect, type Page, test } from '@playwright/test'
import { NO_SCRIPT_CALL, noScriptLine, SITE } from '@/lib/site'

// What /start says without JavaScript (docs/start-page-journey-plan.md, 4.6 and 8.6): how to go
// on, and an inbox and a call only once the studio has an address to offer. Until then the line
// promises nothing it cannot keep.

// main's text as the page renders it. Playwright's text matchers skip what sits in a <noscript>,
// even with JavaScript off, so the rendered text is read instead.
const mainText = (page: Page) => page.locator('main#main').innerText()

test('without JavaScript, /start says how to go on and offers only what exists', async ({
  page,
}) => {
  await page.goto('/start')
  const text = await mainText(page)
  expect(text).toContain(noScriptLine())

  const call = page.locator(`main#main a[href="${SITE.bookingUrl}"]`)
  if (SITE.contactEmail === null) {
    await expect(call).toHaveCount(0)
    expect(text).not.toContain('email us')
  } else {
    expect(await call.innerText()).toBe(NO_SCRIPT_CALL)
  }
})

test('without JavaScript, a done link still says how to go on', async ({ page }) => {
  await page.goto('/start?q=done&s=nk7m2p9x4w3h')
  expect(await mainText(page)).toContain(noScriptLine())
})
