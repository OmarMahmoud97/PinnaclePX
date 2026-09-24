import { expect, test } from '@playwright/test'

// The rail is a phone device (ADR 0034, amendment 4). This project reports a coarse pointer, so
// this pins the gate's width: at 768 the band keeps its two columns and shows no dots.
test('the work band keeps its two columns', async ({ page }) => {
  await page.goto('/')
  const list = page.locator('#work ul[data-choreo="tiles"]')
  await expect(list).toHaveCSS('display', 'grid')
  const columns = await list.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' '))
  expect(columns).toHaveLength(2)
  await expect(page.locator('#work .work-dots')).toBeHidden()
})
