import { expect, test } from '@playwright/test'

// The header between the top sections at 1440x900 (ADR 0034, amendment of 24 September 2026).
// The pill forms at the first scroll, the ask fills only once the hero's own button has gone, so
// the two blue buttons are never on screen together, and on the way back the island dissolves
// while the blend is still normal, so nothing inside the header is ever drawn inverted.

test('the header ask fills once the hero button has scrolled away', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const bar = page.locator('header').locator('xpath=..')
  const ask = page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Show me my three designs' })
  await page.evaluate(() => {
    window.scrollTo(0, 200)
  })
  await expect(bar).toHaveAttribute('data-island', '')
  await expect(ask).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await page.locator('#straight-answers').scrollIntoViewIfNeeded()
  await expect(ask).toHaveCSS('background-color', 'rgb(3, 105, 161)')
  await page.locator('#hero').scrollIntoViewIfNeeded()
  await expect(ask).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
})

// The hardest case: an instant jump to the top with the ask filled. In the frame the blend flips
// back to difference no glass, no artwork and no fill may be left, and the row is wide again.
test('the island dissolves before the header blends again', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/lenis/)
  await page.locator('#straight-answers').scrollIntoViewIfNeeded()
  await expect(page.locator('header').locator('xpath=..')).toHaveAttribute('data-filled', '')
  type Frame = { blend: string; glass: number; art: number; fill: string; width: number }
  const frames = await page.evaluate(
    () =>
      new Promise<Frame[]>((resolve, reject) => {
        const header = document.querySelector('header')
        const row = header?.querySelector('.header-row')
        const art = header?.querySelector('a[href="/"] .brand-mark-image')
        const ask = header?.querySelector('.header-ask')
        if (!header || !row || !art || !ask) {
          reject(new Error('header parts missing'))
          return
        }
        const seen: Frame[] = []
        const start = performance.now()
        const tick = () => {
          seen.push({
            blend: getComputedStyle(header).mixBlendMode,
            glass: Number(getComputedStyle(row, '::before').opacity),
            art: Number(getComputedStyle(art).opacity),
            fill: getComputedStyle(ask).backgroundColor,
            width: row.getBoundingClientRect().width,
          })
          if (performance.now() - start < 1200) requestAnimationFrame(tick)
          else resolve(seen)
        }
        requestAnimationFrame(tick)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }),
  )
  const flip = frames.findIndex(
    (frame, index) => frame.blend === 'difference' && frames[index - 1]?.blend === 'normal',
  )
  expect(flip).toBeGreaterThan(0)
  const clear = /^rgba\(\d+, \d+, \d+, 0\)$/
  expect(
    frames.filter(
      (frame) =>
        frame.blend === 'difference' &&
        (frame.glass > 0 || frame.art > 0 || !clear.test(frame.fill)),
    ),
  ).toEqual([])
  expect(frames[flip]?.width ?? 0).toBeGreaterThan(1216)
})

// The glass has a floor (app/_styles/header.css): the hero's ink can be under the bar when the
// blend flips, and navy words over a glass fading in from nothing read at 1.2:1 there. In every
// frame the blend is normal, on the way in and on the way out, the glass is at least half there.
test('the glass is at its floor in every frame the blend is normal', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/lenis/)
  type Frame = { blend: string; glass: number }
  const watch = (top: number) =>
    page.evaluate(
      (top) =>
        new Promise<Frame[]>((resolve, reject) => {
          const header = document.querySelector('header')
          const row = header?.querySelector('.header-row')
          if (!header || !row) {
            reject(new Error('header parts missing'))
            return
          }
          const seen: Frame[] = []
          const start = performance.now()
          const tick = () => {
            seen.push({
              blend: getComputedStyle(header).mixBlendMode,
              glass: Number(getComputedStyle(row, '::before').opacity),
            })
            if (performance.now() - start < 900) requestAnimationFrame(tick)
            else resolve(seen)
          }
          requestAnimationFrame(tick)
          window.scrollTo({ top, behavior: 'instant' })
        }),
      top,
    )
  for (const frames of [await watch(200), await watch(0)]) {
    expect(frames.some((frame) => frame.blend === 'normal')).toBe(true)
    expect(frames.filter((frame) => frame.blend === 'normal' && frame.glass < 0.5)).toEqual([])
  }
})

// Over a dark band's edge the glass fades on --bar-dark and the words and the mark turn on the
// same number (app/globals.css), so a light word never sits on a light glass, nor navy on a dark
// one, in any frame, whichever way the page goes.
test("the header's words and mark turn with the glass at a dark band's edge", async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/lenis/)
  const into = await page.evaluate(
    () => (document.querySelector('.ink-stretch')?.getBoundingClientRect().top ?? 0) + scrollY,
  )
  type Frame = { dark: number; light: boolean; art: number }
  const watch = (top: number) =>
    page.evaluate(
      (top) =>
        new Promise<Frame[]>((resolve, reject) => {
          const header = document.querySelector('header')
          const art = header?.querySelector('a[href="/"] .brand-mark-image')
          if (!header || !art) {
            reject(new Error('header parts missing'))
            return
          }
          const seen: Frame[] = []
          const start = performance.now()
          const tick = () => {
            const style = getComputedStyle(header)
            // Chrome writes the mixed ink in the srgb function; the light ink's red is 0.886.
            const red = Number(/color\(srgb ([\d.]+)/.exec(style.color)?.[1] ?? '0')
            seen.push({
              dark: Number(style.getPropertyValue('--bar-dark')),
              light: red > 0.5,
              art: Number(getComputedStyle(art).opacity),
            })
            if (performance.now() - start < 700) requestAnimationFrame(tick)
            else resolve(seen)
          }
          requestAnimationFrame(tick)
          window.scrollTo({ top, behavior: 'instant' })
        }),
      top,
    )
  await page.evaluate(() => {
    window.scrollTo({ top: 200, behavior: 'instant' })
  })
  await expect(page.locator('header').locator('xpath=..')).toHaveAttribute('data-island', '')
  for (const frames of [await watch(into + 200), await watch(200)]) {
    expect(frames.some((frame) => frame.dark > 0 && frame.dark < 1)).toBe(true)
    expect(frames.filter((frame) => frame.light !== frame.dark >= 0.55)).toEqual([])
    expect(frames.filter((frame) => frame.art !== (frame.light ? 0 : 1))).toEqual([])
  }
})
