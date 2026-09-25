import { expect, type Page, type Route, test } from '@playwright/test'
import {
  DONE_KEY,
  PENDING_KEY,
  SENDS_KEY,
  SUBMITTED_KEY,
} from '@/app/start/_components/done-storage'
import { questionTitle } from '@/app/start/_components/start-copy'
import { DRAFT_KEY } from '@/lib/brief/draft'
import { QUESTION_IDS, type QuestionId } from '@/lib/brief/question-ids'
import { CONFIG } from '@/lib/config'
import { windowKey } from '@/lib/rate-limit/window'
import {
  ANSWERED,
  interceptStatus,
  openDone,
  refuseSends,
  statusFor,
  withDraft,
} from './helpers/start'

// The flow's lifeline (docs/start-page-journey-plan.md, package P1): Enter in the hex field
// never sends; a draft resumes where it reached, not where it validates; a sent brief survives a
// refresh and a pasted link; one Back from done leaves /start; the poll carries on in a hidden
// tab; and the done view is its own chunk, with a stand-in that always offers the page link.
// Nothing here sends a brief: done is reached through ?q=done&s= with the poll answered from
// fixtures, or through the flow's own restore rules.

const SLUG = 'rk7m2p9x4w3h'

// The words the flow says in these states (plan 4.6, and the release's correction 11).
const EXPIRED = 'Those designs have expired, or the link is incomplete. Start a new brief here.'
const NOT_FOUND = 'We could not find that link. Start a new brief here.'
const PENDING =
  'If you pressed send just now, it may be on its way. Sending again will not start a second build.'

const HOUR_MS = 3_600_000

// A question's number in the address, wherever the order puts it, so these checks hold through
// Release 2's new order (docs/start-page-journey-plan.md, D2).
function numberOf(id: QuestionId): number {
  return QUESTION_IDS.indexOf(id) + 1
}

type Seed = Readonly<{ store: 'local' | 'session'; key: string; value: unknown }>

// Writes the keys a send leaves behind before the page's scripts run, on the tab's first
// document only, so a reload reads what the page itself kept.
async function seedOnce(page: Page, seeds: readonly Seed[]): Promise<void> {
  await page.addInitScript(
    ({ entries, flag }) => {
      if (sessionStorage.getItem(flag) !== null) return
      for (const { store, key, value } of entries) {
        const storage = store === 'local' ? localStorage : sessionStorage
        storage.setItem(key, JSON.stringify(value))
      }
      sessionStorage.setItem(flag, 'yes')
    },
    { entries: seeds, flag: 'e2e.done-seeded' },
  )
}

// The local key a send writes: the slug, when the designs are due, and when it stops restoring.
function submittedSeed(slug: string): Seed {
  const deadlineAt = Date.now() + CONFIG.deadline.totalMs
  return {
    store: 'local',
    key: SUBMITTED_KEY,
    value: {
      v: 1,
      slug,
      deadlineAt: new Date(deadlineAt).toISOString(),
      conceptCount: 3,
      savedAt: Date.now(),
      expiresAt: deadlineAt + CONFIG.start.done.restoreHours * HOUR_MS,
    },
  }
}

// The tab's own words about the send, kept for as long as the tab is open.
const DETAILS_SEED: Seed = {
  store: 'session',
  key: DONE_KEY,
  value: {
    v: 1,
    slug: SLUG,
    first: 'Sam',
    company: ANSWERED.company,
    email: ANSWERED.email,
    paletteLabel: 'Forest',
    styleLabel: 'Clean and minimal',
  },
}

// The day's sends, as the server counts its window.
function sendsSeed(slugs: readonly string[]): Seed {
  const { windowSeconds } = CONFIG.rateLimit.submissionsPerIdentity
  return {
    store: 'local',
    key: SENDS_KEY,
    value: { v: 1, window: windowKey(new Date(), windowSeconds), slugs },
  }
}

function heading(page: Page) {
  return page.locator('main#main h1')
}

function designs(page: Page) {
  return page.getByRole('list', { name: 'Your designs' })
}

function newBrief(page: Page) {
  return page.getByRole('button', { name: 'Start a new brief' })
}

const DONE_ADDRESS = new RegExp(`/start\\?q=done&s=${SLUG}$`)

