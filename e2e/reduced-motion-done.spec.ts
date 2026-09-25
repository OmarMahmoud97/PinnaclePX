import { expect, type Page, test } from '@playwright/test'
import { SEND_FAILED } from '@/app/start/_components/start-copy'
import { CONFIG } from '@/lib/config'
import {
  interceptStatus,
  openDone,
  refuseSends,
  statusFor,
  stubPhotos,
  withDraft,
} from './helpers/start'

// The send and the done view under reduced motion (docs/start-page-journey-plan.md, 6.2 and 9.5;
// package P8): only colour and opacity move. The ink fades to its hold rather than blooming and
// fills rather than running on, the posters and the log's lines fade in without travelling, and
// the ring's arc jumps. Nothing here sends a brief: the send's request is refused before it
// leaves the browser, or answered in it.

const SLUG = 'rdonk7m2p9x4'

// Motion properties an animation must never carry here.
const MOVING = ['translate', 'rotate', 'scale', 'transform', 'clipPath', 'clip-path']

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

// The properties every animation of a selector's elements changes.
function animated(page: Page, selector: string) {
  return page.evaluate((selector) => {
    const properties = new Set<string>()
    for (const element of document.querySelectorAll(selector)) {
      for (const animation of element.getAnimations({ subtree: true })) {
        const effect = animation.effect
        if (!(effect instanceof KeyframeEffect)) continue
        for (const frame of effect.getKeyframes()) {
          for (const key of Object.keys(frame)) {
            if (!['offset', 'computedOffset', 'easing', 'composite'].includes(key)) {
              properties.add(key)
            }
          }
        }
      }
    }
    return [...properties]
  }, selector)
}

test('the ink fades to its hold by its colour, and drains the same way', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
  const bloom = page.locator('.send-bloom')
  await expect(bloom).toHaveAttribute('data-phase', 'hold')
  const moved = await animated(page, '.send-bloom')
  expect(moved.length).toBeGreaterThan(0)
  expect(moved.filter((property) => MOVING.includes(property))).toEqual([])
  await expect(page.getByText(SEND_FAILED)).toBeVisible({ timeout: 10_000 })
  await expect(bloom).toHaveCount(0)
})

test('a send the server took fills the page with its ink by colour', async ({ page }) => {
  await interceptStatus(page, SLUG, [statusFor(SLUG, 'building')])
  // The submission, answered in the browser as the Server Action replies, so nothing is sent.
  const deadlineAt = new Date(Date.now() + CONFIG.deadline.totalMs).toISOString()
  const reply = { a: { ok: true, value: { slug: SLUG, deadlineAt, conceptCount: 3 } }, f: '' }
  await page.route(
    (url) => url.pathname === '/start',
    (route) =>
      route.request().method() === 'GET'
        ? route.fallback()
        : route.fulfill({ contentType: 'text/x-component', body: `0:${JSON.stringify(reply)}\n` }),
  )
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(page.locator('main#main h1')).toHaveText('Where should we send them?')
  // What the ink's run-on animates, read as the done view starts waiting under it.
  await page.evaluate(() => {
    const flow = document.querySelector('.start-flow')
    if (flow === null) return
    const observer = new MutationObserver(() => {
      if (!flow.hasAttribute('data-arriving')) return
      observer.disconnect()
      const properties = new Set<string>()
      for (const animation of document.querySelector('.send-bloom')?.getAnimations() ?? []) {
        if (!(animation.effect instanceof KeyframeEffect)) continue
        for (const frame of animation.effect.getKeyframes()) {
          for (const key of Object.keys(frame)) properties.add(key)
        }
      }
      Object.assign(window, { runOn: [...properties] })
    })
    observer.observe(flow, { attributes: true, attributeFilter: ['data-arriving'] })
  })
  await page.getByRole('button', { name: 'Show me my three designs' }).click()
  await expect(page).toHaveURL(new RegExp(`\\?q=done&s=${SLUG}$`), { timeout: 10_000 })
  await expect(page.locator('.send-bloom')).toHaveCount(0)
  const runOn = await page.evaluate(() => (window as unknown as { runOn?: string[] }).runOn ?? [])
  expect(runOn).toContain('backgroundColor')
  expect(runOn.filter((property) => MOVING.includes(property))).toEqual([])
})

test('the posters and the log fade in where they stand, and the ring holds its arc still', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  await expect(page.getByRole('list', { name: 'Your designs' })).toBeVisible()
  // The designs' items and the page card split and rise with the posters from lg, the strip's
  // posters on a phone, so all of them are read.
  const moved = await animated(
    page,
    '.design-list li, .done-poster, .done-page, .done-log li, .done-view',
  )
  expect(moved.filter((property) => MOVING.includes(property))).toEqual([])
  await expect(page.locator('.stage-ring-arc')).not.toHaveCSS(
    'transition-property',
    /stroke-dashoffset/,
  )
})

test('ready rises to light by colour and opacity alone', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  await expect(page.locator('.start-flow')).toHaveAttribute('data-lit', '')
  const moved = await animated(page, 'main#main, .start-region, .start-flow')
  expect(moved.filter((property) => MOVING.includes(property))).toEqual([])
  await expect(page.locator('main#main h1')).toHaveText('Your designs are ready.')
})
