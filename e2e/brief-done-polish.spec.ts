import { expect, type Locator, type Page, type Route, test } from '@playwright/test'
import { DRAFT_CAPTION } from '@/app/start/_components/draft-copy'
import { SENDING } from '@/app/start/_components/start-copy'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import {
  answerSend,
  interceptStatus,
  openDone,
  refuseSends,
  statusFor,
  stubPhotos,
  withDraft,
} from './helpers/start'

// The send and done side fitted to every desk (docs/start-page-journey-plan.md, 4.4, 4.8 and 4.9;
// the visual QA of 25 September 2026): the posters' captions keep the site's own words whole and
// end at one height; the send hold leaves nothing of the question on the ink but the ask; a done
// view opened from a link lights its region with the build's colour and draws no draft; the page
// card sits under the posters, shown once; and the lamp keeps its area while the region has no
// posters to light, through an arrival and over a build that ended without designs. Nothing here
// sends a brief: the send's request is held in the browser and never answered, continued or
// aborted, or answered inside the browser as answerSend does.

const SLUG = 'plshk7m2p9x4'

// The laptop the QA found syllables on, the smallest desk, and the mockup's own screen.
const DESKS = [
  { width: 1024, height: 768 },
  { width: 1366, height: 657 },
  { width: 1440, height: 900 },
] as const

// The build's fill in the fixtures (lib/preview/example.ts), which the region must take.
const FOREST = '#2f6f4e'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function region(page: Page) {
  return page.getByRole('region', { name: 'Your brief so far' })
}

function posters(page: Page) {
  return region(page).locator('.design-list')
}

function stage(page: Page) {
  return region(page).locator('.start-stage')
}

// The lamp's layer, drawn behind the stage at a share of its box: no box, no lamp.
function lampHeight(page: Page) {
  return stage(page).evaluate((node) => parseFloat(getComputedStyle(node, '::before').height))
}

// This tab's own send, answered inside the browser (never on the server) with a submission whose
// poll the caller has already routed: the send question opened from a full draft and its ask
// pressed, until the address is the done view's.
async function sendOwn(page: Page): Promise<void> {
  const deadlineAt = new Date(Date.now() + CONFIG.deadline.totalMs).toISOString()
  await answerSend(page, { ok: true, value: { slug: SLUG, deadlineAt, conceptCount: 3 } })
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(heading(page)).toHaveText('Where should we send them?')
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
  await expect(page).toHaveURL(new RegExp(`\\?q=done&s=${SLUG}$`), { timeout: 10_000 })
}

// Answers the status poll from `answer`, but only once the test lets it, so the done view's
// region can be seen before its posters are drawn, as it is while a real answer is on its way:
// each poll is held in the browser until the release, which answers the held ones and every one
// after. Nothing reaches the server.
async function gateStatus(page: Page, answer: SubmissionStatus): Promise<() => Promise<void>> {
  const held: Route[] = []
  let open = false
  const answerPoll = (route: Route) =>
    route.fulfill({ json: answer, headers: { 'cache-control': 'no-store' } })
  await page.route(
    (url) => url.pathname === `/api/status/${SLUG}`,
    (route) => {
      if (route.request().method() !== 'GET') return route.abort()
      if (open) return answerPoll(route)
      held.push(route)
      return undefined
    },
  )
  return async () => {
    open = true
    for (const route of held.splice(0)) await answerPoll(route)
  }
}

async function settled(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('nothing to measure')
  return found
}

// Every word in the captions that is set over more than one line: a word broken inside itself.
function brokenWords(captions: Locator) {
  return captions.evaluateAll((nodes) => {
    const broken: string[] = []
    for (const caption of nodes) {
      const walker = document.createTreeWalker(caption, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
        const text = node.textContent ?? ''
        for (const match of text.matchAll(/\S+/g)) {
          const range = document.createRange()
          range.setStart(node, match.index)
          range.setEnd(node, match.index + match[0].length)
          const lines = [...range.getClientRects()].filter((rect) => rect.width > 0)
          if (lines.length > 1) broken.push(match[0])
        }
      }
    }
    return broken
  })
}

