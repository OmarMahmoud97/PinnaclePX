import { expect, type Page, test } from '@playwright/test'
import { BOOK_CALL } from '@/app/_components/nav-links'
import {
  buildSaid,
  CALL_AFTER_OPEN,
  EARLY_FINISH,
  INTERMISSION,
  PARTIAL_NOTES,
  STOPPED,
} from '@/app/start/_components/done-copy'
import { SLOT_LINES } from '@/app/start/_components/done-lines'
import { DONE_KEY } from '@/app/start/_components/done-storage'
import { DONE_LINES, SEND_FAILED, SEND_REFUSED, SENDING } from '@/app/start/_components/start-copy'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'
import {
  ANSWERED,
  answerSend,
  interceptStatus,
  openDone,
  refuseSends,
  statusFor,
  stubPhotos,
  withDraft,
} from './helpers/start'

// The send and the done view (docs/start-page-journey-plan.md, 4.6, 4.8, 4.9 and 9; package P8):
// every state of 4.9 reached through ?q=done&s= with the status poll answered from fixtures, the
// wait's log and ring, ready rising to light with the same heading, the call taking the lead once
// the visitor is back from an opened design, and the send held on its ink until an answer that
// never comes from the server: its request is refused before it leaves the browser (the RETRY
// path), never answered at all (the timeout), or answered in the browser, with the day's limit
// (TOO_MANY) or a submission, which the ink runs on over. Nothing here sends a brief.

const SLUG = 'donek7m2p9x4'

// This tab's own words about its send, as the flow keeps them (done-storage.ts).
const DETAILS = {
  v: 1,
  slug: SLUG,
  first: 'Sam',
  company: ANSWERED.company,
  email: ANSWERED.email,
  paletteLabel: 'Forest',
  styleLabel: 'Clean and minimal',
  photos: 0,
}

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

// The tab that sent SLUG, as after a refresh: its words kept for the done view.
async function asSender(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      sessionStorage.setItem(key, value)
    },
    { key: DONE_KEY, value: JSON.stringify(DETAILS) },
  )
}

function heading(page: Page) {
  return page.locator('main#main h1')
}

function designs(page: Page) {
  return page.getByRole('list', { name: 'Your designs' })
}

function said(page: Page) {
  return page.locator('main#main [role="status"]')
}

// The done view drawn and still: its designs listed and every entrance played.
async function drawn(page: Page): Promise<void> {
  await expect(designs(page)).toBeVisible()
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

test('while building: the heading, the lead, the time beside the ring, the log and the designs', async ({
  page,
}) => {
  await asSender(page)
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await drawn(page)
  await expect(heading(page)).toHaveText('Sam, your designs are on their way.')
  await expect(heading(page).locator('em')).toHaveText('on their way.')
  await expect(heading(page)).toBeFocused()
  const main = page.locator('main#main')
  await expect(main).toContainText(
    `We are building three homepage designs from your draft. Your page link works now and stays live for 30 days. We also email them to ${ANSWERED.email} when they are done.`,
  )
  await expect(main.getByText(/^Usually done by \d\d:\d\d\.$/)).toBeVisible()
  // The ring counts the stages landed, for the eye alone.
  await expect(page.locator('.stage-ring')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.stage-ring')).toHaveText('3 of 5')
  // The log names what has landed, with the server's times, and what is being made, with none.
  const log = page.locator('.done-log li')
  await expect(log).toHaveText([
    `0:00Brief received for ${ANSWERED.company}.`,
    `0:06Three layouts chosen for ${ANSWERED.company}.`,
    '0:07Your Forest set in 14 tones, every text colour checked for easy reading.',
    '0:21Your brief written from your sentence.',
    'Writing three headlines',
    'Finding photos for a clean and minimal look',
  ])
  await expect(page.locator('.done-log-stamp').first()).toHaveAttribute('aria-hidden', 'true')
  // Each design by its place and look, none of them open yet.
  await expect(designs(page).getByRole('listitem')).toHaveCount(3)
  await expect(designs(page).getByText(SLOT_LINES.beingBuilt)).toHaveCount(3)
  await expect(designs(page).getByRole('link')).toHaveCount(0)
  // The page link works from the first poll; at a desk its card sits under the posters, in the
  // region, and only that copy is shown (brief-done-polish.spec.ts).
  await expect(page.getByRole('link', { name: new RegExp(`/preview/${SLUG}`) })).toHaveAttribute(
    'href',
    `/preview/${SLUG}`,
  )
  await expect(page.getByRole('button', { name: 'Share this page' })).toBeVisible()
  // Under a minute in, the call is not offered yet, and no new brief either.
  await expect(main.getByText(INTERMISSION.line)).toHaveCount(0)
  await expect(page.getByRole('button', { name: DONE_LINES.newBrief })).toHaveCount(0)
  await expect(page).toHaveTitle('Building your designs | PinnaclePX')
})

test('the call is offered once the first headline has landed', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building', { stages: { stageCopy: 'done' } })])
  await drawn(page)
  const aside = page.locator('main#main').getByText(INTERMISSION.line)
  await expect(aside).toBeVisible()
  const call = page.getByRole('link', { name: `${INTERMISSION.link} ${SITE.newTab}` })
  await expect(call).toHaveAttribute('href', SITE.bookingUrl)
  await expect(call).toHaveAttribute('target', '_blank')
})

test('past the deadline, the delay line takes the time’s place', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building', { deadlineInMs: -60_000 })])
  await drawn(page)
  await expect(page.getByText(SLOT_LINES.timeUp)).toBeVisible()
  await expect(page.getByText(/^Usually done by/)).toHaveCount(0)
})

