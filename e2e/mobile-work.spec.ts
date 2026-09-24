import { expect, test } from '@playwright/test'

// Work on a 390x844 phone, where the six tiles are one rail (ADR 0034, amendment 4).

// The band is under one and a half screens, all six sites are there, each tile parks on the
// shell's line with its link and its dated caption whole on screen when brought into view, the
// dot under the rail follows the tile on the line, the page itself never widens, Tab from one
// tile's link brings the next tile onto the line, and the first tile's view switch still works
// inside the rail.
test('the work band is one rail, and every site is a swipe away', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const work = page.locator('#work')
  const rail = work.locator('ul[data-choreo="tiles"]')
  await expect(rail).toHaveCSS('scroll-snap-type', 'x mandatory')
  expect(await work.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(844 * 1.5)
  const tiles = rail.getByRole('listitem')
  const links = work.getByRole('link', { name: /^Visit the .* site$/ })
  await expect(tiles).toHaveCount(6)
  await expect(work.getByRole('img')).toHaveCount(6)
  await expect(links).toHaveCount(6)
  await expect(work.getByRole('radio')).toHaveCount(12)
  const left = (i: number) =>
    tiles.nth(i).evaluate((el) => Math.round(el.getBoundingClientRect().left))
  for (let i = 0; i < 6; i++) {
    await tiles.nth(i).scrollIntoViewIfNeeded()
    await expect.poll(() => left(i)).toBe(24)
    await expect(links.nth(i)).toBeInViewport({ ratio: 1 })
    await expect(tiles.nth(i).getByText(/, \d{1,2} [A-Z][a-z]+ \d{4}$/)).toBeInViewport({
      ratio: 1,
    })
  }
  await expect(work.locator('.work-dots > span').last()).toHaveCSS('opacity', '1')
  expect(await page.evaluate(() => [window.scrollX, document.documentElement.scrollWidth])).toEqual(
    [0, 390],
  )
  await tiles.first().scrollIntoViewIfNeeded()
  await expect.poll(() => left(0)).toBe(24)
  await links.first().focus()
  await page.keyboard.press('Tab')
  await expect(tiles.nth(1).getByRole('radio', { name: 'Phone' })).toBeFocused()
  await expect.poll(() => left(1)).toBe(24)
  await tiles.first().scrollIntoViewIfNeeded()
  await tiles.first().getByText('Desktop', { exact: true }).click()
  await expect(tiles.first().locator('[data-frame="browser"]')).toBeVisible()
  await expect(tiles.first().locator('[data-frame="phone"]')).toBeHidden()
})

// The rail scrolls inside itself: its cross axis is hidden with nothing overflowing it, so a
// vertical swipe that starts on a tile has nothing to lock onto and moves the page, and scrolled
// to its end it still leaves the page as wide as the screen.
test('the work rail never scrolls the page sideways or itself vertically', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const rail = page.locator('#work ul[data-choreo="tiles"]')
  await rail.scrollIntoViewIfNeeded()
  const overflow = await rail.evaluate((el) => [
    getComputedStyle(el).overflowY,
    el.scrollHeight - el.clientHeight,
  ])
  expect(overflow).toEqual(['hidden', 0])
  await rail.evaluate((el) => {
    el.scrollTo({ left: el.scrollWidth, behavior: 'instant' })
  })
  expect(await page.evaluate(() => [window.scrollX, document.documentElement.scrollWidth])).toEqual(
    [0, 390],
  )
})
