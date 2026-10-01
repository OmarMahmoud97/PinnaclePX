import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// WCAG 2.2 AA on the owner's pages at the desktop, the phone and the tablet: the inbox with its
// strip and rows, and the standing panel with every control. The example stands in for the real
// pages (app/examples/admin/page.tsx), which need the door and the database.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa']

test('the owner pages pass axe', async ({ page }) => {
  await page.goto('/examples/admin')
  await expect(page.locator('main#main h1')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  expect(
    results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map((n) => n.target.join(' ')),
    })),
  ).toEqual([])
})