test('ready: the same heading lit, the time the build took, and every design open', async ({
  page,
}) => {
  await asSender(page)
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await drawn(page)
  await expect(heading(page)).toHaveText('Sam, your designs are ready.')
  await expect(heading(page).locator('em')).toHaveText('ready.')
  const main = page.locator('main#main')
  await expect(main).toContainText(
    'Built in 1:04. Each opens in a new tab and stays live for 30 days.',
  )
  await expect(main.getByText(EARLY_FINISH)).toBeVisible()
  // The page is light: no dark scope on main, the flow marked lit.
  await expect(main).not.toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.start-flow')).toHaveAttribute('data-lit', '')
  // The one filled ask opens the first design; the call waits as a link.
  const ask = page.locator('.start-done-ask')
  await expect(ask).toHaveText(`Open design one ${SITE.newTab}`)
  await expect(ask).toHaveAttribute('href', `/preview/${SLUG}/t01-aurora`)
  await expect(ask).toHaveAttribute('target', '_blank')
  await expect(designs(page).getByRole('link')).toHaveCount(3)
  await expect(
    page.getByRole('link', { name: `${INTERMISSION.link} ${SITE.newTab}` }),
  ).toBeVisible()
  await expect(main.getByText(INTERMISSION.line)).toHaveCount(0)
  // The wait's time and log have gone.
  await expect(page.locator('.done-log')).toHaveCount(0)
  await expect(page).toHaveTitle('Ready: your three designs | PinnaclePX')
})

test('partial reads as ready, with what was set simply', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'partial')])
  await drawn(page)
  await expect(heading(page)).toHaveText('Your designs are ready.')
  await expect(page.getByText(PARTIAL_NOTES.photos)).toBeVisible()
  await expect(page.getByText(PARTIAL_NOTES.headlines)).toHaveCount(0)
  await expect(designs(page).getByRole('link')).toHaveCount(3)
})

for (const state of ['failed', 'exhausted'] as const) {
  test(`${state}: today's words, the call leading, and a new brief`, async ({ page }) => {
    await openDone(page, SLUG, [statusFor(SLUG, state)])
    await expect(heading(page)).toHaveText(STOPPED[state].heading)
    const main = page.locator('main#main')
    await expect(main.getByText(STOPPED[state].lead)).toBeVisible()
    await expect(
      main.getByRole('link', { name: `Book a 20-minute call ${SITE.newTab}` }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: DONE_LINES.newBrief })).toBeVisible()
    await expect(designs(page)).toHaveCount(0)
    await expect(page.locator('.start-flow')).toHaveAttribute('data-dim', '')
  })
}

