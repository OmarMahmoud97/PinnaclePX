import { expect, type Page, type Request, test } from '@playwright/test'
import { PARTIAL_NOTES, SHARE_WORDS, usuallyDoneBy } from '@/app/start/_components/done-copy'
import { SLOT_LINES } from '@/app/start/_components/done-lines'
import type { FoundView } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import { EXAMPLE_SLUG } from '@/lib/preview/example'
import { interceptStatus, refuseSends, statusFor, stubPhotos } from './helpers/start'

// The designs page (docs/start-page-journey-plan.md, 8.2 and 8.4; package P7): the server draws it
// from the build's view, showing a headline or a photo only once its stage has settled; the page
// asks the status poll and has the server draw it again when the build moves on; it opens every
// design once it can, draws no rule, and shares its own address. The real page reads its row from
// the database, which no spec may reach, so these walk the same page drawing the example build
// (app/examples/hub/page.tsx) in the state its address names, with its poll answered here. The
// real route is visited only for a slug that names nothing.

const HUB = '/examples/hub'

// The example's deadline is 14:32 on a winter's day, when London keeps UTC.
test.use({ timezoneId: 'Europe/London' })

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  await stubPhotos(page)
})

// The example in a state, its poll answered with the same state, so the page has nothing to follow.
async function open(page: Page, state: FoundView['status']): Promise<void> {
  await interceptStatus(page, EXAMPLE_SLUG, [statusFor(EXAMPLE_SLUG, state)])
  await page.goto(`${HUB}?state=${state}`)
}

function designs(page: Page) {
  return page.getByRole('list', { name: 'Your designs' })
}

function status(page: Page) {
  return page.locator('.hub').getByRole('status')
}

// The request by which the page has the server draw it again (router.refresh).
function isRedraw(request: Request): boolean {
  return new URL(request.url()).pathname === HUB && request.headers().rsc === '1'
}

test('while building, the designs wait with the time, and nothing half-made shows', async ({
  page,
}) => {
  await open(page, 'building')
  await expect(page.locator('main#main h1')).toHaveText('Kestrel, your designs.')
  await expect(designs(page).getByRole('listitem')).toHaveCount(3)
  await expect(designs(page).getByRole('link')).toHaveCount(0)
  await expect(designs(page).getByText(SLOT_LINES.beingBuilt)).toHaveCount(3)
  await expect(page.getByText(usuallyDoneBy('14:32'))).toBeVisible()
  // The fill has come with the tokens; the headlines and pictures, still running, have not.
  const posters = page.locator('.design-poster')
  await expect(posters.first()).toHaveCSS('--poster-fill', '#2f6f4e')
  await expect(posters.locator('.design-poster-headline')).toHaveCount(0)
  await expect(posters.locator('img')).toHaveCount(0)
  await expect(status(page)).toHaveText('')
})

test('once built, every design opens in a new tab with its headline and photo', async ({
  page,
}) => {
  await open(page, 'ready')
  const links = designs(page).getByRole('link')
  await expect(links).toHaveCount(3)
  const first = links.first()
  await expect(first).toHaveAccessibleName('Open design one: Glowing centre (opens in a new tab)')
  await expect(first).toHaveAttribute('href', `/preview/${EXAMPLE_SLUG}/t01-aurora`)
  await expect(first).toHaveAttribute('target', '_blank')
  const posters = page.locator('.design-poster')
  await expect(posters.locator('.design-poster-headline')).toHaveCount(3)
  await expect(posters.locator('img')).toHaveCount(3)
  await expect(page.getByText(/^Usually done by/)).toHaveCount(0)
  // What the status line would say had the build turned ready while the page was open.
  await expect(status(page)).toHaveText('Your designs are ready.')
  await expect(status(page)).toHaveClass('sr-only')
})

test('the page follows the poll, and has the server draw it again once the build moves on', async ({
  page,
}) => {
  const redraws: string[] = []
  page.on('request', (request) => {
    if (isRedraw(request)) redraws.push(request.url())
  })
  const stub = await interceptStatus(page, EXAMPLE_SLUG, [
    statusFor(EXAMPLE_SLUG, 'building'),
    statusFor(EXAMPLE_SLUG, 'building', { stages: { stageCopy: 'done' } }),
  ])
  await page.goto(HUB)
  await expect(designs(page).getByRole('listitem')).toHaveCount(3)
  // The first answer draws the page as it stands: no redraw.
  await expect.poll(() => stub.polls(), { timeout: CONFIG.polling.statusMs + 5_000 }).toBe(1)
  expect(redraws).toEqual([])
  // The second brings the headlines, and the page asks for itself again, once.
  await page.waitForRequest(isRedraw, { timeout: CONFIG.polling.statusMs + 5_000 })
  await expect.poll(() => stub.polls(), { timeout: CONFIG.polling.statusMs + 5_000 }).toBe(3)
  expect(redraws).toHaveLength(1)
})

test('past the deadline, the time gives way to the delay line', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2099-01-01T14:40:00Z'))
  await open(page, 'building')
  await expect(page.getByText(SLOT_LINES.timeUp)).toBeVisible()
  await expect(page.getByText(/^Usually done by/)).toHaveCount(0)
})

