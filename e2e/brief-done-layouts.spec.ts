import { expect, type Locator, type Page, test } from '@playwright/test'
import type { StatusView } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import { layoutOf } from '@/lib/preview/descriptors'
import { EXAMPLE_SLUG, type Stages } from '@/lib/preview/example'
import { READY_TEMPLATES } from '@/templates/registry'
import { interceptStatus, openDone, refuseSends, statusFor, stubPhotos } from './helpers/start'

// The posters' silhouettes (docs/start-page-journey-plan.md, 4.9; ADR 0037): from the moment the
// select stage names a design's template, its poster is drawn in that template's own layout, so
// the three layouts the log says were chosen can be told apart; before then every poster is the
// plain page; at ready the headline and the photo land inside the same layout; and nothing a
// layout draws runs past its poster. The designs page draws the same. Nothing here sends a brief.

const SLUG = 'layok7m2p9x4'

// A build before its select stage has settled: no template named, every stage still open.
const UNCHOSEN: Partial<Stages> = {
  templateIds: null,
  stageSelect: 'running',
  stageTokens: 'pending',
  stageBrief: 'pending',
  stageCopy: 'pending',
  stageImagery: 'pending',
}

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

// The posters a desk shows: the region's list, the one displayed from lg.
function posters(page: Page) {
  return page.locator(".design-list[data-variant='posters'] .design-poster")
}

// The layout each of a poll's designs is to be drawn in.
function layoutsOf(view: StatusView): readonly (string | null)[] {
  return view.status === 'missing'
    ? []
    : view.concepts.map((concept) => layoutOf(concept.templateId))
}

// The layout each poster is drawn in, in order; null for the plain page.
function drawn(posters: Locator): Promise<(string | null)[]> {
  return posters.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-layout')))
}

// Every entrance played, so the posters stand still.
async function settled(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

// Nothing a layout draws runs past its poster's edge.
async function expectNothingSpills(posters: Locator): Promise<void> {
  const spills = await posters.evaluateAll((nodes) =>
    nodes
      .filter(
        (node) => node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight,
      )
      .map((node) => node.getAttribute('data-layout')),
  )
  expect(spills).toEqual([])
}

test('before the select stage has chosen, every poster is the plain page', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building', { stages: UNCHOSEN })])
  await expect(posters(page)).toHaveCount(3)
  expect(await drawn(posters(page))).toEqual([null, null, null])
  await settled(page)
  await expectNothingSpills(posters(page))
})

test('from the select stage on, each poster carries its template’s layout, three different ones, and keeps it at ready', async ({
  page,
}) => {
  await page.clock.install()
  const chosen = statusFor(SLUG, 'building')
  await openDone(page, SLUG, [
    statusFor(SLUG, 'building', { stages: UNCHOSEN }),
    chosen,
    statusFor(SLUG, 'ready'),
  ])
  await expect(posters(page)).toHaveCount(3)
  expect(await drawn(posters(page))).toEqual([null, null, null])

  // The next poll names the templates: the layouts land with the log's line, and nothing else.
  await page.clock.runFor(CONFIG.polling.statusMs)
  await expect(page.locator('.done-log')).toContainText('Three layouts chosen')
  const layouts = layoutsOf(chosen)
  expect(new Set(layouts).size).toBe(3)
  await expect.poll(() => drawn(posters(page))).toEqual(layouts)
  await expect(posters(page).locator('.design-poster-headline')).toHaveCount(0)
  await expect(posters(page).locator('img')).toHaveCount(0)
  await settled(page)
  await expectNothingSpills(posters(page))

  // At ready the headline and the photo take their places inside the same layout.
  await page.clock.runFor(CONFIG.polling.statusMs)
  await expect(posters(page).locator('.design-poster-headline')).toHaveCount(3)
  await expect(posters(page).locator('img')).toHaveCount(3)
  expect(await drawn(posters(page))).toEqual(layouts)
  for (const poster of await posters(page).all()) {
    await expect(poster.locator('.design-poster-headline')).toBeVisible()
  }
  await settled(page)
  await expectNothingSpills(posters(page))
})

// Every ready template, three to a build, so each layout is seen with its headline and its photo
// inside it.
const IDS = READY_TEMPLATES.map((template) => template.id)
const SETS = [IDS.slice(0, 3), IDS.slice(3, 6), IDS.slice(6, 9)].filter((ids) => ids.length > 0)

for (const ids of SETS) {
  test(`at ready, ${ids.join(', ')} keep their layouts with the headline and the photo inside`, async ({
    page,
  }) => {
    const conceptCount = ids.length as 1 | 2 | 3
    const view = statusFor(SLUG, 'ready', { conceptCount, stages: { templateIds: ids } })
    await openDone(page, SLUG, [view])
    await expect(posters(page)).toHaveCount(conceptCount)
    expect(await drawn(posters(page))).toEqual(ids.map((id) => layoutOf(id)))
    for (const poster of await posters(page).all()) {
      await expect(poster).toHaveAttribute('data-layout', /./)
      await expect(poster.locator('.design-poster-headline')).toBeVisible()
      await expect(poster.locator('img')).toHaveCount(1)
    }
    await settled(page)
    await expectNothingSpills(posters(page))
  })
}

test('the designs page draws each poster in its layout too', async ({ page }) => {
  const view = statusFor(EXAMPLE_SLUG, 'building')
  await interceptStatus(page, EXAMPLE_SLUG, [view])
  await page.goto('/examples/hub?state=building')
  const hub = page.locator('.hub-designs .design-poster')
  await expect(hub).toHaveCount(3)
  expect(await drawn(hub)).toEqual(layoutsOf(view))
  await expectNothingSpills(hub)
})