test('restored from a link: the plain words, the address unnamed, the booking page unfilled', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building', { stages: { stageCopy: 'done' } })])
  await drawn(page)
  await expect(heading(page)).toHaveText('Your designs are on their way.')
  const main = page.locator('main#main')
  await expect(main).toContainText('We also email them to the address you gave when they are done.')
  await expect(page.locator('.done-log li').first()).toHaveText('0:00Brief received.')
  await expect(
    page.getByRole('link', { name: `${INTERMISSION.link} ${SITE.newTab}` }),
  ).toHaveAttribute('href', SITE.bookingUrl)
})

test('while the first answer is on its way, the stand-in holds the heading and the page link', async ({
  page,
}) => {
  // The poll is left unanswered.
  await page.route(`**/api/status/${SLUG}`, () => undefined)
  await asSender(page)
  await page.goto(`/start?q=done&s=${SLUG}`)
  await expect(heading(page)).toHaveText('Sam, your designs are on their way.')
  await expect(
    page.locator('main#main').getByRole('link', { name: new RegExp(`/preview/${SLUG}`) }),
  ).toBeVisible()
  await expect(designs(page)).toHaveCount(0)
})

test('a build of two says two everywhere', async ({ page }) => {
  await page.clock.install()
  await asSender(page)
  await openDone(page, SLUG, [
    statusFor(SLUG, 'building', { conceptCount: 2 }),
    statusFor(SLUG, 'ready', { conceptCount: 2 }),
  ])
  await drawn(page)
  const main = page.locator('main#main')
  await expect(main).toContainText('We are building two homepage designs from your draft.')
  await expect(page.locator('.done-log')).toContainText('Two layouts chosen')
  await expect(page.locator('.done-log')).toContainText('Writing two headlines')
  await expect(designs(page).getByRole('listitem')).toHaveCount(2)
  await expect(main).not.toContainText('three')
  await expect(page.locator('.stage-ring')).toHaveText('3 of 5')

  await page.clock.runFor(CONFIG.polling.statusMs)
  await expect(heading(page)).toHaveText('Sam, your designs are ready.')
  await expect(said(page)).toHaveText(buildSaid(2).ready)
  await expect(page).toHaveTitle('Ready: your two designs | PinnaclePX')
  await expect(designs(page).getByRole('link')).toHaveCount(2)
  await expect(main).not.toContainText('three')
})

test('ready rises in place: the heading keeps the focus, and the status says it once', async ({
  page,
}) => {
  await page.clock.install()
  await asSender(page)
  await openDone(page, SLUG, [statusFor(SLUG, 'building'), statusFor(SLUG, 'ready')])
  await drawn(page)
  const before = await heading(page).elementHandle()
  await expect(heading(page)).toBeFocused()
  await expect(said(page)).toHaveText('')

  await page.clock.runFor(CONFIG.polling.statusMs)
  await expect(heading(page)).toHaveText('Sam, your designs are ready.')
  expect(await heading(page).evaluate((node, old) => node === old, before)).toBe(true)
  await expect(heading(page)).toBeFocused()
  await expect(said(page)).toHaveText(buildSaid(3).ready)
  await expect(page.locator('main#main [role="status"], main#main [aria-live]')).toHaveCount(1)
})

