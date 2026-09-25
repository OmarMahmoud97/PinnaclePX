import { expect, type Page, test } from '@playwright/test'
import { CONFIG } from '@/lib/config'
import { refuseSends, withDraft } from './helpers/start'

// The questions' motion under reduced motion (docs/start-page-journey-plan.md, 6.2, 9.5 and
// package P5): each question still enters, its form fading in and then its lead and its controls
// in turn, by their opacity alone and at a third of the pace; its exit is a fade; a choice's bloom
// is a flash; and the lamp still crosses from colour to colour, which is not movement. A script the
// page runs before its own notes every animation as it starts. Nothing here sends a brief.

// What moves: the entrances' and the exit's own properties, and scale and rotate besides.
const MOVING = ['transform', 'translate', 'scale', 'rotate', 'clipPath']

type Seen = { name: string; target: string; keys: string[]; duration: number }

async function watchAnimations(page: Page) {
  await page.addInitScript(() => {
    const seen: Seen[] = []
    const noted = new WeakSet<Animation>()
    Object.assign(window, { startSeen: seen })
    function sample() {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect
        if (noted.has(animation) || !(effect instanceof KeyframeEffect)) continue
        noted.add(animation)
        const target = effect.target
        seen.push({
          name:
            animation instanceof CSSAnimation
              ? animation.animationName
              : animation instanceof CSSTransition
                ? animation.transitionProperty
                : 'script',
          target: `${target?.getAttribute('data-rise') ?? target?.tagName.toLowerCase() ?? ''}${effect.pseudoElement ?? ''}`,
          keys: [...new Set(effect.getKeyframes().flatMap((frame) => Object.keys(frame)))],
          duration: Number(effect.getTiming().duration),
        })
      }
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
}

function seen(page: Page): Promise<Seen[]> {
  return page.evaluate(() => (window as unknown as { startSeen: Seen[] }).startSeen)
}

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('a question enters and leaves by opacity alone, at a third of the pace', async ({ page }) => {
  await watchAnimations(page)
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=2')
  await expect(page.locator('main#main h1')).toHaveText('Put your name on it.')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  )
  await page.getByRole('button', { name: 'Next: pick a look', exact: true }).click()
  await expect(page.locator('main#main h1')).toHaveText('Pick a look.')
  await page.waitForTimeout(CONFIG.start.exitMs)

  const animations = await seen(page)
  const rises = animations.filter((animation) => animation.name === 'start-rise')
  const leaves = animations.filter((animation) => animation.name === 'start-leave')
  // Both questions' lead and controls rose, and the first one's left.
  expect(rises.map((animation) => animation.target)).toEqual(
    expect.arrayContaining(['lead', 'controls']),
  )
  expect(leaves.length).toBeGreaterThan(0)
  for (const animation of [...rises, ...leaves]) {
    expect(
      animation.keys.filter((key) => MOVING.includes(key)),
      animation.name,
    ).toEqual([])
  }
  // The questions' pace times --motion-reveal, the page's slowest clock (app/globals.css), which
  // the browser may hand back in seconds.
  const reveal = await page.evaluate(() => {
    const time = getComputedStyle(document.documentElement).getPropertyValue('--motion-reveal')
    const value = Number.parseFloat(time)
    return time.trim().endsWith('ms') ? value : value * 1000
  })
  for (const rise of rises) {
    expect(rise.duration).toBe(reveal * CONFIG.start.reducedPace)
  }
  for (const leave of leaves) expect(leave.duration).toBe(CONFIG.start.exitMs)
  // The form's own entrance, which the walk's count of entrances reads, is a fade too.
  const entrances = animations.filter((animation) => animation.name === 'question-in')
  expect(entrances.length).toBeGreaterThanOrEqual(2)
  for (const entrance of entrances) expect(entrance.keys).not.toContain('translate')
})

test('a choice flashes rather than blooms, and the lamp still changes colour', async ({ page }) => {
  await watchAnimations(page)
  await withDraft(page, { reached: 2 })
  await page.goto('/start?q=3')
  await expect(page.locator('main#main h1')).toHaveText('Pick a look.')
  await page.getByRole('radio', { name: /Bold and bright/ }).click()
  await page.getByRole('button', { name: 'Next: choose a colour', exact: true }).click()
  await expect(page.locator('main#main h1')).toHaveText('Choose a colour.')
  await page.waitForTimeout(CONFIG.start.exitMs)

  const animations = await seen(page)
  const blooms = animations.filter((animation) => animation.name === 'start-bloom')
  expect(blooms.length).toBeGreaterThan(0)
  for (const bloom of blooms) {
    expect(bloom.keys.filter((key) => MOVING.includes(key))).toEqual([])
  }
  // The lamp's colours are registered, so a change of question crossfades them.
  expect(animations.some((animation) => animation.name === '--start-pool')).toBe(true)
})