test('a partial build opens every design and says what was set simply', async ({ page }) => {
  await open(page, 'partial')
  await expect(designs(page).getByRole('link')).toHaveCount(3)
  await expect(page.getByText(PARTIAL_NOTES.photos)).toBeVisible()
  await expect(page.getByText(PARTIAL_NOTES.headlines)).toHaveCount(0)
})

test('a failed or exhausted build keeps its words and leads to the call', async ({ page }) => {
  await open(page, 'failed')
  const main = page.locator('main#main')
  await expect(main.locator('h1')).toHaveText('We could not finish these designs.')
  await expect(main.getByRole('link', { name: /^Book a 20-minute call/ })).toBeVisible()
  await expect(designs(page)).toHaveCount(0)

  await open(page, 'exhausted')
  await expect(main.locator('h1')).toHaveText(
    'Every design we have has been shown to this address.',
  )
})

// The owner's rule: no hairlines. Every separation on the page is a ground or air.
test('no rule is drawn anywhere on the page', async ({ page }) => {
  for (const state of ['building', 'ready'] as const) {
    await open(page, state)
    await expect(designs(page).getByRole('listitem')).toHaveCount(3)
    const ruled = await page.locator('.hub').evaluate((hub) =>
      [hub, ...hub.querySelectorAll('*')].flatMap((element) => {
        const style = getComputedStyle(element)
        const drawn = ['top', 'right', 'bottom', 'left'].some(
          (side) =>
            parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
            style.getPropertyValue(`border-${side}-style`) !== 'none' &&
            style.getPropertyValue(`border-${side}-color`) !== 'rgba(0, 0, 0, 0)',
        )
        return drawn || element.tagName === 'HR' ? [element.outerHTML.slice(0, 80)] : []
      }),
    )
    expect(ruled, state).toEqual([])
  }
})

test('sharing copies the address where there is no share sheet, and says so', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    Reflect.deleteProperty(Navigator.prototype, 'share')
    Reflect.deleteProperty(Navigator.prototype, 'canShare')
  })
  await open(page, 'building')
  await page.getByRole('button', { name: SHARE_WORDS.share }).click()
  await expect(status(page)).toHaveText(SHARE_WORDS.copied)
  await expect(status(page)).not.toHaveClass('sr-only')
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toBe(new URL(`/preview/${EXAMPLE_SLUG}`, page.url()).toString())
})

test('sharing hands the address to the share sheet where there is one', async ({ page }) => {
  await page.addInitScript(() => {
    const shared: ShareData[] = []
    Object.assign(window, { shared })
    Object.defineProperty(Navigator.prototype, 'canShare', { value: () => true })
    Object.defineProperty(Navigator.prototype, 'share', {
      value: (data: ShareData) => {
        shared.push(data)
        return Promise.resolve()
      },
    })
  })
  await open(page, 'building')
  await page.getByRole('button', { name: SHARE_WORDS.share }).click()
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { shared: ShareData[] }).shared))
    .toEqual([{ url: new URL(`/preview/${EXAMPLE_SLUG}`, page.url()).toString() }])
  await expect(status(page)).toHaveText('')
})

// Each custom event the page sends, caught before the analytics script could send it. The script
// itself is refused, so the stand-in keeps the queue.
async function catchEvents(page: Page): Promise<() => Promise<unknown[]>> {
  await page.route(/va\.vercel-scripts\.com|\/_vercel\/insights\//, (route) => route.abort())
  await page.addInitScript(() => {
    const events: unknown[] = []
    Object.assign(window, {
      events,
      va: (kind: string, payload: unknown) => {
        if (kind === 'event') events.push(payload)
      },
    })
  })
  return () => page.evaluate(() => (window as unknown as { events: unknown[] }).events)
}

test('opening a design says whether the visitor came from the email', async ({ page }) => {
  const events = await catchEvents(page)
  for (const [query, from] of [
    ['state=ready', 'hub'],
    ['state=ready&utm_source=email', 'email'],
  ] as const) {
    await page.goto(`${HUB}?${query}`)
    const opened = page.context().waitForEvent('page')
    await designs(page).getByRole('link').first().click()
    await (await opened).close()
    expect(await events()).toContainEqual({
      name: 'design_open',
      data: { template: 't01-aurora', from },
    })
  }
})

// The example ships with the site, so a link to it must not be able to put its own words under the
// brand: the address only picks among the example's names.
test('the example draws no text from its address', async ({ page }) => {
  await interceptStatus(page, EXAMPLE_SLUG, [statusFor(EXAMPLE_SLUG, 'building')])
  const words = 'Your account is locked. Call 0800 000 000'
  await page.goto(`${HUB}?company=${encodeURIComponent(words)}&name=${encodeURIComponent(words)}`)
  await expect(page.locator('main#main h1')).toHaveText('Kestrel, your designs.')
  await expect(page.getByText(words)).toHaveCount(0)
})

test('the real page answers a link that names no submission as not found', async ({ page }) => {
  expect((await page.goto('/preview/nosuchslug'))?.status()).toBe(404)
  expect((await page.goto('/preview/nosuchslug/t01-aurora'))?.status()).toBe(404)
})
