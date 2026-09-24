import { expect, type Page, test } from '@playwright/test'

// The header between the top sections on a 390x844 phone (ADR 0034, amendment of 24 September
// 2026). The ask and the name beside the mark take turns by grid track, fading as they fold, so
// the pill breathes rather than jumps and the Menu button never leaves the screen; the island's
// 8px drop is `top`, so the row never becomes the fixed sheet's containing block.

// One hand-over, watched for 1.5 s: the Menu button's right edge in every frame, and what the ask
// is transitioning in the frame after data-past-hero turns to `toPast`.
function watchHandOver(page: Page, toPast: boolean) {
  return page.evaluate(
    (toPast) =>
      new Promise<{ right: number; fading: string[] }>((resolve, reject) => {
        const header = document.querySelector('header')
        const wrap = header?.parentElement
        const menu = header?.querySelector('button[aria-label="Menu"]')
        const ask = [...(header?.querySelectorAll('a[href="/start"]') ?? [])].find(
          (link) => link.closest('nav') === null,
        )
        if (!wrap || !menu || !ask) {
          reject(new Error('header parts missing'))
          return
        }
        let right = 0
        let fading: string[] = []
        new MutationObserver((_, observer) => {
          if (wrap.hasAttribute('data-past-hero') !== toPast) return
          observer.disconnect()
          requestAnimationFrame(() => {
            fading = ask
              .getAnimations()
              .map((animation) =>
                animation instanceof CSSTransition ? animation.transitionProperty : '',
              )
          })
        }).observe(wrap, { attributeFilter: ['data-past-hero'] })
        const start = performance.now()
        const tick = () => {
          right = Math.max(right, menu.getBoundingClientRect().right)
          if (performance.now() - start < 1500) requestAnimationFrame(tick)
          else resolve({ right, fading })
        }
        requestAnimationFrame(tick)
      }),
    toPast,
  )
}

test('the header ask fades in and out beside a Menu button that stays on screen', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  // At the top the folded ask is out of the tab order: Tab from the home link lands on Menu.
  await page.locator('header a[href="/"]').first().focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused()
  const headerCta = page.locator('header').getByRole('link', { name: 'Show me my three designs' })
  // Both hand-overs are watched, on the way in and on the way back: the Menu button's edge in
  // every frame, and the ask's transitions in the frame after the hand-over.
  const goingIn = watchHandOver(page, true)
  await page.locator('#straight-answers').scrollIntoViewIfNeeded()
  const fadeIn = await goingIn
  expect(fadeIn.right).toBeLessThanOrEqual(390)
  expect(fadeIn.fading).toContain('opacity')
  await expect(headerCta).toBeVisible()
  const goingOut = watchHandOver(page, false)
  await page.locator('#hero').scrollIntoViewIfNeeded()
  const fadeOut = await goingOut
  expect(fadeOut.right).toBeLessThanOrEqual(390)
  expect(fadeOut.fading).toContain('opacity')
  await expect(headerCta).toBeHidden()
})

// Opened from the island, the sheet is the viewport's height in every frame and the ink blooms
// from the button's own centre in the pill. A translate on the row, easing back to none as the
// menu opens, would clip the sheet to the bar for the length of the ease; a fixed corner would
// start the ink from empty space beside the pill.
test('the menu covers the screen from its first frame on a scrolled page, from the button', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  await page.locator('#straight-answers').scrollIntoViewIfNeeded()
  await expect(page.locator('header').locator('xpath=..')).toHaveAttribute('data-island', '')
  const button = page.getByRole('button', { name: 'Menu' })
  // The pill settles over --motion-settle; its button is read once it has.
  await page.waitForTimeout(400)
  const box = await button.boundingBox()
  expect(box).not.toBeNull()
  const samples = page.evaluate(
    () =>
      new Promise<{ height: number; translate: string; clip: string }[]>((resolve, reject) => {
        const nav = document.getElementById('mobile-nav')
        const row = document.querySelector('.header-row')
        if (!nav || !row) {
          reject(new Error('menu parts missing'))
          return
        }
        const seen: { height: number; translate: string; clip: string }[] = []
        const start = performance.now()
        const tick = () => {
          if (!nav.hidden) {
            seen.push({
              height: nav.getBoundingClientRect().height,
              translate: getComputedStyle(row).translate,
              clip: getComputedStyle(nav).clipPath,
            })
          }
          if (performance.now() - start < 800) requestAnimationFrame(tick)
          else resolve(seen)
        }
        requestAnimationFrame(tick)
      }),
  )
  await button.click()
  const seen = await samples
  expect(seen.length).toBeGreaterThan(0)
  expect(seen.filter(({ height }) => height !== 844)).toEqual([])
  expect(seen.filter(({ translate }) => translate !== 'none')).toEqual([])
  const centre = /at ([\d.]+)px ([\d.]+)px/.exec(seen[0]?.clip ?? '')
  expect(centre).not.toBeNull()
  const [x, y] = [Number(centre?.[1]), Number(centre?.[2])]
  expect(Math.abs(x - ((box?.x ?? 0) + (box?.width ?? 0) / 2))).toBeLessThanOrEqual(1)
  expect(Math.abs(y - ((box?.y ?? 0) + (box?.height ?? 0) / 2))).toBeLessThanOrEqual(1)
})

