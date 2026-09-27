import { expect, test } from '@playwright/test'
import { ANSWERS, CALL, WRITE } from '@/app/contact/_components/contact-copy'
import { SITE } from '@/lib/site'
import { refuseContactSends } from './helpers/contact'

// /contact without JavaScript (ADR 0040). The form would send nothing, so its fields and Send are
// hidden and the card offers the call in their place; the call card's control is the booking
// page itself. Each card then has one way to the call, and no control on the page submits.

test.beforeEach(async ({ page }) => {
  await refuseContactSends(page)
})

test('the page offers the call in both cards and nothing that cannot work', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.locator('[id="main"]')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('#write')).toBeVisible()
  await expect(page.locator('#call')).toBeVisible()

  for (const control of ['textarea', 'input[name="name"]', 'input[name="email"]', '#hero-cta']) {
    await expect(page.locator(`#write ${control}`), control).not.toBeVisible()
  }
  await expect(
    page.locator('button[type="submit"]:visible, input[type="submit"]:visible'),
  ).toHaveCount(0)

  // One way to the call in each card, both the booking page itself.
  for (const card of ['#write', '#call']) {
    const links = page.locator(`${card} a[href^="https://cal.com"]:visible`)
    await expect(links, card).toHaveCount(1)
    await expect(links, card).toHaveAttribute('href', SITE.bookingUrl)
  }
  await expect(page.locator('#write').getByText(WRITE.ratherTalk)).not.toBeVisible()
  // The plain link the control has beside it once the page has woken is in the page, unseen.
  const ownPage = page.locator('#call a').filter({ hasText: CALL.ownPage })
  await expect(ownPage).toHaveCount(1)
  await expect(ownPage).not.toBeVisible()

  await expect(page.getByRole('heading', { name: ANSWERS.heading })).toBeVisible()
  const studio = page.getByRole('navigation', { name: 'Studio' })
  await expect(studio).toBeVisible()
  await expect(studio.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute(
    'href',
    '/contact',
  )
})
