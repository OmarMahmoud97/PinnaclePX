import { expect, type Locator, type Page, test } from '@playwright/test'

// The Work switch where nothing may fly (ADR 0039): under reduced motion and under forced colours
// the controller holds the old view until the new capture has decoded, then the device arrives
// by opacity alone, and the pill is never enhanced. The desktop project runs this file; each
// test sets its own media before the page loads.

// Brings the band on screen, which loads the switch, and reaches for the first tile: the parts
// it makes there show the controller is running, even though it will not fly.
async function reached(page: Page): Promise<Locator> {
  await page.goto('/')
  await page.locator('#work').scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 100)
  const first = page.locator('#work').getByRole('listitem').first()
  await first.hover()
  await expect(first.locator('.work-seg-thumb')).toHaveCount(1)
  return first
}

// What ran in the tile for 600 ms after the press, sampled every 50 ms: whether it ever flew,
// every property an animation or transition moved on it or inside it, and whether the device
// faded in. The header's own transitions are its business, not the switch's.
const watch = (first: Locator) =>
  first.evaluate(
    (li) =>
      new Promise<{ flew: boolean; properties: string[]; faded: boolean }>((resolve) => {
        const properties = new Set<string>()
        const device = li.querySelector('.work-device')
        let flew = false
        let faded = false
        const started = performance.now()
        const sample = () => {
          flew ||= li.hasAttribute('data-morph')
          for (const animation of document.getAnimations()) {
            const effect = animation.effect
            if (!(effect instanceof KeyframeEffect)) continue
            if (!(effect.target instanceof Node) || !li.contains(effect.target)) continue
            for (const frame of effect.getKeyframes()) {
              for (const key of Object.keys(frame)) {
                if (!['offset', 'computedOffset', 'easing', 'composite'].includes(key)) {
                  properties.add(key)
                }
              }
            }
            if (effect.target === device) faded = true
          }
          if (performance.now() - started < 600) window.setTimeout(sample, 50)
          else resolve({ flew, properties: [...properties].sort(), faded })
        }
        sample()
      }),
  )

test.describe('under reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('the switch arrives by opacity and never flies', async ({ page }) => {
    const first = await reached(page)
    await expect(first.locator('fieldset[data-enhanced]')).toHaveCount(0)
    await first.getByText('Phone', { exact: true }).click()
    const seen = await watch(first)
    expect(seen.flew).toBe(false)
    expect(seen.faded).toBe(true)
    for (const property of seen.properties) {
      expect(['opacity', 'color', 'backgroundColor', 'borderColor']).toContain(property)
    }
    await expect(first.locator('[data-frame="phone"]')).toBeVisible()
    await expect(first.locator('[data-frame="browser"]')).toBeHidden()
    await expect(first).not.toHaveAttribute('data-hold')
    await expect(first.locator('.work-device')).not.toHaveAttribute('style')
    await expect(page.locator('html')).not.toHaveAttribute('data-work-morph')
  })
})

test.describe('under forced colours', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' })
  })

  test('the checked pill is the system highlight and nothing flies', async ({ page }) => {
    const first = await reached(page)
    await first.getByText('Phone', { exact: true }).click()
    const seen = await watch(first)
    expect(seen.flew).toBe(false)
    await expect(page.locator('#work fieldset[data-enhanced]')).toHaveCount(0)
    await expect(first.locator('[data-frame="phone"]')).toBeVisible()
    const highlight = await page.evaluate(() => {
      const probe = document.createElement('div')
      probe.style.cssText = 'forced-color-adjust: none; background: Highlight'
      document.body.append(probe)
      const colour = getComputedStyle(probe).backgroundColor
      probe.remove()
      return colour
    })
    const checked = first
      .locator('label')
      .filter({ has: page.getByRole('radio', { checked: true }) })
    await expect(checked).toHaveCSS('background-color', highlight)
  })
})