test('back from an opened design, the call is the one filled ask, filled in for the visitor', async ({
  page,
}) => {
  // The design opens in a tab of its own, which is answered here: its page reads the database. So
  // is any other page a new tab could open, the booking page included, so a wrong one shows up.
  await page.context().route(
    (url) => url.pathname !== '/start',
    (route) =>
      route.request().resourceType() === 'document'
        ? route.fulfill({ contentType: 'text/html', body: '<title>Opened</title>' })
        : route.fallback(),
  )
  await asSender(page)
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await drawn(page)
  const ask = page.locator('.start-done-ask')
  const design = (await ask.getAttribute('href')) ?? ''
  expect(design).toMatch(new RegExp(`^/preview/${SLUG}/`))
  const opened = page.context().waitForEvent('page')
  await ask.click()
  const tab = await opened
  await tab.waitForLoadState()
  // The press opens the design it named, and the ask is still the design until the visitor is back.
  expect(new URL(tab.url()).pathname).toBe(design)
  await expect(ask).toHaveAttribute('href', design)
  await expect(page.getByText(CALL_AFTER_OPEN)).toHaveCount(0)
  await tab.close()

  // The visitor comes back: Playwright keeps every page focused, so the window's own blur and
  // focus stand in for leaving it for the design's tab and returning.
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'))
    window.dispatchEvent(new Event('focus'))
  })
  await expect(page.getByText(CALL_AFTER_OPEN)).toBeVisible()
  await expect(ask).toBeFocused()
  await expect(ask).toHaveText(`Book a 20-minute call ${SITE.newTab}`)
  const href = new URL((await ask.getAttribute('href')) ?? '')
  expect(`${href.origin}${href.pathname}`).toBe(SITE.bookingUrl)
  expect(href.searchParams.get('name')).toBe('Sam')
  expect(href.searchParams.get('email')).toBe(ANSWERED.email)
  await expect(ask).toHaveAttribute('target', '_blank')
  // The aside gives way: the call leads now.
  await expect(page.getByRole('link', { name: `${INTERMISSION.link} ${SITE.newTab}` })).toHaveCount(
    0,
  )
})

test('the designs are one list, outside anything hidden, with one live region', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await drawn(page)
  const links = designs(page).getByRole('link')
  await expect(links).toHaveCount(3)
  for (const link of await links.all()) {
    expect(await link.evaluate((node) => node.closest('[aria-hidden="true"]'))).toBeNull()
  }
  // Drawn twice, displayed once: the region's posters at a desk, the rows in main hidden.
  await expect(page.locator('.design-list')).toHaveCount(2)
  await expect(page.locator('.design-list:visible')).toHaveCount(1)
  await expect(
    page.getByRole('region', { name: 'Your brief so far' }).locator('.design-list'),
  ).toBeVisible()
  await expect(page.locator('main#main [role="status"], main#main [aria-live]')).toHaveCount(1)
})

// The last question's ask, pressed with the whole brief answered and the day's floor waited out.
async function pressSend(page: Page): Promise<void> {
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(heading(page)).toHaveText('Where should we send them?')
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
}

test('a send whose request never leaves the browser holds the ink, then drains to the ask', async ({
  page,
}) => {
  const posts: string[] = []
  page.on('requestfinished', (request) => {
    if (request.method() !== 'GET' && new URL(request.url()).pathname === '/start') {
      posts.push(request.url())
    }
  })
  await pressSend(page)
  const ask = page.locator('.start-ask button[type="submit"]')
  // Held: the ink from the ask, the ask busy and focused, the fields quiet.
  await expect(page.locator('.send-bloom')).toHaveAttribute('data-phase', 'hold')
  await expect(page.locator('.start-flow')).toHaveAttribute('data-state', 'sending')
  await expect(ask).toHaveText(SENDING.ask)
  await expect(ask).toHaveAttribute('aria-disabled', 'true')
  await expect(ask).toBeFocused()
  await expect(page.locator('main#main [data-part="controls"]')).toHaveAttribute('inert', '')
  await expect(page.locator('.send-words')).toHaveText(SENDING.ink)

  // The refused request is a dropped connection: the ink drains and the ask says so.
  await expect(page.getByText(SEND_FAILED)).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('.send-bloom')).toHaveCount(0)
  await expect(ask).toBeFocused()
  await expect(ask).not.toHaveAttribute('aria-disabled')
  const describedBy = (await ask.getAttribute('aria-describedby')) ?? ''
  await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(SEND_FAILED)
  await expect(page.locator('main#main [data-part="controls"]')).not.toHaveAttribute('inert')
  await expect(page).toHaveURL(/\/start\?q=5$/)
  expect(posts).toEqual([])
})

test('a send with no answer in time gives up and says to try again', async ({ page }) => {
  await page.clock.install()
  // The request is held here, never answered and never sent on.
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'GET' ? route.fallback() : undefined),
  )
  await pressSend(page)
  await expect(page.locator('.send-bloom')).toHaveAttribute('data-phase', 'hold')
  await page.clock.runFor(CONFIG.form.minMs + CONFIG.start.send.timeoutMs)
  await expect(page.getByText(SEND_REFUSED.retry)).toBeVisible()
  await expect(page.locator('.start-ask button[type="submit"]')).toBeFocused()
  await page.unrouteAll({ behavior: 'ignoreErrors' })
})

