import { expect, test } from '@playwright/test'
import { openDone, refuseSends, statusFor, withDraft } from './helpers/start'

// The done lifeline on a phone (docs/start-page-journey-plan.md, package P1): a pasted or
// refreshed done link comes back with its heading in the first screen, its designs as rows, and
// nothing wider than the phone; and a draft resumes where it reached. Nothing here sends a brief.

const SLUG = 'mk7m2p9x4w3h'

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('a done link restores on a phone, in the first screen and no wider than it', async ({
  page,
}) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'building')])
  const heading = page.locator('main#main h1')
  await expect(heading).toHaveText('Your designs are on their way.')
  await expect(heading).toBeInViewport()
  await expect(page.getByRole('list', { name: 'Your designs' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)

  await page.reload()
  await expect(heading).toHaveText('Your designs are on their way.')
})

test('a ready build restored on a phone opens every design in a new tab', async ({ page }) => {
  await openDone(page, SLUG, [statusFor(SLUG, 'ready')])
  const links = page.getByRole('list', { name: 'Your designs' }).getByRole('link')
  await expect(links).toHaveCount(3)
  for (const link of await links.all()) await expect(link).toHaveAttribute('target', '_blank')
})

test('a draft resumes on a phone at the question it reached', async ({ page }) => {
  await withDraft(page, { reached: 3 })
  await page.goto('/start')
  await expect(page).toHaveURL(/\/start\?q=4$/)
  await expect(page.locator('main#main h1')).toBeInViewport()
})
