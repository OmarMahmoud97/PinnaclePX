import { expect, test } from '@playwright/test'
import { DRAFT_KEY } from '@/lib/brief/draft'
import {
  ANSWERED,
  EDGE_NAMES,
  interceptStatus,
  openDone,
  PIXEL_PNG,
  refuseSends,
  statusFor,
  STUB_BLOB_ORIGIN,
  stubUploads,
  withDraft,
} from './helpers/start'

// The /start harness (e2e/helpers/start.ts) proved on the page as it stands, so a spec that leans
// on it fails for the page's reasons and never for the harness's. What the page does with a
// restored done state is the restore specs' to check; here only the plumbing is.

const SLUG = 'k7m2p9x4w3hd'
const SENTENCE = 'Bike repair shop in Leeds. Servicing, wheel builds and same-day puncture fixes.'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('only a GET to /start leaves the browser, and no call to the upload route', async ({
  page,
}) => {
  await page.goto('/start')
  // A bare POST carries no Server Action id, so even unguarded it could not send a brief; the
  // upload route counts a call before it reads one, so any call at all would write.
  const outcome = await page.evaluate(async () => {
    const attempt = (input: string, init?: RequestInit) =>
      fetch(input, init).then(
        () => 'sent',
        () => 'refused',
      )
    return {
      get: (await fetch('/start')).status,
      send: await attempt('/start', { method: 'POST', body: '{}' }),
      token: await attempt('/api/upload', { method: 'POST', body: '{}' }),
      lookup: await attempt('/api/upload?pathname=logos/pixel.png'),
    }
  })
  expect(outcome).toEqual({ get: 200, send: 'refused', token: 'refused', lookup: 'refused' })
})

test('the upload stub lands a picked file with neither our server nor Blob', async ({ page }) => {
  await stubUploads(page)
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await page.locator('main#main input[type="file"]').first().setInputFiles(PIXEL_PNG)
  // The draft keeps the address the put answered with, so the upload went all the way through.
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key) ?? '', DRAFT_KEY))
    .toContain(`"url":"${STUB_BLOB_ORIGIN}/`)
})

test('a draft with reached opens the question it allows, once per tab', async ({ page }) => {
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await expect(page).toHaveURL(/\/start\?q=3$/)
  await expect(page.locator('main#main h1')).toBeVisible()

  // The answers are the fixture's until the page saves its own, and from then on a reload reads
  // the page's save rather than the fixture again.
  await page.goto('/start?q=1')
  const sentence = page.locator('main#main textarea')
  await expect(sentence).toHaveValue(ANSWERED.description)
  await sentence.fill(SENTENCE)
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key) ?? '', DRAFT_KEY))
    .toContain(SENTENCE)
  await page.reload()
  await expect(sentence).toHaveValue(SENTENCE)
})

test('the status stub answers each poll in turn, uncached, and counts them', async ({ page }) => {
  const stub = await interceptStatus(page, SLUG, [
    statusFor(SLUG, 'building'),
    statusFor(SLUG, 'ready'),
  ])
  await page.goto('/start')
  const poll = () =>
    page.evaluate(async (slug) => {
      const response = await fetch(`/api/status/${slug}`)
      const body = (await response.json()) as { status: string }
      return { cache: response.headers.get('cache-control'), status: body.status }
    }, SLUG)
  expect(await poll()).toEqual({ cache: 'no-store', status: 'building' })
  expect(await poll()).toEqual({ cache: 'no-store', status: 'ready' })
  expect(await poll()).toEqual({ cache: 'no-store', status: 'ready' })
  expect(stub.polls()).toBe(3)
})

test('each status fixture is the status it names, as lib/preview/status.ts derives it', () => {
  for (const status of ['building', 'ready', 'partial', 'exhausted', 'failed'] as const) {
    expect(statusFor(SLUG, status).status).toBe(status)
  }
  const waiting = { ready: false, href: null }
  expect(statusFor(SLUG, 'building')).toMatchObject({
    status: 'building',
    slug: SLUG,
    conceptCount: 3,
    concepts: [waiting, waiting, waiting],
  })
  expect(statusFor(SLUG, 'ready', { conceptCount: 2 })).toMatchObject({
    status: 'ready',
    conceptCount: 2,
    concepts: [
      { templateId: 't01-aurora', ready: true, href: `/preview/${SLUG}/t01-aurora` },
      { templateId: 't02-monolith', ready: true, href: `/preview/${SLUG}/t02-monolith` },
    ],
  })
  expect(statusFor(SLUG, 'failed')).toMatchObject({ status: 'failed', concepts: [] })
  expect(statusFor(SLUG, 'missing')).toEqual({ status: 'missing' })

  const late = statusFor(SLUG, 'building', { deadlineInMs: -60_000 })
  expect(late.status === 'missing' ? Number.NaN : Date.parse(late.deadlineAt)).toBeLessThan(
    Date.now(),
  )
})

test('the done opener lands on the done address with the poll already stubbed', async ({
  page,
}) => {
  const navigations: string[] = []
  page.on('request', (request) => {
    if (request.isNavigationRequest()) navigations.push(request.url())
  })
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  expect(navigations[0]).toMatch(new RegExp(`/start\\?q=done&s=${SLUG}$`))
  const status = await page.evaluate(async (slug) => {
    const response = await fetch(`/api/status/${slug}`)
    return ((await response.json()) as { status: string }).status
  }, SLUG)
  expect(status).toBe('ready')
})

test('the edge names have the shapes the plan names', () => {
  const graphemes = (text: string) => [...new Intl.Segmenter('en').segment(text)].length
  expect(EDGE_NAMES.unbrokenCompany).toHaveLength(60)
  expect(EDGE_NAMES.unbrokenCompany).not.toMatch(/[\s-]/)
  expect(EDGE_NAMES.longestCompany).toHaveLength(80)
  expect(EDGE_NAMES.longestCompany.split(' ')).toHaveLength(14)
  expect(EDGE_NAMES.longEmail).toHaveLength(64)
  expect(EDGE_NAMES.longEmail).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/)
  expect(EDGE_NAMES.apostrophe).toMatch(/'s$/)
  expect(EDGE_NAMES.curlyApostrophe).toMatch(/’s$/)
  expect(EDGE_NAMES.capitals).toMatch(/^[A-Z]+S$/)
  expect(graphemes(EDGE_NAMES.whisperLongest)).toBe(24)
  expect(EDGE_NAMES.whisperLongest.length).toBeGreaterThan(24)
})
