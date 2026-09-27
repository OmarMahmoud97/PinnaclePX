import { expect, type Page, test } from '@playwright/test'
import { WRITE } from '@/app/contact/_components/contact-copy'
import { hydrated, refuseContactSends, settled, stubCal } from './helpers/contact'

// /contact on a phone (ADR 0040): 390x844, and the 360x640 floor. The first screen holds the H1,
// the form's heading, the whole message field and the control that opens the calendar, so both
// routes start there; nothing overlaps the field, Send is a full-width thumb target, and the
// page never scrolls sideways.

test.beforeEach(async ({ page }) => {
  await refuseContactSends(page)
})

async function open(page: Page) {
  await page.goto('/contact')
  await hydrated(page)
  await settled(page)
}

function rect(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const box = element.getBoundingClientRect()
      return { top: box.top, bottom: box.bottom, left: box.left, right: box.right }
    })
}

// Every fence, at the size the describe sets.
function fences(size: Readonly<{ width: number; height: number }>) {
  test('the first screen holds the heading, the message field and the call', async ({ page }) => {
    await open(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(size.width)
    for (const selector of [
      'h1',
      '#write-heading',
      '#write textarea[name="message"]',
      '#write button[aria-controls="booking"]',
    ]) {
      const box = await rect(page, selector)
      expect(box.top, selector).toBeGreaterThanOrEqual(0)
      expect(box.bottom, selector).toBeLessThanOrEqual(size.height)
    }
    // The call's control reads as the question it answers.
    await expect(
      page.locator('#write button[aria-controls="booking"]').locator('..'),
    ).toContainText(`${WRITE.ratherTalk} Book a 20-minute call`)
  })

  test('the fields are set at 16px and nothing is fixed over the message', async ({ page }) => {
    await open(page)
    for (const field of await page
      .locator('#write textarea, #write input:not([name="website"])')
      .all()) {
      await expect(field).toHaveCSS('font-size', '16px')
    }
    const field = await rect(page, '#write textarea[name="message"]')
    const over = await page.evaluate((field) => {
      const pinned = [...document.querySelectorAll('body *')].filter((element) => {
        const { position } = getComputedStyle(element)
        return position === 'fixed' || position === 'sticky'
      })
      return pinned
        .map((element) => ({ element, box: element.getBoundingClientRect() }))
        .filter(
          ({ box }) =>
            box.width > 0 &&
            box.height > 0 &&
            box.top < field.bottom &&
            box.bottom > field.top &&
            box.left < field.right &&
            box.right > field.left,
        )
        .map(({ element }) => element.tagName.toLowerCase())
    }, field)
    expect(over).toEqual([])
  })

  test('the order is the heading, the form, then the call, and Send is a thumb target', async ({
    page,
  }) => {
    await open(page)
    const heading = await rect(page, 'h1')
    const form = await rect(page, '#write')
    const call = await rect(page, '#call')
    expect(heading.bottom).toBeLessThanOrEqual(form.top)
    expect(form.bottom).toBeLessThanOrEqual(call.top)
    const send = await page.locator('#hero-cta').boundingBox()
    const row = await page.locator('#hero-cta').locator('..').boundingBox()
    expect(send?.height ?? 0).toBeGreaterThanOrEqual(48)
    expect(send?.width ?? 0).toBeCloseTo(row?.width ?? 0, 0)
    // The header's pill fits the screen.
    const pill = await rect(page, 'header .header-row')
    expect(pill.left).toBeGreaterThanOrEqual(0)
    expect(pill.right).toBeLessThanOrEqual(size.width)
  })

  test('the call control opens the calendar over the whole screen', async ({ page }) => {
    await stubCal(page)
    await open(page)
    await page.locator('#write button[aria-controls="booking"]').click()
    const sheet = page.locator('dialog#booking')
    await expect(sheet).toHaveAttribute('data-phase', 'open')
    await expect(sheet.locator('[data-cal]')).toHaveAttribute('data-cal', 'ready')
    const box = await rect(page, 'dialog#booking')
    expect(box).toEqual({ top: 0, bottom: size.height, left: 0, right: size.width })
  })
}

test.describe('at 390 by 844', () => {
  fences({ width: 390, height: 844 })
})

test.describe('at 360 by 640', () => {
  test.use({ viewport: { width: 360, height: 640 } })
  fences({ width: 360, height: 640 })
})

// Between 640 and 767px the menu's foot is a row that wraps (app/_styles/header.css), with the
// contact page's link beside the call's; nothing in it may run past its own box. The sheet
// itself bleeds its watermark 40px past the edge, which predates the contact page.
test.describe('the menu at 700 by 900', () => {
  test.use({ viewport: { width: 700, height: 900 } })

  test("the menu's foot holds the call and the contact page within its box", async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Menu' }).click()
    const foot = page.locator('.menu-foot')
    await expect(foot.getByRole('link', { name: 'Contact', exact: true })).toBeVisible()
    const widths = await foot.evaluate((element) => [element.scrollWidth, element.clientWidth])
    expect(widths[0]).toBe(widths[1])
  })
})
