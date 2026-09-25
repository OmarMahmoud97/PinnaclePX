import { expect, type Page, test } from '@playwright/test'
import { DONE_KEY } from '@/app/start/_components/done-storage'
import { EDGE_NAMES, openDone, refuseSends, statusFor, stubPhotos } from './helpers/start'

// The done view on a phone (docs/start-page-journey-plan.md, 4.2, 4.5, 7.7 and 9.1; package
// P8): the designs are rows in main, the posters over them decoration; the heading is in the first
// screen; ready's ask rides the foot and keeps clear of a row reached by Tab; and long names hold
// on the narrowest phone. Nothing here sends a brief.

const SLUG = 'mdonk7m2p9x4'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

function designs(page: Page) {
  return page.getByRole('list', { name: 'Your designs' })
}

async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

test('while building, the heading is in the first screen and the designs are rows in main', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(designs(page)).toBeVisible()
  await settled(page)
  await expect(page.locator('main#main h1')).toBeInViewport()
  // The list in the accessibility tree is main's; the region's posters are decoration.
  await expect(page.locator('main#main').getByRole('list', { name: 'Your designs' })).toBeVisible()
  await expect(page.locator('.done-strip')).toBeVisible()
  await expect(page.locator('.done-strip')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.design-list:visible')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
})

test('at ready the first design is the ask riding the foot', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await expect(designs(page)).toBeVisible()
  await settled(page)
  const well = page.locator('.done-ask')
  await expect(well).toHaveCSS('position', 'fixed')
  const ask = well.getByRole('link', { name: /^Open design one/ })
  await expect(ask).toBeInViewport()
  const box = await ask.boundingBox()
  expect(box?.height).toBeGreaterThanOrEqual(48)
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(844 - 80)
  // At the end of the page it still rides the foot, clear of the last line.
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await expect(ask).toBeInViewport()
  const aside = page.getByRole('link', { name: /^Pick a time/ })
  const last = await aside.boundingBox()
  const foot = await ask.boundingBox()
  expect((last?.y ?? 0) + (last?.height ?? 0)).toBeLessThanOrEqual(foot?.y ?? 0)
})

test('on a short phone, a design reached by Tab stays clear of the ask', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 })
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await expect(designs(page)).toBeVisible()
  await settled(page)
  const ask = page.locator('.start-done-ask')
  for (const link of await designs(page).getByRole('link').all()) {
    await link.focus()
    await page.waitForTimeout(100)
    const row = await link.boundingBox()
    const foot = await ask.boundingBox()
    if (row === null || foot === null) throw new Error('nothing to measure')
    expect(row.y + row.height, 'the row ends above the ask').toBeLessThanOrEqual(foot.y)
  }
})

test.describe('long names on the narrowest phone', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  // Every visible element in main with text of its own that is wider inside than out.
  function overflowing(page: Page) {
    return page.locator('main#main').evaluate((main) => {
      const wide: string[] = []
      for (const element of main.querySelectorAll<HTMLElement>('*')) {
        if (element.closest('.sr-only, [hidden]') !== null) continue
        const ownText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
        )
        if (!ownText || element.getClientRects().length === 0) continue
        if (element.scrollWidth > element.clientWidth + 1) {
          wide.push(`${element.tagName.toLowerCase()}: ${element.textContent.slice(0, 40)}`)
        }
      }
      return wide
    })
  }

  for (const state of ['building', 'ready'] as const) {
    test(`the done view holds a long business name and email while ${state}`, async ({ page }) => {
      await page.addInitScript(
        ({ key, value }) => {
          sessionStorage.setItem(key, value)
        },
        {
          key: DONE_KEY,
          value: JSON.stringify({
            v: 1,
            slug: SLUG,
            first: 'Sam',
            company: EDGE_NAMES.unbrokenCompany,
            email: EDGE_NAMES.longEmail,
            paletteLabel: 'Forest',
            styleLabel: 'Clean and minimal',
            photos: 0,
          }),
        },
      )
      await openDone(page, SLUG, [statusFor(SLUG, state)])
      await expect(designs(page)).toBeVisible()
      await settled(page)
      // Building names the business in the log and the address in the lead; ready names neither.
      if (state === 'building') {
        await expect(page.locator('main#main')).toContainText(EDGE_NAMES.longEmail)
        await expect(page.locator('main#main')).toContainText(EDGE_NAMES.unbrokenCompany)
      }
      expect(await overflowing(page)).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
    })
  }
})
