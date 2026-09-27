import { expect, test } from '@playwright/test'
import { SHEET } from '@/app/contact/_components/contact-copy'
import {
  holdContact,
  hydrated,
  refuseContactSends,
  SEND_SETTLES_MS,
  stubCal,
} from './helpers/contact'

// /contact with prefers-reduced-motion (ADR 0040): the ink is never started, and through the
// page's load, a send and the calendar opening and closing, nothing moves. Every animation and
// transition is sampled in every frame, and none may change a translate, scale, rotate,
// transform or clip-path: things fade or change colour, and the send still ends on its card.

test.beforeEach(async ({ page }) => {
  await refuseContactSends(page)
})

// What every animation on the page changed, gathered frame by frame from before the first paint:
// a transition's property, or each property an animation's keyframes set, as CSS names.
type Watched = Window & { contactMotion?: () => string[] }

test('nothing moves, and the send and the calendar still work', async ({ page }) => {
  await page.addInitScript(() => {
    const seen = new Set<string>()
    const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    const ignored = new Set(['offset', 'computedOffset', 'easing', 'composite'])
    const sample = () => {
      for (const animation of document.getAnimations()) {
        if (animation instanceof CSSTransition) seen.add(animation.transitionProperty)
        else if (animation.effect instanceof KeyframeEffect) {
          for (const frame of animation.effect.getKeyframes()) {
            for (const name of Object.keys(frame)) if (!ignored.has(name)) seen.add(kebab(name))
          }
        }
      }
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
    ;(window as Watched).contactMotion = () => [...seen]
  })
  const scripts: Promise<string>[] = []
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script') scripts.push(response.text())
  })
  await stubCal(page)
  await page.goto('/contact')
  await hydrated(page)
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  )
  await expect(page.locator('main.contact')).toHaveCSS('--contact-pace', '1')
  // The ink is never started: its canvas keeps the size it was sent with.
  await expect(page.locator('#contact canvas.ink')).toHaveJSProperty('width', 300)

  await page.getByRole('textbox', { name: 'What do you need?' }).fill('Do you build sites?')
  await page.getByRole('textbox', { name: 'Your name' }).fill('Sam')
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('sam@example.com')
  const held = await holdContact(page)
  await page.locator('#hero-cta').click()
  await held.arrived
  await expect(page.locator('#write')).toHaveAttribute('data-state', 'sending')
  held.release({ ok: true, value: null })
  await expect(page.locator('#contact-sent-heading')).toBeFocused({ timeout: SEND_SETTLES_MS })

  await page.locator('#call button[aria-controls="booking"]').click()
  const sheet = page.locator('dialog#booking')
  await expect(sheet.locator('[data-cal]')).toHaveAttribute('data-cal', 'ready')
  await sheet.getByRole('button', { name: SHEET.close }).click()
  await expect(sheet).toHaveAttribute('data-phase', 'closed')

  const changed = await page.evaluate(() => (window as Watched).contactMotion?.() ?? [])
  expect(changed.length).toBeGreaterThan(0)
  expect(
    changed.filter((name) => /^(translate|scale|rotate|transform|clip-path)$/.test(name)),
  ).toEqual([])
  // The ink's simulation is never fetched: no script carries its shader's uniform.
  const bodies = await Promise.all(scripts)
  expect(bodies.filter((body) => body.includes('u_point_size'))).toEqual([])
})
