import { expect, test } from '@playwright/test'

// The header under reduced motion (ADR 0034, amendment of 24 September 2026). The global
// allowlist keeps `color` moving, which would fade the header's text across the blend flip:
// white words on the white glass going in, a grey ghost under the blend coming out. The header's
// own rule in app/_styles/header.css keeps only its opacity fades and the --bar-dark fade, so the
// text reads its final colour in the first frame after each flip.

test("the header's text flips with the blend in one frame", async ({ page }) => {
  await page.goto('/')
  // The chrome mounts in the same commit that arms motion.
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const colours = await page.evaluate(
    () =>
      new Promise<string[]>((resolve, reject) => {
        const header = document.querySelector('header')
        const link = header?.querySelector('nav[aria-label="Main"] a')
        const wrap = header?.parentElement
        if (!header || !link || !wrap) {
          reject(new Error('header parts missing'))
          return
        }
        const seen: string[] = []
        new MutationObserver(() => {
          requestAnimationFrame(() => {
            seen.push(`${getComputedStyle(header).color} ${getComputedStyle(link).color}`)
            if (seen.length === 1) window.scrollTo(0, 0)
            else resolve(seen)
          })
        }).observe(wrap, { attributeFilter: ['data-solid'] })
        window.scrollTo(0, 100)
      }),
  )
  // The held ink is a colour-mix of the two sets (app/globals.css), which Chrome writes in the
  // srgb function; navy is 15, 23, 42 as 0-255 channels.
  const navy = 'color(srgb 0.0588235 0.0901961 0.164706)'
  expect(colours).toEqual([`${navy} ${navy}`, 'rgb(255, 255, 255) rgb(255, 255, 255)'])
})

// The phone menu under reduced motion: no bloom, no rise, no turn of the bars, and the header's
// row does not reshape; the sheet fades in and fades out, and hides once it has.
test('the phone menu only fades', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  // Every property a running transition in the header names, the sheet and the button included,
  // gathered frame by frame until told to stop.
  const watch = () =>
    page.evaluate(() => {
      const header = document.querySelector('header')
      const seen = new Set<string>()
      let live = true
      const tick = () => {
        for (const animation of header?.getAnimations({ subtree: true }) ?? []) {
          if (animation instanceof CSSTransition) seen.add(animation.transitionProperty)
        }
        if (live) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      Object.assign(window, {
        stopWatch: () => {
          live = false
          return [...seen]
        },
      })
    })
  const stop = () =>
    page.evaluate(() => (window as unknown as { stopWatch: () => string[] }).stopWatch())
  const moves = [
    'translate',
    'rotate',
    'scale',
    'transform',
    'clip-path',
    'top',
    'height',
    'max-width',
    'padding-inline-start',
    'padding-inline-end',
  ]

  await watch()
  await page.getByRole('button', { name: 'Menu' }).click()
  const menu = page.getByRole('navigation', { name: 'Mobile' })
  await expect(menu).toBeVisible()
  await expect(page.locator('#mobile-nav')).toHaveCSS('clip-path', 'none')
  await page.waitForTimeout(900)
  const opening = await stop()
  expect(opening).toContain('opacity')
  expect(opening.filter((property) => moves.includes(property))).toEqual([])

  await watch()
  const fade = page.evaluate(
    () =>
      new Promise<number[]>((resolve, reject) => {
        const nav = document.getElementById('mobile-nav')
        if (!nav) {
          reject(new Error('menu missing'))
          return
        }
        const seen: number[] = []
        const start = performance.now()
        const tick = () => {
          if (!nav.hidden) seen.push(Number(getComputedStyle(nav).opacity))
          if (!nav.hidden && performance.now() - start < 2000) requestAnimationFrame(tick)
          else resolve(seen)
        }
        requestAnimationFrame(tick)
      }),
  )
  await page.keyboard.press('Escape')
  const opacities = await fade
  await expect(menu).toBeHidden()
  const closing = await stop()
  expect(closing.filter((property) => moves.includes(property))).toEqual([])
  expect(opacities.filter((value) => value > 0 && value < 1).length).toBeGreaterThanOrEqual(3)
  expect(opacities.filter((value, index) => value > (opacities[index - 1] ?? 1))).toEqual([])
})
