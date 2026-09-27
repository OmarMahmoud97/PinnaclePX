import { expect, type Page, test } from '@playwright/test'
import {
  CALL,
  CONTACT_META,
  FAILED,
  KEPT,
  REFUSED,
  SENT,
  SHEET,
  STUCK,
  WRITE,
} from '@/app/contact/_components/contact-copy'
import { CONFIG } from '@/lib/config'
import { CONTACT_ERRORS } from '@/lib/contact/messages'
import { SITE } from '@/lib/site'
import {
  answerContact,
  calRequests,
  dropContact,
  hydrated,
  refuseContactSends,
  SEND_SETTLES_MS,
  settled,
  stubCal,
} from './helpers/contact'

// /contact on a 1440x900 desktop (ADR 0040): the first screen, the calendar that loads only when
// asked, the form's checks, the sent card and its ways back, the refusals, and the header's ask,
// which waits for Send. No case sends a message: every send is answered in the browser.

test.beforeEach(async ({ page }) => {
  await refuseContactSends(page)
})

const WORDS = 'Do you build sites for physios? We have two clinics and want one site.'

function fields(page: Page) {
  return {
    message: page.getByRole('textbox', { name: WRITE.messageLabel }),
    name: page.getByRole('textbox', { name: WRITE.name }),
    email: page.getByRole('textbox', { name: WRITE.email, exact: true }),
  }
}

async function write(page: Page) {
  const { message, name, email } = fields(page)
  await message.fill(WORDS)
  await name.fill('Sam')
  await email.fill('sam@example.com')
}

test('the heading and both routes are on the first screen', async ({ page }) => {
  await page.goto('/contact')
  await hydrated(page)
  await settled(page)
  await expect(page.locator('main#main')).toHaveCount(1)
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveText('Ask first, decide later.')
  await expect(heading.locator('em')).toHaveText('later')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/contact$/)
  for (const part of ['#write', '#call', '#hero-cta']) {
    const box = await page.locator(part).boundingBox()
    expect(box, part).not.toBeNull()
    expect((box?.y ?? 0) + (box?.height ?? 0), part).toBeLessThanOrEqual(900)
  }
})

// Cal.com is a third party, fetched only from a press on a booking control: never on load, a
// scroll, an arrival at the call card's address, a return through the history, or keys that move
// about the card.
test('nothing from Cal.com loads until a booking control is pressed', async ({ page }) => {
  const cal = calRequests(page)
  await page.goto('/contact')
  await hydrated(page)
  await page.waitForLoadState('networkidle')
  expect(cal()).toBe(0)
  await page.locator('footer').scrollIntoViewIfNeeded()
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.goto('/contact#call')
  await page.goto('/privacy')
  await page.goBack()
  await hydrated(page)
  await page.goForward()
  await page.goBack()
  await hydrated(page)
  await page.locator('#call button[aria-controls="booking"]').focus()
  for (const key of ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft']) {
    await page.keyboard.press(key)
  }
  await page.waitForLoadState('networkidle')
  expect(cal()).toBe(0)
})

test.describe('the calendar', () => {
  test.beforeEach(async ({ page }) => {
    await stubCal(page)
    await page.goto('/contact')
    await hydrated(page)
  })

  test('opens on a press, holds the calendar and closes by every way out', async ({ page }) => {
    const trigger = page.locator('#call button[aria-controls="booking"]')
    const sheet = page.locator('dialog#booking')
    const round = sheet.getByRole('button', { name: SHEET.close })
    await trigger.click()
    await expect(sheet).toHaveAttribute('open', '')
    await expect(round).toBeFocused()
    await expect(sheet.locator('iframe[title="Book a 20-minute call"]')).toHaveCount(1)
    await expect(sheet.locator('[data-cal]')).toHaveAttribute('data-cal', 'ready')
    await expect(
      sheet.getByRole('link', { name: /^Or open the booking page/ }).last(),
    ).toHaveAttribute('href', SITE.bookingUrl)

    await page.keyboard.press('Escape')
    await expect(sheet).not.toHaveAttribute('open')
    await expect(trigger).toBeFocused()

    for (const way of [round, sheet.getByRole('button', { name: SHEET.closeShort, exact: true })]) {
      await trigger.click()
      await expect(sheet).toHaveAttribute('data-phase', 'open')
      await way.click()
      await expect(sheet).not.toHaveAttribute('open')
      await expect(sheet).toHaveAttribute('data-phase', 'closed')
      await expect(trigger).toBeFocused()
    }
    // A second open finds the calendar where the first left it.
    await expect(sheet.locator('iframe')).toHaveCount(1)
  })

  // The stand-in fires the event Cal.com fires on the page's window once a time is booked; no
  // time is ever chosen.
  test('a call booked in the calendar is said in the sheet and on the call card', async ({
    page,
  }) => {
    const sheet = page.locator('dialog#booking')
    await page.locator('#call button[aria-controls="booking"]').click()
    await expect(sheet.locator('[data-cal]')).toHaveAttribute('data-cal', 'ready')
    await page.evaluate((name) => {
      window.dispatchEvent(new CustomEvent(`CAL:${name}:bookingSuccessfulV2`, { detail: {} }))
    }, CONFIG.contact.booking.namespace)
    await expect(sheet.getByRole('status')).toHaveText(
      SITE.calConfirms ? `${CALL.booked} ${CALL.bookedNote}` : CALL.booked,
    )
    await expect(page.locator('#call .contact-booked')).toContainText(CALL.booked)
  })

  // The tab's own request is what is checked: it is refused, so the tab never has an address.
  test('a modified click on the booking page opens a tab and no sheet', async ({ page }) => {
    const context = page.context()
    const link = page.locator('#call').getByRole('link', { name: /^Or open the booking page/ })
    const [tab, request] = await Promise.all([
      context.waitForEvent('page'),
      context.waitForEvent('request', (request) => request.isNavigationRequest()),
      link.click({ modifiers: ['ControlOrMeta'] }),
    ])
    expect(request.url()).toBe(SITE.bookingUrl)
    await tab.close()
    await expect(page.locator('dialog#booking')).not.toHaveAttribute('open')
  })
})

