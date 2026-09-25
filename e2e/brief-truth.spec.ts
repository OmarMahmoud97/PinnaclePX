import { expect, type Page, test } from '@playwright/test'
import type { SubmissionStatus } from '@/lib/brief/status'
import { SITE } from '@/lib/site'
import { openDone, refuseSends, statusFor } from './helpers/start'

// Release 1's truths (docs/start-page-journey-plan.md, package P2): the status poll is a plain
// GET that is never cached; a design is named by its place and a few words for its layout, never
// by its template's code name; the call and the designs open in new tabs; a slow build promises
// no email; and the home page and /privacy say only what is so. It replaces the confirmation
// test in brief.spec.ts, which pinned the old done address and a code name, and nothing here
// sends a brief: done is reached through ?q=done&s= with the poll answered from fixtures.

const SLUG = 'truthk7m2p9x'

// The code names of the templates the fixtures choose (e2e/helpers/start.ts).
const CODE_NAMES = /Aurora|Monolith|Meridian/

// The name each of the fixtures' three designs is announced by, in order.
const DESIGN_LINKS = [
  'Open design one: Glowing centre (opens in a new tab)',
  'Open design two: Card-led (opens in a new tab)',
  'Open design three: Colour pool (opens in a new tab)',
] as const

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

// Opens done for SLUG with the poll answered, as a refresh or a pasted link does, and waits for
// the flow to restore it. "Brief received" is the island's pinned line at done (plan 4.6).
async function restoredDone(
  page: Page,
  answers: readonly [SubmissionStatus, ...SubmissionStatus[]],
): Promise<void> {
  await openDone(page, SLUG, answers)
  await expect(page.getByText('Brief received', { exact: true })).toBeVisible()
}

test('the status poll is a GET that is never cached', async ({ request }) => {
  // A slug that is not one of ours is answered without reading the database.
  const response = await request.get('/api/status/not-a-slug')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toContain('no-store')
  expect(await response.json()).toEqual({ status: 'missing' })
})

test('the home page promises no initials and no stand-in photos of ours', async ({ page }) => {
  await page.goto('/')
  const steps = page.locator('#how-it-works')
  await expect(steps).toContainText('or your name stands in')
  await expect(steps).toContainText("we find photos to match if you don't")
  await expect(steps).not.toContainText('initials')
  await expect(steps).not.toContainText('ours stand in')
})

test('the privacy page says what this browser keeps, who takes a booking, and when unsent pictures go', async ({
  page,
}) => {
  await page.goto('/privacy')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { name: 'What this browser keeps' })).toBeVisible()
  await expect(main).toContainText('this tab keeps your answers')
  await expect(main.getByText('Cal.com', { exact: true })).toBeVisible()
  await expect(main).toContainText('we delete them within two days')
})

test('while the designs build, each is named by its place and look, never a code name', async ({
  page,
}) => {
  await restoredDone(page, [statusFor(SLUG, 'building')])
  const designs = page.getByRole('list', { name: 'Your designs' })
  // The name is the row's own text, with its descriptor in a span beside it.
  await expect(designs.getByRole('listitem').first()).toContainText('Design one')
  await expect(designs.getByText('Glowing centre', { exact: true })).toBeVisible()
  await expect(designs.getByText('Being built', { exact: true })).toHaveCount(3)
  await expect(page.locator('body')).not.toContainText(CODE_NAMES)
})

test('a ready build opens every design and the call in a new tab', async ({ page }) => {
  await restoredDone(page, [statusFor(SLUG, 'ready')])
  const designs = page.getByRole('list', { name: 'Your designs' })
  for (const name of DESIGN_LINKS) {
    await expect(designs.getByRole('link', { name, exact: true })).toHaveAttribute(
      'target',
      '_blank',
    )
  }
  const calls = page.locator(`main#main a[href^="${SITE.bookingUrl}"]`)
  await expect(calls.first()).toBeVisible()
  for (const call of await calls.all()) await expect(call).toHaveAttribute('target', '_blank')
  await expect(page.locator('body')).not.toContainText(CODE_NAMES)
})

test('a partial build opens like a ready one', async ({ page }) => {
  await restoredDone(page, [statusFor(SLUG, 'partial')])
  await expect(
    page.getByRole('list', { name: 'Your designs' }).getByRole('link', { name: DESIGN_LINKS[0] }),
  ).toBeVisible()
})

test('past the deadline, the page asks the visitor to keep it open and promises no email', async ({
  page,
}) => {
  const late = statusFor(SLUG, 'building', { deadlineInMs: -60_000 })
  await restoredDone(page, [late])
  const main = page.locator('main#main')
  // The time's line and the quiet one under it (done-lines.ts), the second read whole here.
  await expect(main.getByText('Taking a little longer.')).toBeVisible()
  await expect(main.getByText('Keep this page open, or save its link.')).toBeVisible()
  // The lead offers the email only for when the designs are done, never outright.
  await expect(main).toContainText('We also email them to')
  await expect(main).toContainText('when they are done.')
  await expect(main).not.toContainText(/will still land|land at/)
})