// Moves this entry to the done address as a send does (brief-flow.tsx, send): in place, with the
// flow's marks on the entry kept and Next left to add its own.
async function sendsTo(page: Page, slug: string): Promise<void> {
  await page.evaluate((slug) => {
    const state: unknown = window.history.state
    const marks =
      typeof state === 'object' && state !== null
        ? Object.fromEntries(Object.entries(state).filter(([key]) => key.startsWith('start')))
        : {}
    window.history.replaceState(marks, '', `/start?q=done&s=${slug}`)
  }, slug)
}

const readKey = (page: Page, store: 'local' | 'session', key: string) =>
  page.evaluate(
    ({ store, key }) => (store === 'local' ? localStorage : sessionStorage).getItem(key),
    { store, key },
  )

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('Enter in the hex field checks the colour, keeps the focus and never sends', async ({
  page,
}) => {
  const sends: string[] = []
  page.on('request', (request) => {
    if (request.method() !== 'GET' && new URL(request.url()).pathname === '/start') {
      sends.push(request.method())
    }
  })
  // The visitor's own colour is chosen, so the hex field shows whether it stands alone, as today,
  // or waits behind "My own colour", as it will.
  const colours = numberOf('colours')
  await withDraft(page, { reached: colours - 1, colours: { kind: 'custom', hex: '#2f6f4e' } })
  await page.goto(`/start?q=${String(colours)}`)
  const hex = page.getByRole('textbox', { name: /^(Brand colour|Hex code)$/ })

  await hex.fill('#12')
  await hex.press('Enter')
  await expect(page.getByText('Use a hex code such as #2F6F4E.')).toBeVisible()
  await expect(hex).toBeFocused()

  await hex.fill('#2f6f4e')
  await hex.press('Enter')
  await expect(hex).toBeFocused()
  await expect(page).toHaveURL(new RegExp(`/start\\?q=${String(colours)}$`))
  expect(sends).toEqual([])
})

test('a draft resumes at the question it reached, though every later answer is valid', async ({
  page,
}) => {
  await withDraft(page, { reached: 2 })
  await page.goto('/start')
  await expect(page).toHaveURL(/\/start\?q=3$/)
  await expect(heading(page)).toBeVisible()

  // An address past the question reached is brought back to it.
  await page.goto('/start?q=5')
  await expect(page).toHaveURL(/\/start\?q=3$/)
})

test('a draft saved before `reached` resumes at its first unanswered question', async ({
  page,
}) => {
  await withDraft(page, { email: '' })
  await page.goto('/start')
  await expect(page).toHaveURL(new RegExp(`/start\\?q=${String(numberOf('details'))}$`))
})

test("a refresh brings a sent brief back, in this tab's own words", async ({ page }) => {
  await seedOnce(page, [DETAILS_SEED, submittedSeed(SLUG)])
  const stub = await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(heading(page)).toHaveText('Sam, your designs are on their way.')
  await expect(page.locator('main#main')).toContainText(ANSWERED.email)
  await expect(page.getByText('Brief received', { exact: true })).toBeVisible()

  const before = stub.polls()
  await page.reload()
  await expect(page).toHaveURL(DONE_ADDRESS)
  await expect(heading(page)).toHaveText('Sam, your designs are on their way.')
  await expect.poll(() => stub.polls()).toBeGreaterThan(before)
})

test("a pasted done link restores from the poll alone, without anyone's words", async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(heading(page)).toHaveText('Your designs are on their way.')
  const main = page.locator('main#main')
  await expect(main).toContainText('We also email them to the address you gave when they are done.')
  await expect(designs(page).getByText('Being built', { exact: true })).toHaveCount(3)
  // A build on its way keeps the call as its next step: no new brief is offered.
  await expect(newBrief(page)).toHaveCount(0)
})

test('a build that failed offers a new brief', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'failed')])
  await expect(heading(page)).toHaveText('Something went wrong on our side.')
  await expect(newBrief(page)).toBeVisible()
})

test('a ready build restores ready from its first poll, title and all', async ({ page }) => {
  const stub = await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await expect(heading(page)).toHaveText('Your designs are ready.')
  expect(stub.polls()).toBe(1)
  await expect(page).toHaveTitle('Ready: your three designs | PinnaclePX')
})

