import { expect, test } from '@playwright/test'

// With JavaScript off the page is complete: every section, every action, the finished sketch,
// and a FAQ that opens natively.

test('the whole page reads and works without JavaScript', async ({ page }) => {
  await page.goto('/')
  for (const name of [
    'One question at a time.',
    'Straight answers.',
    'About the studio',
    'Frequently asked questions',
    'Your three designs are five questions away.',
  ]) {
    await expect(page.getByRole('heading', { name })).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'Show me my three designs' }).first()).toBeVisible()
  await expect(page.getByText('Example brief so far: Sentence, VetPres')).toBeAttached()

  const entry = page.locator('#faq details').first()
  await entry.locator('summary').click()
  await expect(entry).toHaveAttribute('open', '')
  await expect(entry.locator('p')).toBeVisible()

  await expect(page.locator('#straight-answers').getByRole('heading', { level: 3 })).toHaveCount(4)
  await expect(page.locator('#what-you-get').getByRole('heading', { level: 3 })).toHaveCount(4)
})
