// How every check drives Chromium: reduced motion (so an entrance never hides a block), a phone
// emulated as a phone, the page scrolled end to end so lazy blocks render, and the dev server's
// own indicator hidden, since it is no part of a visitor's page.
import { chromium } from '@playwright/test'
import { isStyled, loadFonts, settle } from './in-page.mjs'
import { recordFailure } from './report.mjs'

// One Chromium for a check, launched again whenever it has gone (a crash takes every tab with
// it), so a crash costs the pages that were open and nothing more. It stands in for Playwright's
// Browser: newContext and close are all the checks use. A launch that fails is tried afresh by
// the next page that asks.
export async function launch() {
  let browser = await chromium.launch()
  let relaunching = null
  const current = async () => {
    if (browser.isConnected()) return browser
    relaunching ??= chromium.launch().then(
      (fresh) => {
        browser = fresh
        relaunching = null
        process.stderr.write('Chromium had gone; launched it again.\n')
        return fresh
      },
      (error) => {
        relaunching = null
        throw error
      },
    )
    return relaunching
  }
  return {
    newContext: async (options) => (await current()).newContext(options),
    close: async () => {
      await browser.close().catch(() => undefined)
    },
  }
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

// A context and a tab of their own for one piece of work, closed afterwards whatever happens.
export async function withTab(browser, viewport, work, extra = {}) {
  const context = await contextFor(browser, viewport, extra)
  try {
    const tab = await context.newPage()
    return await work(tab, context)
  } finally {
    await context.close().catch(() => undefined)
  }
}

const HIDE_DEV_INDICATOR = 'nextjs-portal { display: none !important; }'

// Open a page and wait until it is what a visitor sees at rest: loaded, its fonts in, scrolled
// through and back to the top. Throws on an answer that is not 200, or a page served without its
// style sheet, so a mistyped address or a broken server is never measured as a clean page.
export async function open(page, url, { scroll = true } = {}) {
  await visit(page, url, 'networkidle')
  if (!(await page.evaluate(isStyled))) throw new Error(`${url}: served without its style sheet`)
  await page.addStyleTag({ content: HIDE_DEV_INDICATOR })
  await page.evaluate(loadFonts)
  if (scroll) await scrollThrough(page)
  await page.evaluate(settle)
}

// The waits between asks for a page the server could not give: about 70 seconds in all, time
// enough for a dev server to be started again.
const WAITS = [3000, 6000, 12_000, 20_000, 30_000]
const UNANSWERED = /ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ERR_EMPTY_RESPONSE/

// The page loaded as far as waitUntil says, answering 200. A server error or no answer at all is
// asked again: on a busy machine the dev server can fail to start the worker it runs for each
// request to a route with parameters, answer 500 until it can, or stop.
export async function visit(page, url, waitUntil) {
  let response = null
  let unanswered = null
  for (let attempt = 0; attempt <= WAITS.length; attempt += 1) {
    try {
      response = await page.goto(url, { waitUntil, timeout: 180_000 })
      unanswered = null
      if (response === null || response.status() < 500) break
    } catch (error) {
      if (!UNANSWERED.test(String(error))) throw error
      unanswered = error
    }
    if (attempt < WAITS.length) await page.waitForTimeout(WAITS[attempt])
  }
  if (unanswered !== null) throw unanswered
  if (response === null || response.status() !== 200) {
    throw new Error(`${url}: ${String(response?.status() ?? 'no response')}`)
  }
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

// Each item through work, at most n at a time, in order of the list. An item whose work throws
// (a crashed tab, a page that would not load) is tried once more, then recorded as a failure
// (report.mjs) and left out of the results, so one bad page never throws away a whole run.
// nameOf says which item it was.
export async function inPool(items, n, work, nameOf = (item) => String(item?.label ?? item)) {
  const results = new Array(items.length)
  const done = new Array(items.length).fill(false)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.max(1, n) }, async () => {
      while (next < items.length) {
        const index = next
        next += 1
        for (let attempt = 0; attempt < 2 && !done[index]; attempt += 1) {
          try {
            results[index] = await work(items[index], index)
            done[index] = true
          } catch (error) {
            const first = String(error?.message ?? error).split(/\r?\n/)[0] ?? ''
            if (attempt === 1) recordFailure(nameOf(items[index]), first)
            else process.stderr.write(`retrying ${nameOf(items[index])}: ${first}\n`)
          }
        }
      }
    }),
  )
  return results.filter((_, index) => done[index])
}
