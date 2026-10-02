// How every check drives Chromium: reduced motion (so an entrance never hides a block), a phone
// emulated as a phone, the page scrolled end to end so lazy blocks render, and the dev server's
// own indicator hidden, since it is no part of a visitor's page.
import { chromium } from '@playwright/test'
import { isStyled, loadFonts, settle } from './in-page.mjs'

export async function launch() {
  return chromium.launch()
}

export async function contextFor(browser, viewport, extra = {}) {
  return browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.phone,
    hasTouch: viewport.phone,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    ...extra,
  })
}

const HIDE_DEV_INDICATOR = 'nextjs-portal { display: none !important; }'

// Open a page and wait until it is what a visitor sees at rest: loaded, its fonts in, scrolled
// through and back to the top. Throws on an answer that is not 200, or a page served without its
// style sheet, so a mistyped address or a broken server is never measured as a clean page.
export async function open(page, url, { scroll = true } = {}) {
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 180_000 })
  if (response === null || response.status() !== 200) {
    throw new Error(`${url}: ${String(response?.status() ?? 'no response')}`)
  }
  if (!(await page.evaluate(isStyled))) throw new Error(`${url}: served without its style sheet`)
  await page.addStyleTag({ content: HIDE_DEV_INDICATOR })
  await page.evaluate(loadFonts)
  if (scroll) await scrollThrough(page)
  await page.evaluate(settle)
}

// Down the page a screen at a time, then back to the top.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const step = Math.round(window.innerHeight * 0.8)
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await pause(60)
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
    await pause(150)
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
}

// A new viewport size on an open page, given time to lay out again.
export async function resize(page, viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(150)
  await page.evaluate(settle)
}

// Each item through work, at most n at a time, in order of the list.
export async function inPool(items, n, work) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.max(1, n) }, async () => {
      while (next < items.length) {
        const index = next
        next += 1
        results[index] = await work(items[index], index)
      }
    }),
  )
  return results
}