test('the form checks each field and shows what will land', async ({ page }) => {
  await page.goto('/contact')
  await hydrated(page)
  const { message, name, email } = fields(page)
  const mistake = page.getByText(CONTACT_ERRORS.email)

  // A mistyped address is caught as the visitor leaves the field, and let go as they fix it.
  await email.fill('sam@')
  await page.keyboard.press('Tab')
  await expect(mistake).toBeVisible()
  await email.focus()
  await email.pressSequentially('example.com')
  await expect(mistake).toHaveCount(0)
  await expect(email).toBeFocused()

  // An empty send marks every field and puts the visitor on the first.
  await email.fill('')
  await page.locator('#hero-cta').click()
  await expect(message).toBeFocused()
  await expect(page.getByText(CONTACT_ERRORS.messageEmpty)).toBeVisible()
  await expect(page.getByText(CONTACT_ERRORS.name)).toBeVisible()

  await name.fill('Sam')
  await email.fill('sam@example.com')
  const envelope = page.locator('#contact-envelope')
  await expect(envelope.locator('dt')).toHaveText(['Subject', 'From'])
  await expect(envelope.locator('dd')).toHaveText(['Message from Sam', 'sam@example.com'])
})

test('a message that goes becomes a receipt, with two ways back', async ({ page }) => {
  await answerContact(page, { ok: true, value: null })
  await page.goto('/contact')
  await hydrated(page)
  await write(page)
  const { message, name, email } = fields(page)
  const send = page.locator('#hero-cta')
  const heading = page.locator('#contact-sent-heading')

  await send.click()
  await expect(heading).toBeFocused({ timeout: SEND_SETTLES_MS })
  await expect(heading).toHaveText('Sam, your message is with the studio.')
  await expect(page).toHaveTitle(`${SENT.docTitle} | ${SITE.name}`)
  await expect(page.locator('#write [role="status"]')).toHaveText(SENT.status)
  await expect(page.locator('#write dl:not([id]) dd')).toHaveText([
    'Message from Sam',
    'sam@example.com',
  ])

  // Back to fix the address, with every word kept.
  await page.getByRole('button', { name: SENT.fix }).click()
  await expect(email).toBeFocused()
  await expect(message).toHaveValue(WORDS)
  await expect(page).toHaveTitle(`${CONTACT_META.title} | ${SITE.name}`)

  // Sent again, then another message: only the words go.
  await send.click()
  await expect(heading).toBeFocused({ timeout: SEND_SETTLES_MS })
  await page.getByRole('button', { name: SENT.again }).click()
  await expect(message).toBeFocused()
  await expect(message).toHaveValue('')
  await expect(name).toHaveValue('Sam')
  await expect(email).toHaveValue('sam@example.com')
})

test('a day of sends spent offers the call', async ({ page }) => {
  await answerContact(page, { ok: false, reason: 'too_many' })
  await page.goto('/contact')
  await hydrated(page)
  await write(page)
  await page.locator('#hero-cta').click()
  const alert = page.locator('#contact-alert')
  await expect(alert).toContainText(REFUSED.too_many, { timeout: SEND_SETTLES_MS })
  await expect(alert.getByRole('link', { name: /^Book a 20-minute call/ })).toHaveAttribute(
    'href',
    SITE.bookingUrl,
  )
})