test('one Back from done leaves /start, and Forward comes back to it', async ({ page }) => {
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  await withDraft(page, { reached: 4 })
  await page.goto('/')
  await page.goto('/start?q=1')
  for (const question of [2, 3]) {
    await page.getByRole('button', { name: /^Next/ }).click()
    await expect(page).toHaveURL(new RegExp(`/start\\?q=${String(question)}$`))
  }
  // The done state arrives in the page as a send brings it, in place of the third question, and
  // settles: its designs show once the poll has answered.
  await sendsTo(page, SLUG)
  await expect(designs(page)).toBeVisible()

  await page.goBack()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await page.goForward()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/start')
})

test('Forward from done to the new brief it opened stays in /start', async ({ page }) => {
  await seedOnce(page, [submittedSeed(SLUG)])
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  await page.goto('/')
  await page.goto('/start')
  await expect(page).toHaveURL(DONE_ADDRESS)
  await newBrief(page).click()
  await expect(page).toHaveURL(/\/start\?q=1$/)

  await page.goBack()
  await expect(page).toHaveURL(DONE_ADDRESS)
  await expect(designs(page)).toBeVisible()
  await page.goForward()
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.locator('main#main textarea')).toBeVisible()

  // One Back from done still leaves /start.
  await page.goBack()
  await expect(page).toHaveURL(DONE_ADDRESS)
  await expect(designs(page)).toBeVisible()
  await page.goBack()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
})

test("leaving done by the island's link gives the next page its own title", async ({ page }) => {
  await page.goto('/')
  const home = await page.title()
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(page).toHaveTitle('Building your designs | PinnaclePX')
  await page.getByRole('link', { name: 'Back to site' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await expect(page).toHaveTitle(home)
})

// The done view arrives in the page, as a send brings it, and the route's title gives way to it.
test('the poll carries on in a hidden tab, and the title turns at ready', async ({ page }) => {
  await page.clock.install()
  const stub = await interceptStatus(page, SLUG, [
    statusFor(SLUG, 'building'),
    statusFor(SLUG, 'building'),
    statusFor(SLUG, 'building'),
    statusFor(SLUG, 'ready'),
  ])
  await page.goto('/start')
  await expect(heading(page)).toBeVisible()
  await expect(page).toHaveTitle(questionTitle(QUESTION_IDS[0]))
  await page.evaluate((slug) => {
    window.history.pushState(null, '', `/start?q=done&s=${slug}`)
  }, SLUG)
  await expect(heading(page)).toHaveText('Your designs are on their way.')
  await expect(page).toHaveTitle('Building your designs | PinnaclePX')
  // The design list waits for the first answer, so the next ask is on the visible clock.
  await expect(designs(page)).toBeVisible()

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  // The ask already scheduled lands; after it a hidden tab asks on the slower clock.
  await page.clock.runFor(CONFIG.polling.statusMs)
  await expect.poll(() => stub.polls()).toBe(2)
  await page.clock.runFor(CONFIG.polling.statusMs)
  await page.waitForTimeout(500)
  expect(stub.polls()).toBe(2)
  await page.clock.runFor(CONFIG.start.wait.hiddenPollMs - CONFIG.polling.statusMs)
  await expect.poll(() => stub.polls()).toBe(3)
  await page.clock.runFor(CONFIG.start.wait.hiddenPollMs)
  await expect.poll(() => stub.polls()).toBe(4)
  await expect(page).toHaveTitle('Ready: your three designs | PinnaclePX')
})

test('a missing poll for a link this browser never kept says it was not found', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'missing')])
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
  await expect(page.getByText(EXPIRED)).toHaveCount(0)
})

test("a missing poll for this browser's own brief says it expired, and forgets it", async ({
  page,
}) => {
  await seedOnce(page, [DETAILS_SEED, submittedSeed(SLUG)])
  await openDone(page, SLUG, [statusFor(SLUG, 'missing')])
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.getByText(EXPIRED)).toBeVisible()
  expect(await readKey(page, 'local', SUBMITTED_KEY)).toBeNull()
  expect(await readKey(page, 'session', DONE_KEY)).toBeNull()
})