// Closing, the sheet leaves the tab order and the accessibility tree at once (inert) and stays on
// screen while the ink drains back into the button, with the header still unblended over it; only
// then is it hidden. Focus is on the button from the first frame, as before.
test('the menu drains into its button before it hides', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const button = page.getByRole('button', { name: 'Menu' })
  await button.click()
  const menu = page.getByRole('navigation', { name: 'Mobile' })
  await expect(menu).toBeVisible()
  await page.waitForFunction(
    () => document.getElementById('mobile-nav')?.getAnimations({ subtree: true }).length === 0,
  )
  const samples = page.evaluate(
    () =>
      new Promise<{ hidden: boolean; inert: boolean; blend: string; clip: string }[]>(
        (resolve, reject) => {
          const nav = document.getElementById('mobile-nav')
          const header = document.querySelector('header')
          if (!nav || !header) {
            reject(new Error('menu parts missing'))
            return
          }
          const seen: { hidden: boolean; inert: boolean; blend: string; clip: string }[] = []
          const start = performance.now()
          const tick = () => {
            seen.push({
              hidden: nav.hidden !== false,
              inert: nav.inert,
              blend: getComputedStyle(header).mixBlendMode,
              clip: getComputedStyle(nav).clipPath,
            })
            if (!nav.hidden && performance.now() - start < 2000) requestAnimationFrame(tick)
            else resolve(seen)
          }
          requestAnimationFrame(tick)
        },
      ),
  )
  await page.keyboard.press('Escape')
  const seen = await samples
  await expect(menu).toBeHidden()
  await expect(button).toBeFocused()
  const draining = seen.filter(({ hidden, inert }) => inert && !hidden)
  expect(draining.length).toBeGreaterThanOrEqual(3)
  expect(draining.filter(({ blend }) => blend !== 'normal')).toEqual([])
  expect(new Set(draining.map(({ clip }) => clip)).size).toBeGreaterThanOrEqual(3)
})

// Turned to landscape, a phone is past md, where the button is not drawn: the menu closes at once
// rather than leaving the header dark, unblended and full width with nothing to close it.
test('the menu lets go of the header when the viewport grows past md', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  await page.setViewportSize({ width: 800, height: 844 })
  await expect(page.locator('header [data-menu]')).toHaveCount(0)
  await expect(page.locator('header')).toHaveCSS('mix-blend-mode', 'difference')
  await expect(page.locator('#main')).toHaveJSProperty('inert', false)
})

// The open sheet covers the page, so the page under it is inert (WCAG 2.4.11): Tab past the last
// action goes to the browser, never to a control drawn under the ink, and Escape lets it go.
// The stop past the last action is the browser's own, so focus is asserted to be outside the
// page rather than inside the menu.
test("the page under the open menu is out of the keyboard's reach", async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const button = page.getByRole('button', { name: 'Menu' })
  await button.click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  await button.focus()
  const outsidePage = () =>
    page.evaluate(() => document.activeElement?.closest('main, footer') == null)
  for (let press = 0; press < 10; press++) {
    await page.keyboard.press('Tab')
    expect(await outsidePage()).toBe(true)
  }
  for (let press = 0; press < 4; press++) {
    await page.keyboard.press('Shift+Tab')
    expect(await outsidePage()).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden()
  await expect(page.locator('#main')).toHaveJSProperty('inert', false)
  await page.keyboard.press('Tab')
  await expect(page.locator('main :focus')).toHaveCount(1)
})

// Past the hero the header's own ask stands beside the button, drawn under the open sheet, so it
// is inert with the page: Shift+Tab from the cross reaches the mark, which sits above the sheet.
test('past the hero, Shift+Tab from the open menu passes over the ask under the sheet', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const headerCta = page.locator('header').getByRole('link', { name: 'Show me my three designs' })
  await page.locator('#straight-answers').scrollIntoViewIfNeeded()
  await expect(headerCta).toBeVisible()
  const button = page.getByRole('button', { name: 'Menu' })
  await button.click()
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible()
  await button.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(page.locator('header a[href="/"]').first()).toBeFocused()
})

// The glide prevents the browser's fragment jump, which is what moves the Tab order's start, so
// the glide moves focus to the section itself, once the page under the menu has been let go. The
// section is not a control, so it draws no ring, and the next Tab carries on from it rather than
// from the hero.
test('a section chosen from the menu by keyboard takes focus and Tab carries on from it', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/(^|\s)lenis(\s|$)/)
  await page.getByRole('button', { name: 'Menu' }).focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('navigation', { name: 'Mobile' })
  await menu.getByRole('link', { name: 'What you get' }).focus()
  await page.keyboard.press('Enter')
  const section = page.locator('#included')
  await expect(section).toBeFocused()
  await expect(menu).toBeHidden()
  await expect(section).toHaveCSS('outline-style', 'none')
  await page.keyboard.press('Tab')
  const follows = await page.evaluate(() => {
    const included = document.getElementById('included')
    const active = document.activeElement
    if (included === null || active === null) return false
    return (included.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  })
  expect(follows).toBe(true)
})
