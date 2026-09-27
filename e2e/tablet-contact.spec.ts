import { expect, type Page, test } from '@playwright/test'
import { hydrated, refuseContactSends, settled } from './helpers/contact'

// /contact on a tablet (ADR 0040): 768x1024, where the desktop header first shows, and 820x1180.
// The cards stack in one column and the call card lies on its side, its words left and its ask
// right; the header's whole row fits; at 820 both cards are on the first screen, and the band
// ends just under the call card, with no empty ground below it.

test.beforeEach(async ({ page }) => {
  await refuseContactSends(page)
})

function rect(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const box = element.getBoundingClientRect()
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right }
    })
}

async function open(page: Page) {
  await page.goto('/contact')
  await hydrated(page)
  await settled(page)
}

function layout(width: number) {
  test('one column, the call card on its side, the header whole, no sideways scroll', async ({
    page,
  }) => {
    await open(page)
    const form = await rect(page, '#write')
    const call = await rect(page, '#call')
    expect(call.left).toBeCloseTo(form.left, 0)
    expect(call.top).toBeGreaterThanOrEqual(form.bottom)
    const heading = await rect(page, '#call-heading')
    const ask = await rect(page, '#call button[aria-controls="booking"]')
    expect(ask.left).toBeGreaterThanOrEqual(heading.right)
    const last = await rect(page, 'nav[aria-label="Main"] li:last-child')
    expect(last.right).toBeLessThanOrEqual(width)
    const scrollX = await page.evaluate(() => {
      window.scrollTo(200, 0)
      return window.scrollX
    })
    expect(scrollX).toBe(0)
  })
}

test.describe('at 768 by 1024', () => {
  layout(768)
})

test.describe('at 820 by 1180', () => {
  test.use({ viewport: { width: 820, height: 1180 } })
  layout(820)

  test('both cards are on the first screen, and the band ends under the call card', async ({
    page,
  }) => {
    await open(page)
    expect((await rect(page, '#write')).bottom).toBeLessThanOrEqual(1180)
    const call = await rect(page, '#call')
    expect(call.bottom).toBeLessThanOrEqual(1180)
    const band = await rect(page, '#contact')
    expect(band.bottom - call.bottom).toBeLessThanOrEqual(64)
  })
})