test('a send refused for the day says so and offers the call', async ({ page }) => {
  await answerSend(page, { ok: false, reason: 'too_many' })
  await pressSend(page)
  const ask = page.locator('.start-ask button[type="submit"]')
  await expect(page.getByText(SEND_REFUSED.too_many)).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('.send-bloom')).toHaveCount(0)
  await expect(ask).toBeFocused()
  const call = page.getByRole('link', { name: `${BOOK_CALL.label} ${SITE.newTab}` })
  await expect(call).toHaveAttribute('href', SITE.bookingUrl)
  await expect(call).toHaveAttribute('target', '_blank')
  // The words and the call are the ask's description.
  const describedBy = (await ask.getAttribute('aria-describedby')) ?? ''
  await expect(page.locator(`[id="${describedBy}"]`)).toContainText(SEND_REFUSED.too_many)
  await expect(page.locator(`[id="${describedBy}"]`)).toContainText(BOOK_CALL.label)
})

test('a send the server took runs its ink over the page before the done view shows', async ({
  page,
}) => {
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  const deadlineAt = new Date(Date.now() + CONFIG.deadline.totalMs).toISOString()
  await answerSend(page, { ok: true, value: { slug: SLUG, deadlineAt, conceptCount: 3 } })
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(heading(page)).toHaveText('Where should we send them?')
  // Each change of the grid's state, with how much of main's content and of its ink shows then.
  await page.evaluate(() => {
    const flow = document.querySelector('.start-flow')
    const main = document.getElementById('main')
    const seen: string[] = []
    Object.assign(window, { seen })
    if (flow === null || main === null) return
    new MutationObserver(() => {
      const content = main.firstElementChild
      seen.push(
        [
          flow.getAttribute('data-state'),
          flow.hasAttribute('data-arriving') ? 'arriving' : '',
          content === null ? '' : getComputedStyle(content).opacity,
          getComputedStyle(main, '::before').opacity,
        ].join(' '),
      )
    }).observe(flow, { attributes: true, attributeFilter: ['data-state', 'data-arriving'] })
  })
  await page.getByRole('button', { name: 'Show me my three designs' }).click()

  await expect(page).toHaveURL(new RegExp(`\\?q=done&s=${SLUG}$`), { timeout: 10_000 })
  await expect(page.locator('.send-bloom')).toHaveCount(0)
  await expect(page.locator('.start-flow')).not.toHaveAttribute('data-arriving')
  await expect(heading(page)).toBeFocused()
  await expect(page.locator('main#main > *')).toHaveCSS('opacity', '1')
  const seen = await page.evaluate(() => (window as unknown as { seen: string[] }).seen)
  // While the ink ran on, the done view waited unseen on the questions' ground; then the page's
  // own ink took over, whole, under it.
  expect(seen).toContain('done arriving 0 0')
  expect(seen.at(-1)).toMatch(/^done {2}\S+ 1$/)
})

test('no status poll ever asks for more than its route', async ({ page }) => {
  const stub = await interceptStatus(page, SLUG, [statusFor(SLUG, 'ready')])
  await page.goto(`/start?q=done&s=${SLUG}`)
  await drawn(page)
  expect(stub.polls()).toBe(1)
})

// Every state of the poll (plan 4.9), each in a tab of its own, so none is left unreached.
const STATES: readonly SubmissionStatus['status'][] = [
  'building',
  'ready',
  'partial',
  'failed',
  'exhausted',
  'missing',
]

for (const state of STATES) {
  test(`a ${state} build draws its done state`, async ({ page }) => {
    await openDone(page, SLUG, [statusFor(SLUG, state)])
    if (state === 'missing') {
      await expect(page).toHaveURL(/\/start\?q=1$/)
      await expect(page.locator('main#main textarea')).toBeVisible()
    } else {
      await expect(heading(page)).toBeFocused()
      await expect(said(page)).toHaveCount(1)
    }
  })
}