test('a failure keeps the words, and a second in a row offers the call', async ({ page }) => {
  await answerContact(page, { ok: false, reason: 'retry' })
  await page.goto('/contact')
  await hydrated(page)
  await write(page)
  const send = page.locator('#hero-cta')
  const alert = page.locator('#contact-alert')

  await send.click()
  await expect(alert).toContainText(`${REFUSED.retry} ${KEPT}`, { timeout: SEND_SETTLES_MS })
  await expect(alert).not.toContainText(STUCK.lead)
  await expect(fields(page).message).toHaveValue(WORDS)
  await expect(send).toBeFocused()
  await expect(send).toHaveAttribute('aria-describedby', 'contact-envelope contact-alert')

  await dropContact(page)
  await send.click()
  await expect(alert).toContainText(FAILED, { timeout: SEND_SETTLES_MS })
  await expect(alert).toContainText(KEPT)
  await expect(alert).toContainText(`${STUCK.lead} Book a 20-minute call`)
  await expect(fields(page).message).toHaveValue(WORDS)
  await expect(send).toBeFocused()
})

// A send from the keyboard starts in a field the send makes inert; the focus moves to Send, so a
// failure finds it there rather than on the page.
test('a failed send from the keyboard leaves the focus on Send', async ({ page }) => {
  await answerContact(page, { ok: false, reason: 'retry' })
  await page.goto('/contact')
  await hydrated(page)
  await write(page)
  const { message, email } = fields(page)
  const send = page.locator('#hero-cta')
  const alert = page.locator('#contact-alert')

  await email.press('Enter')
  await expect(alert).toContainText(REFUSED.retry, { timeout: SEND_SETTLES_MS })
  await expect(send).toBeFocused()

  await message.press('Control+Enter')
  await expect(alert).toContainText(STUCK.lead, { timeout: SEND_SETTLES_MS })
  await expect(send).toBeFocused()
})

// Two frames: the observer that reads what is under the bar reports a frame after the scroll.
const frames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      }),
  )

async function scrollToY(page: Page, y: number) {
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: 'instant' })
  }, y)
  await frames(page)
}

// Send carries the hero's id, so the header's blue ask stays unfilled while Send is on screen
// (site-header.tsx): never two blue buttons. The call card takes the dark tokens by class, so it
// never turns the bar dark over the white card beside it; the ramp's foot does.
test("the header's ask waits for Send, and the call card never darkens the bar", async ({
  page,
}) => {
  await answerContact(page, { ok: true, value: null })
  await page.goto('/contact')
  await hydrated(page)
  const bar = page.locator('header').locator('xpath=..')
  const top = (selector: string) =>
    page.locator(selector).evaluate((element) => element.getBoundingClientRect().top + scrollY)

  await expect(bar).not.toHaveAttribute('data-filled')
  await scrollToY(page, (await top('#call')) + 60)
  await expect(bar).toHaveAttribute('data-island', '')
  await expect(bar).not.toHaveAttribute('data-over-dark')
  await expect(bar).not.toHaveAttribute('data-filled')
  await scrollToY(page, (await top('.contact-dark-foot')) + 120)
  await expect(bar).toHaveAttribute('data-over-dark', '')
  const sendFoot = await page
    .locator('#hero-cta')
    .evaluate((element) => element.getBoundingClientRect().bottom + scrollY)
  await scrollToY(page, sendFoot + 1)
  await expect(bar).toHaveAttribute('data-filled', '')

  // While the sent card shows, a hidden Send reads as scrolled away (header-chrome.tsx), so the
  // next scroll fills the ask; after "Send another message" Send is back, and the ask unfills
  // again at the next scroll.
  await scrollToY(page, 0)
  await expect(bar).not.toHaveAttribute('data-filled')
  await write(page)
  await page.locator('#hero-cta').click()
  await expect(page.locator('#contact-sent-heading')).toBeFocused({ timeout: SEND_SETTLES_MS })
  await scrollToY(page, 1)
  await expect(bar).toHaveAttribute('data-filled', '')
  await scrollToY(page, 0)
  await page.getByRole('button', { name: SENT.again }).click()
  await scrollToY(page, 1)
  await expect(bar).not.toHaveAttribute('data-filled')
})

// The home page's liquid edges, here too (ADR 0040, OD9): a wheel is the scroll intent that
// brings the choreography, the pooled curve under the first band leaves its resting arc while
// the page glides, the footer's sheet is marked for its lip, and once the page stops the curve
// settles back onto the arc the server drew.
test('the pooled curve and the footer lip spring with the scroll, as on the home page', async ({
  page,
}) => {
  await page.goto('/contact')
  await hydrated(page)
  const curve = page.locator('.ink-pool path')
  const rest = await curve.getAttribute('d')
  await page.mouse.move(720, 450)
  const drawn = new Set<string | null>()
  for (let wheel = 0; wheel < 12; wheel++) {
    await page.mouse.wheel(0, 240)
    await page.waitForTimeout(60)
    drawn.add(await curve.getAttribute('d'))
  }
  expect([...drawn].some((d) => d !== rest)).toBe(true)
  await expect(page.locator('footer.sheet')).toHaveAttribute('data-lip', '')
  await expect.poll(() => curve.getAttribute('d'), { timeout: 10_000 }).toBe(rest)
})
