import { expect, test } from '@playwright/test'

test('home page renders the promise and the two actions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'See your new website before you hire.',
  )
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()

  // The hero carries the primary action and its trigger; the call is asked for further down,
  // where the build is explained, and in the closing (ADR 0031 moved it off the first screen).
  const hero = page.locator('#hero')
  await expect(hero.getByRole('link', { name: 'Show me my three designs' })).toBeVisible()
  await expect(hero.getByText('Free. No sign-up. Nobody calls you unless you book.')).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a 20-minute call' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Book a 20-minute call' }).first()).toHaveAttribute(
    'href',
    /cal\.com/,
  )
})

test('how it works never lists the questions', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('#how-it-works')
  await expect(
    section.getByRole('heading', { name: 'Five answers show you the look.' }),
  ).toBeVisible()
  await expect(section.getByText(/^Question \d$/)).toHaveCount(0)
  await expect(section.getByText(/Question \d of 5/)).toHaveCount(1)
})

// The frame starts empty, builds the example brand into a finished page by the button, and
// unpaints on the way back up. The stop is read from the scroll, so the assertions on the
// progress line hold before GSAP arrives and the ones on the frame hold once it has.
test('the walkthrough paints the example brand stop by stop, and unpaints on the way back', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const section = page.locator('#how-it-works')
  const slot = section.locator('[data-wire="headline-slot"]')
  const headline = section.getByText('Gardens that grow with you.')
  await expect(section.getByText('Question 1 of 5')).toBeVisible()
  await expect(slot).toBeVisible()

  await page.locator('#real-build').scrollIntoViewIfNeeded()
  await expect(section.getByText('Question 5 of 5')).toBeVisible()
  await expect(
    section.getByText('Built as an illustration. Not a client, not one of the designs.'),
  ).toBeVisible()
  await expect(headline).toBeVisible({ timeout: 15_000 })
  await expect(slot).toBeHidden()

  await page.locator('#included').scrollIntoViewIfNeeded()
  await expect(section.getByText('Question 1 of 5')).toBeVisible()
  await expect(slot).toBeVisible({ timeout: 15_000 })
  await expect(headline).toBeHidden()
})

// The headline is the largest contentful paint: it is server-rendered, its colour flip is a
// blend rather than a transparency, and the ink canvas paints nothing the metric counts.
test('the headline is the largest contentful paint', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const lcp = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const last = list.getEntries().at(-1) as
            (PerformanceEntry & { element?: Element }) | undefined
          resolve(last?.element?.tagName ?? 'none')
          observer.disconnect()
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })
      }),
  )
  expect(lcp).toBe('H1')
})

test('a sentence typed in the hero reaches question one on the start page', async ({ page }) => {
  await page.goto('/')
  const sentence =
    'Family-run cafe by Whitby harbour. Breakfasts, cakes, dog-friendly, open from seven.'
  await page.getByLabel('What does your business do?').fill(sentence)
  // The closing frame redraws with the visitor's own words as they type.
  await expect(page.locator('#cta').getByText(sentence).first()).toBeVisible()
  await page.locator('#hero-cta').click()
  await expect(page).toHaveURL(/\/start\?q=2$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page.getByLabel('What does your business do?')).toHaveValue(sentence)
})

test('the build section says who does what and carries the call', async ({ page }) => {
  await page.goto('/')
  const build = page.locator('#real-build')
  await build.scrollIntoViewIfNeeded()
  await expect(
    build.getByRole('heading', { name: 'If a design fits, here is what happens next.' }),
  ).toBeVisible()
  await expect(build.getByRole('heading', { level: 3 })).toHaveCount(5)
  await expect(build.getByText('We agree a timeline on the call.')).toBeVisible()
  await expect(build.getByRole('link', { name: 'Book a 20-minute call' })).toHaveAttribute(
    'href',
    /cal\.com/,
  )
})

// Proof first, then the ask: the six live sites are followed by the page's first primary button.
test('the work band leads the page and ends on the primary action', async ({ page }) => {
  await page.goto('/')
  const work = page.locator('#work')
  await expect(work.getByRole('link', { name: 'Show me my three designs' })).toHaveAttribute(
    'href',
    '/start',
  )
})

test('the comparison names no builder and labels both columns', async ({ page }) => {
  await page.goto('/')
  const options = page.locator('#your-options')
  await expect(options.getByRole('heading', { level: 3 })).toHaveCount(4)
  await expect(options.getByText(/Wix|Squarespace/)).toHaveCount(0)
  await expect(options.getByText('You build it with a builder')).toBeVisible()
  await expect(options.getByText('We build it with you')).toBeVisible()
})

