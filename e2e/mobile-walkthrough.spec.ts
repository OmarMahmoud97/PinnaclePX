import { expect, test } from '@playwright/test'

// The walkthrough on a 390x844 phone (ADR 0036). The step being painted docks under the phone,
// so the words and the change they cause are on screen together; the card and its words leave
// together and the button arrives only once the card has gone. mobile.spec.ts keeps its own
// pin on the whole frame; these walk the section.

test('the walkthrough docks each step whole under the phone', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const section = page.locator('#how-it-works')
  await expect(section.locator('[data-dock]')).toHaveCount(1)
  // 844 tall leaves room for the desktop's own phone.
  await expect(section.locator('.walkthrough-stage')).toHaveAttribute(
    'style',
    /--walk-zoom:\s*1\.5/,
  )
  const report = await page.evaluate(async () => {
    const root = document.getElementById('how-it-works')
    const stage = root?.querySelector<HTMLElement>('.walkthrough-stage')
    const panel = stage?.firstElementChild
    const frame = root?.querySelector('[data-frame="phone"]')
    const ask = root?.querySelector('a[href="/start"]')
    if (!root || !stage || !panel || !frame || !ask) return { misses: ['missing'], seen: [] }
    // Two frames: the track reads the scroll in the first, the transitions start by the second.
    const settle = () =>
      new Promise<void>((done) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            done()
          })
        })
      })
    const pinned = parseFloat(getComputedStyle(stage).top)
    const misses: string[] = []
    const seen = new Set<string>()
    const top = root.getBoundingClientRect().top + scrollY
    for (let y = top; y < top + root.offsetHeight; y += 20) {
      // Instant: the page scrolls smoothly by CSS until Lenis has taken over.
      scrollTo({ top: y, behavior: 'instant' })
      await settle()
      const card = panel.getBoundingClientRect()
      const button = ask.getBoundingClientRect()
      if (button.bottom > card.top && button.top < card.bottom) {
        misses.push(`button at ${String(y)}`)
      }
      const step = root.querySelector<HTMLElement>('[data-current]')
      const title = step?.querySelector('h3')
      const body = step?.querySelector('p')
      if (!step || !title || !body || Math.abs(stage.getBoundingClientRect().top - pinned) > 1) {
        continue
      }
      seen.add(step.dataset.stages ?? '')
      // Layout, not paint: the words' rise is a translate.
      const at = step.getBoundingClientRect().top
      if (
        at + title.offsetTop < card.bottom ||
        at + body.offsetTop + body.offsetHeight > innerHeight
      ) {
        misses.push(`step ${step.dataset.stages ?? ''} at ${String(y)}`)
      }
      const box = frame.getBoundingClientRect()
      if (box.top < 64 || box.bottom > innerHeight) misses.push(`frame at ${String(y)}`)
      // One step at a time: every other step has faded out, or is fading (its transition may
      // not have moved yet two frames after the stop).
      const others = [...root.querySelectorAll<HTMLElement>('[data-stages]')].filter(
        (other) =>
          other !== step &&
          getComputedStyle(other).opacity === '1' &&
          other.getAnimations().length === 0,
      )
      if (others.length > 0) misses.push(`two steps at ${String(y)}`)
    }
    return { misses, seen: [...seen] }
  })
  expect(report.misses).toEqual([])
  expect(report.seen).toEqual(['1', '2', '3', '4', '5 6'])
})

test('the walkthrough hands over to its button in the clear', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  const section = page.locator('#how-it-works')
  const link = section.getByRole('link', { name: 'Show me my three designs' })
  await link.scrollIntoViewIfNeeded()
  await link.click({ trial: true })
  // The stage lets taps through (pointer-events: none), so the hit test alone cannot see the
  // card: the boxes must not meet either.
  const button = await link.boundingBox()
  const card = await section.locator('.walkthrough-stage > div').first().boundingBox()
  expect(button).not.toBeNull()
  expect(card).not.toBeNull()
  const clear =
    (button?.y ?? 0) >= (card?.y ?? 0) + (card?.height ?? 0) ||
    (button?.y ?? 0) + (button?.height ?? 0) <= (card?.y ?? 0)
  expect(clear).toBe(true)
})

// A shared link, or the nav's "The build" from another page, seats a section below the
// walkthrough before the dock grows it. The fit puts it back on its line: the header's 4rem of
// scroll padding plus the section's own 4rem margin. Without that it stopped at 262.
for (const id of ['real-build', 'faq']) {
  test(`arriving on /#${id} lands on its line`, async ({ page }) => {
    await page.goto(`/#${id}`)
    await expect(page.locator('#how-it-works [data-dock]')).toHaveCount(1)
    const section = page.locator(`#${id}`)
    await expect
      .poll(() => section.evaluate((element) => Math.round(element.getBoundingClientRect().top)), {
        timeout: 8000,
      })
      .toBe(128)
  })
}

test.describe('under reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('the walkthrough is a plain list under a still card', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-motion', '')
    const section = page.locator('#how-it-works')
    await expect(section.locator('[data-dock]')).toHaveCount(0)
    await expect(section.locator('.walkthrough-stage')).toHaveCSS('position', 'static')
    await expect
      .poll(() =>
        section
          .locator('[data-stages]')
          .evaluateAll((steps) => steps.map((step) => getComputedStyle(step).opacity).join(' ')),
      )
      .toBe('1 1 1 1 1')
  })
})