for (const desk of DESKS) {
  test.describe(`at ${String(desk.width)} by ${String(desk.height)}`, () => {
    test.use({ viewport: desk })

    test('the posters’ captions keep every word whole and end at one height', async ({ page }) => {
      for (const state of ['building', 'ready'] as const) {
        await openDone(page, SLUG, [statusFor(SLUG, state)])
        await expect(posters(page)).toBeVisible()
        await settled(page)
        const captions = posters(page).locator('.design-caption')
        await expect(captions).toHaveCount(3)
        expect(await brokenWords(captions), state).toEqual([])
        const boxes = await Promise.all((await captions.all()).map(box))
        const [first] = boxes
        if (first === undefined) throw new Error('no caption')
        for (const caption of boxes) {
          expect(caption.y, state).toBe(first.y)
          expect(caption.height, state).toBe(first.height)
        }
      }
    })

    test('the send hold leaves nothing of the question on the ink but the ask', async ({
      page,
    }) => {
      // The clock is the test's, so the floor the send waits out (CONFIG.form.minMs) passes when
      // it is run forward and the request is issued inside the test, where it is held: never
      // answered, continued or aborted, so it never leaves the browser (the pattern
      // brief-done.spec.ts uses for the timeout). The hold stays until the context closes; no
      // unroute, which would leave a late request with no route.
      await page.clock.install()
      let held = 0
      await page.route(
        (url) => url.pathname === '/start',
        (route) => {
          if (route.request().method() === 'GET') return route.fallback()
          held += 1
          return undefined
        },
      )
      await withDraft(page, { reached: 4 })
      await page.goto('/start?q=5')
      await expect(heading(page)).toHaveText('Where should we send them?')
      await page.getByRole('button', { name: 'Show me my three designs' }).click()
      await expect(page.locator('.send-bloom')).toHaveAttribute('data-phase', 'hold')
      await page.clock.runFor(CONFIG.form.minMs)
      await expect.poll(() => held).toBe(1)
      const ask = page.locator('.start-ask button[type="submit"]')
      await expect(ask).toHaveText(SENDING.ask)
      await expect(ask).toBeFocused()
      await expect(ask).toHaveCSS('opacity', '1')
      for (const part of ['h1', '.start-helper', '[data-part="controls"]']) {
        await expect(page.locator(`main#main ${part}`), part).toHaveCSS('opacity', '0')
      }
      await expect(page.locator('main#main .start-card')).toHaveCSS(
        'background-color',
        'rgba(0, 0, 0, 0)',
      )
      expect(held).toBe(1)
    })
  })
}

test('a done view opened from a link lights its region with the build’s colour and draws no draft', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(posters(page)).toBeVisible()
  const region = page.getByRole('region', { name: 'Your brief so far' })
  await expect(region).toHaveAttribute('data-restored', '')
  await expect(region).toHaveAttribute('data-coloured', '')
  await expect(region).toHaveCSS('--draft-hex', FOREST)
  await expect(region.locator('.draft').first()).toHaveCSS('opacity', '0')
  // The posters carry the same fill.
  await expect(posters(page).locator('.design-poster').first()).toHaveCSS('--poster-fill', FOREST)
})

test('at a desk the page card sits under the posters, level with the heading, and is shown once', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(posters(page)).toBeVisible()
  await settled(page)
  const cards = page.locator('.done-page')
  await expect(cards).toHaveCount(2)
  await expect(page.locator('.done-page:visible')).toHaveCount(1)
  const region = page.getByRole('region', { name: 'Your brief so far' })
  const card = region.locator('.done-page')
  await expect(card).toBeVisible()
  await expect(card.getByRole('button', { name: 'Share this page' })).toBeVisible()
  const [title, poster, page1] = await Promise.all([
    box(heading(page)),
    box(posters(page).locator('.done-poster').first()),
    box(card),
  ])
  expect(Math.abs(poster.y - title.y)).toBeLessThanOrEqual(6)
  expect(page1.y).toBeGreaterThan(poster.y + poster.height)
  // The ring and the log are in the first screen without the card in the column.
  await expect(page.locator('.stage-ring')).toBeInViewport({ ratio: 1 })
  await expect(page.locator('.done-log li').nth(3)).toBeInViewport({ ratio: 1 })
})