test('the work band shows six dated captures, each linking to the live site', async ({ page }) => {
  await page.goto('/')
  const work = page.locator('#work')
  await expect(
    work.getByRole('heading', { name: 'Six sites we designed and built.' }),
  ).toBeVisible()
  const cards = work.getByRole('listitem')
  await expect(cards).toHaveCount(6)
  const links = work.getByRole('link', { name: /^Visit the .* site$/ })
  await expect(links).toHaveCount(6)
  for (const href of await links.evaluateAll((all) => all.map((a) => a.getAttribute('href')))) {
    expect(href).toMatch(/^https:\/\//)
  }
  await expect(work.getByRole('img')).toHaveCount(6)
  await expect(work.getByText(/, \d{1,2} [A-Z][a-z]+ \d{4}$/)).toHaveCount(6)
  // Each card switches to the desktop capture, and back, without a script of its own.
  const first = cards.first()
  await first.getByText('Desktop', { exact: true }).click()
  await expect(first.getByRole('radio', { name: 'Desktop' })).toBeChecked()
  await expect(first.locator('[data-frame="browser"]')).toBeVisible()
  await expect(first.locator('[data-frame="phone"]')).toBeHidden()
  await first.getByText('Phone', { exact: true }).click()
  await expect(first.locator('[data-frame="phone"]')).toBeVisible()
})

test('about makes no claim about agencies and counts the sites built', async ({ page }) => {
  await page.goto('/')
  const about = page.locator('#about')
  await expect(about.getByText(/Most agencies/)).toHaveCount(0)
  await expect(about.getByText(/More than thirty websites since 2021/)).toBeVisible()
})

test('the not-ready visitor can send the page on without giving anything', async ({ page }) => {
  await page.goto('/')
  const closing = page.locator('#cta')
  await expect(closing.getByRole('button', { name: 'Send this page' })).toBeVisible()
  await expect(closing.getByRole('textbox')).toHaveCount(0)
})

test('FAQ entries expand', async ({ page }) => {
  await page.goto('/')
  const entry = page.locator('#faq details').first()
  await expect(entry).not.toHaveAttribute('open', '')
  await entry.locator('summary').click()
  await expect(entry).toHaveAttribute('open', '')
})

test('mobile menu opens and holds the primary action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Menu' }).click()
  const menu = page.getByRole('navigation', { name: 'Mobile' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('link', { name: 'Show me my three designs' })).toBeVisible()
})

test('metadata and structured data are present', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/See your new website before you hire\./)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /opengraph-image/,
  )
  const jsonLd = await page.locator('script[type="application/ld+json"]').innerHTML()
  expect(jsonLd).toContain('"@type":"Organization"')
})

// Lenis arrives as a lazy chunk once the page is idle and marks <html>; a link to a section of
// this page then glides there under the fixed header instead of jumping.
test('the page scrolls smoothly and a section link glides into view', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/(^|\s)lenis(\s|$)/)
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'FAQ' }).click()
  await expect(page).toHaveURL(/#faq$/)
  await expect(page.locator('#faq')).toBeInViewport()
  const top = await page.locator('#faq').evaluate((section) => section.getBoundingClientRect().top)
  expect(top).toBeGreaterThanOrEqual(64)
})

// While Lenis runs, the browser's own scrolls are instant (app/globals.css, ADR 0021): a smooth
// focus scroll was cancelled by ScrollTrigger's first refresh, which the focus scroll itself
// starts, and Tab from the hero into Work stopped below the fold on a tile still at opacity 0.
// The behaviour check alone catches that about half the time, so the computed style is checked
// too, which fails on every run without the rule.
test('a keyboard focus below the fold lands on screen with its tile shown', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/(^|\s)lenis(\s|$)/)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    'auto',
  )
  await page.getByRole('link', { name: 'Scroll to the next section' }).focus()
  await page.keyboard.press('Tab')
  const tile = page.locator('#work ul[data-choreo="tiles"]').getByRole('listitem').first()
  await expect(tile.getByRole('radio', { name: 'Phone' })).toBeFocused()
  await expect(tile.getByText('Phone', { exact: true })).toBeInViewport()
  await expect(tile).toHaveCSS('opacity', '1')
})

// The closing's button and phone rise in by GSAP from md up (ADR 0034). Their fail-safe plays
// only what the viewport has reached, so a visitor who paused long enough for its clock to tick
// before scrolling down must still find both: the tween is played by a plain trigger and never
// killed with one, which is what once left the page's final ask at opacity 0.
test('the closing ask and phone are in place after a long pause', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  await page.mouse.move(720, 450)
  await page.mouse.wheel(0, 300)
  await expect(page.locator('html')).toHaveAttribute('data-choreo', 'scrubs')
  // Longer than the fail-safe clock (CONFIG.motion.choreo.settleFailSafeMs).
  await page.waitForTimeout(4500)
  await page.locator('#cta').scrollIntoViewIfNeeded()
  const ask = page.locator('[data-rise="ask"]')
  const phone = page.locator('[data-rise="phone"] > div > div[aria-hidden="true"]')
  await expect(ask).toHaveCSS('opacity', '1')
  await expect(phone).toHaveCSS('opacity', '1')
  await expect.poll(() => ask.evaluate((el) => el.getAttribute('style') ?? '')).toBe('')
  await expect.poll(() => phone.evaluate((el) => el.getAttribute('style') ?? '')).toBe('')
})