test('bare /start opens a live brief, and "Start a new brief" leaves only the day\'s count', async ({
  page,
}) => {
  await seedOnce(page, [submittedSeed(SLUG), sendsSeed([SLUG])])
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  await page.goto('/start')
  await expect(page).toHaveURL(DONE_ADDRESS)

  await newBrief(page).click()
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.locator('main#main textarea')).toHaveValue('')
  expect(await readKey(page, 'local', SUBMITTED_KEY)).toBeNull()
  expect(await readKey(page, 'local', SENDS_KEY)).toContain(SLUG)
})

test('three sends today say so in place of a new brief', async ({ page }) => {
  await seedOnce(page, [submittedSeed(SLUG), sendsSeed([SLUG, 'a2b3c4d5e6f7', 'g8h9j2k3m4n5'])])
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  await page.goto('/start')
  await expect(page.getByText('You can send three briefs a day.')).toBeVisible()
  await expect(newBrief(page)).toHaveCount(0)
})

test('a refresh during a send comes back to the last question and says so', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  await seedOnce(page, [
    { store: 'session', key: PENDING_KEY, value: { v: 1, startedAt: Date.now() } },
  ])
  await page.goto('/start?q=5')
  await expect(page.getByText(PENDING)).toBeVisible()

  // The send's done view has the page's one status line; the notice does not follow it there.
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  await sendsTo(page, SLUG)
  await expect(designs(page)).toBeVisible()
  await expect(page.getByText(PENDING)).toHaveCount(0)
  await expect(page.locator('main#main [role=status]')).toHaveCount(1)
})

test('the done view is its own chunk, and stands in with the page link when it fails', async ({
  page,
}) => {
  // The done view's chunk is the one that carries its call's analytics location
  // (scripts/bundle-budget.mjs); every other script passes.
  const isChunk = (url: URL) =>
    url.pathname.startsWith('/_next/static/chunks/') && url.pathname.endsWith('.js')
  const refuseDone = async (route: Route) => {
    const response = await route.fetch()
    const body = await response.text()
    if (body.includes('"brief-done"')) await route.abort()
    else await route.fulfill({ response, body })
  }
  await page.route(isChunk, refuseDone)
  // A one-design build, so the stand-in is seen to count as the done view does.
  await openDone(page, SLUG, [statusFor(SLUG, 'building', { conceptCount: 1 })])
  await expect(heading(page)).toHaveText('Your design is on its way.')
  await expect(heading(page)).toBeFocused()
  await expect(page.getByRole('link', { name: new RegExp(`/preview/${SLUG}`) })).toHaveAttribute(
    'href',
    `/preview/${SLUG}`,
  )
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  await expect(designs(page)).toHaveCount(0)

  await page.unroute(isChunk, refuseDone)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(designs(page)).toBeVisible()
})

test('a refreshed done state paints the ink before any script, never the first question', async ({
  page,
}) => {
  const refuseScripts = (route: Route) =>
    route.request().resourceType() === 'script' ? route.abort() : route.fallback()
  await page.route('**/*', refuseScripts)
  await page.goto(`/start?q=done&s=${SLUG}`)
  const main = page.locator('main#main')
  await expect(main).toHaveAttribute('data-theme', 'dark')
  await expect(main.locator('[data-skeleton-bars]')).toBeHidden()

  // The first question's skeleton is untouched, and so is a done link cut short, which opens it.
  for (const address of ['/start', '/start?q=done']) {
    await page.goto(address)
    await expect(main).not.toHaveAttribute('data-theme', 'dark')
    await expect(main.locator('[data-skeleton-bars]')).toBeVisible()
  }
})

test('a done link cut short opens the first question at its own address', async ({ page }) => {
  await page.goto('/start?q=done')
  await expect(page).toHaveURL(/\/start\?q=1$/)
  await expect(page.locator('main#main textarea')).toBeVisible()
})

test('the draft key keeps where the visitor reached', async ({ page }) => {
  await withDraft(page, { reached: 1 })
  await page.goto('/start?q=2')
  await page.getByRole('button', { name: /^Next/ }).click()
  await expect(page).toHaveURL(/\/start\?q=3$/)
  await expect
    .poll(async () => {
      const raw = await readKey(page, 'session', DRAFT_KEY)
      return raw === null ? null : (JSON.parse(raw) as { reached?: number }).reached
    })
    .toBe(2)
})
