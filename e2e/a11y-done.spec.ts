import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { DONE_KEY } from '@/app/start/_components/done-storage'
import type { SubmissionStatus } from '@/lib/brief/status'
import { ANSWERED, openDone, refuseSends, statusFor, stubPhotos } from './helpers/start'

// WCAG 2.2 AA on the done view (docs/start-page-journey-plan.md, 9 and 10; package P8), at the
// desktop, the phone and the tablet: every state of a build, in this tab's words and restored from
// a link, past its deadline, and under forced colours; the design links in the accessibility tree,
// one list of them, and one live region. Nothing here sends a brief.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

const SLUG = 'a11yk7m2p9x4'

type State = Readonly<{
  name: string
  status: SubmissionStatus['status']
  late?: boolean
  own?: boolean
}>

const STATES: readonly State[] = [
  { name: 'building, sent from this tab', status: 'building', own: true },
  { name: 'building, restored from a link', status: 'building' },
  { name: 'past the deadline', status: 'building', late: true },
  { name: 'ready', status: 'ready', own: true },
  { name: 'partial', status: 'partial' },
  { name: 'failed', status: 'failed' },
  { name: 'exhausted', status: 'exhausted' },
]

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

// axe reads colours as they are painted, so it scans a still page.
async function violations(page: Page, disabled: readonly string[] = []) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .disableRules([...disabled])
    .analyze()
  return results.violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map(
      ({ target, failureSummary }) => `${target.join(' ')}: ${failureSummary ?? ''}`,
    ),
  }))
}

async function open(page: Page, state: State): Promise<void> {
  if (state.own === true) {
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
          company: ANSWERED.company,
          email: ANSWERED.email,
          paletteLabel: 'Forest',
          styleLabel: 'Clean and minimal',
          photos: 0,
        }),
      },
    )
  }
  const answer = statusFor(SLUG, state.status, state.late === true ? { deadlineInMs: -60_000 } : {})
  await openDone(page, SLUG, [answer])
  await expect(page.locator('main#main h1')).toBeFocused()
  await expect(page.locator('main#main [role="status"]')).toHaveCount(1)
}

for (const state of STATES) {
  test(`${state.name} has no violations`, async ({ page }) => {
    await open(page, state)
    expect(await violations(page)).toEqual([])
  })
}

// Forced colours paint every word and ground in the system's pair; Chromium still reports each
// word's authored fill to axe, so contrast is checked in the page's own colours above.
test('forced colours have no violations, and the designs and the ring keep their edges', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await open(page, { name: 'building', status: 'building' })
  expect(await violations(page, ['color-contrast'])).toEqual([])
  await expect(page.locator('.design-item:visible').first()).toHaveCSS('border-top-style', 'solid')
  await expect(page.locator('.send-bloom')).toHaveCount(0)
})

test('the design links are in the accessibility tree, one list of them, and one live region', async ({
  page,
}) => {
  await open(page, { name: 'ready', status: 'ready' })
  const links = page.getByRole('list', { name: 'Your designs' }).getByRole('link')
  await expect(links).toHaveCount(3)
  for (const link of await links.all()) {
    expect(await link.evaluate((node) => node.closest('[aria-hidden="true"]'))).toBeNull()
  }
  await expect(page.locator('.design-list:visible')).toHaveCount(1)
  await expect(page.locator('main#main [role="status"], main#main [aria-live]')).toHaveCount(1)
})

// Where Tab goes from the heading at ready (plan 9.1): the ask, then, below lg, the page link and
// Share, the design rows and the call, in the column's order; from lg the call, then the region's
// three posters and the page card under them, since the region follows main in the DOM and the
// card is drawn there (brief-done-polish.spec.ts). Each stop named by its part, until the focus
// leaves the two landmarks (for the body, or the dev server's own overlay).
const LG = 1024

test('the tab order at ready follows the plan at this width', async ({ page }) => {
  await open(page, { name: 'ready', status: 'ready', own: true })
  const stops: string[] = []
  for (let count = 0; count < 8; count += 1) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const focused = document.activeElement
      if (focused === null) return null
      if (focused.closest('main#main, .start-region') === null) return null
      if (focused.matches('.start-done-ask')) return 'ask'
      if (focused.matches('.done-aside a')) return 'call'
      if (focused.matches('.design-item')) return 'design'
      if (focused.matches('.done-page a')) return 'page'
      if (focused.matches('.done-page button')) return 'share'
      return focused.tagName
    })
    if (stop === null) break
    stops.push(stop)
  }
  const desk = (page.viewportSize()?.width ?? 0) >= LG
  expect(stops).toEqual(
    desk
      ? ['ask', 'call', 'design', 'design', 'design', 'page', 'share']
      : ['ask', 'page', 'share', 'design', 'design', 'design', 'call'],
  )
})