test('the log’s marks sit level with their stamps, on wrapped lines too, and every line’s words share one edge', async ({
  page,
}) => {
  // The building example's copy stage is still running, so its line has no stamp (plan 9.2).
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(posters(page)).toBeVisible()
  await settled(page)
  const lines = page.locator('.done-log li:has(.done-log-stamp)')
  for (const line of await lines.all()) {
    const [mark, stamp] = await Promise.all([
      box(line.locator('.done-log-mark')),
      box(line.locator('.done-log-stamp')),
    ])
    expect(Math.abs(mark.y - stamp.y)).toBeLessThanOrEqual(2)
  }
  await expect(page.locator('.done-log li[data-running]')).toHaveCount(1)
  const edges = await page
    .locator('.done-log-words')
    .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().x)))
  expect(new Set(edges).size).toBe(1)
})

// The region while it has no posters to light (plan 4.9 and 5.5): the stage keeps the draft's
// height, so the lamp has its area, rather than collapsing with an empty slot.

test('the lamp holds through an arrival while the poll’s first answer is on its way', async ({
  page,
}) => {
  const release = await gateStatus(page, statusFor(SLUG, 'building'))
  await sendOwn(page)
  const slot = region(page).locator('.done-slot')
  await expect(slot).toBeEmpty()
  const [draft, held] = await Promise.all([box(region(page).locator('.draft')), box(stage(page))])
  expect(held.height).toBeCloseTo(draft.height, 0)
  expect(await lampHeight(page)).toBeGreaterThan(0)
  // The caption waits under the frame until the posters take its place.
  const caption = region(page).getByText(DRAFT_CAPTION.done)
  await expect(caption).toBeVisible()
  expect((await box(caption)).y).toBeGreaterThanOrEqual(draft.y + draft.height)
  await release()
  await expect(posters(page)).toBeVisible()
  await settled(page)
  // With the posters drawn the stage takes the slot's box, so the lamp centres on them.
  const [taken, filled] = await Promise.all([box(stage(page)), box(slot)])
  expect(Math.abs(taken.y - filled.y)).toBeLessThanOrEqual(1)
  expect(Math.abs(taken.height - filled.height)).toBeLessThanOrEqual(1)
  expect(await lampHeight(page)).toBeGreaterThan(0)
})

test('this tab’s own send that ended without designs keeps its sealed draft under the caption, lit', async ({
  page,
}) => {
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'failed')])
  await sendOwn(page)
  await expect(page.locator('.start-flow')).toHaveAttribute('data-dim', '')
  await expect(heading(page)).toBeFocused()
  await expect(region(page).locator('.done-slot')).toBeEmpty()
  const draft = region(page).locator('.draft')
  await expect(draft).toHaveCSS('opacity', '1')
  const caption = region(page).getByText(DRAFT_CAPTION.stopped)
  await expect(caption).toBeVisible()
  const [frame, words, held] = await Promise.all([box(draft), box(caption), box(stage(page))])
  expect(words.y).toBeGreaterThanOrEqual(frame.y + frame.height)
  expect(held.height).toBeCloseTo(frame.height, 0)
  expect(await lampHeight(page)).toBeGreaterThan(0)
})

test('a build that ended without designs, opened from a link, keeps the dimmed lamp and draws no draft or caption', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'failed')])
  await expect(page.locator('.start-flow')).toHaveAttribute('data-dim', '')
  await expect(heading(page)).toBeFocused()
  await expect(region(page)).toHaveAttribute('data-restored', '')
  const draft = region(page).locator('.draft')
  await expect(draft).toHaveCSS('opacity', '0')
  await expect(region(page).getByText(DRAFT_CAPTION.stopped)).toHaveCount(0)
  await expect(region(page).getByText(DRAFT_CAPTION.done)).toHaveCount(0)
  const [frame, held] = await Promise.all([box(draft), box(stage(page))])
  expect(held.height).toBeCloseTo(frame.height, 0)
  expect(await lampHeight(page)).toBeGreaterThan(0)
})
