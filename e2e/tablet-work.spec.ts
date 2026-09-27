import { expect, test } from '@playwright/test'
import { flyFirstTile, LANDED } from './helpers/work'

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

// The switch flies in the two columns under a touch (ADR 0039): the page never widens, and the
// tile lands on the phone with nothing left on it.
test('the view switch flies at tablet width and lands clean', async ({ page }) => {
  const { first, flight, landed } = await flyFirstTile(page)
  expect(flight).toEqual({ flew: true, widest: 768, lefts: [0] })
  expect(landed).toEqual(LANDED)
  await expect(first.locator('[data-frame="phone"]')).toBeVisible()
  await expect(first.locator('[data-frame="browser"]')).toBeHidden()
})
