import { expect, test } from '@playwright/test'

// With JavaScript off /start is the skeleton the server sends: the island, the real sketch of a
// blank brief on the ink, and the sentence that says how to go on, alone: the bars that hold the
// question's place are hidden, as nothing will fill them. The skip link's target is there too, so
// the first Tab has somewhere to go.
//
// The flow draws that skeleton itself until the browser has hydrated, and nothing around it
// suspends, so the server sends it once, inline, with no hidden copy waiting for a script to swap
// it in. The id count holds the page to that: a second main would be a second landmark target.

test('the start page shows its sketch and says what to do without JavaScript', async ({ page }) => {
  await page.goto('/start')

  const main = page.getByRole('main')
  await expect(main).toBeVisible()
  await expect(main).toHaveAttribute('id', 'main')
  await expect(page.locator('[id=main]')).toHaveCount(1)
  await expect(page.locator('a[href="#main"]')).toHaveCount(1)

  const sketch = page.getByRole('region', { name: 'Your brief so far' })
  await expect(sketch).toBeVisible()
  await expect(sketch.locator('[data-frame="browser"]')).toBeVisible()

  await expect(main.getByText(/^The five questions need JavaScript\./)).toBeVisible()
  // Counted first, so the check fails if the hook goes, rather than passing on nothing.
  const bars = main.locator('[data-skeleton-bars]')
  await expect(bars).toHaveCount(1)
  await expect(bars).toBeHidden()
})
