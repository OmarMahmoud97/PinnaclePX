import { expect, type Page, test } from '@playwright/test'
import { SHARE_WORDS } from '@/app/start/_components/done-copy'
import { EXAMPLE_SLUG } from '@/lib/preview/example'
import { EDGE_NAMES, interceptStatus, refuseSends, statusFor, stubPhotos } from './helpers/start'

// The designs page on a phone (docs/start-page-journey-plan.md, 8.4, 7.7 and 9.5; package P7): the
// designs as rows, each a small poster beside its name, nothing wider than the screen at any state
// or with the longest names, and every control big enough for a thumb. The example build stands in
// for a real one (app/examples/hub/page.tsx), with its status poll answered here.

const HUB = '/examples/hub'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
  await interceptStatus(page, EXAMPLE_SLUG, [statusFor(EXAMPLE_SLUG, 'building')])
})

async function scrollWidth(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth)
}

test('every state fits the phone, the designs in rows', async ({ page }) => {
  for (const state of ['building', 'ready', 'partial', 'failed']) {
    await page.goto(`${HUB}?state=${state}`)
    await expect(page.locator('main#main h1')).toBeVisible()
    expect(await scrollWidth(page), state).toBeLessThanOrEqual(390)
    if (state === 'failed') continue
    const rows = page.locator('.hub-design')
    await expect(rows).toHaveCount(3)
    for (const row of await rows.all()) {
      const box = await row.boundingBox()
      const poster = await row.locator('.design-poster').boundingBox()
      expect(box?.height, state).toBeGreaterThanOrEqual(48)
      // A row is a thumbnail beside its words, not a full poster.
      expect(poster?.width, state).toBeLessThan(100)
    }
  }
})

// Plan 7.7: an unbroken 60-character name, and the longest the schema takes, wrap inside every
// box that shows them.
test('the longest names wrap rather than widen anything', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const [key, name] of [
    ['unbroken', EDGE_NAMES.unbrokenCompany],
    ['longest', EDGE_NAMES.longestCompany],
  ] as const) {
    await page.goto(`${HUB}?state=ready&name=${key}`)
    await expect(page.locator('main#main h1')).toContainText(name)
    expect(await scrollWidth(page), key).toBeLessThanOrEqual(320)
    const overflowing = await page.locator('main#main').evaluate((main) =>
      [...main.querySelectorAll<HTMLElement>('h1, p, a, button, span')]
        .filter((element) => element.closest('[aria-hidden="true"], .sr-only') === null)
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => element.outerHTML.slice(0, 80)),
    )
    expect(overflowing, key).toEqual([])
  }
})

test('the design rows, the share and the call are big enough for a thumb', async ({ page }) => {
  await page.goto(`${HUB}?state=ready`)
  const targets = [
    page.getByRole('button', { name: SHARE_WORDS.share }),
    page.getByRole('link', { name: /^Book a 20-minute call/ }).first(),
    ...(await page.getByRole('list', { name: 'Your designs' }).getByRole('link').all()),
  ]
  for (const target of targets) {
    const box = await target.boundingBox()
    // WCAG 2.2's minimum target, 24 by 24.
    expect(box?.height).toBeGreaterThanOrEqual(24)
    expect(box?.width).toBeGreaterThanOrEqual(24)
  }
})
