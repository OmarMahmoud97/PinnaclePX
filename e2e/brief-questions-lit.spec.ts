import { expect, type Locator, type Page, test } from '@playwright/test'
import { CONFIG } from '@/lib/config'
import { refuseSends, withDraft } from './helpers/start'

// The questions in the hero's light, at a desk (docs/start-page-journey-plan.md, 4.4, 5, 6 and
// package P5): the hero-scale title with its one payoff word in the serif italic, the receipt under
// it, the white card holding the helper, the controls and the ask; the tiles' fills, checks and
// blooms, and the mood art beside each look; the island's dot; the exit a question plays before it
// moves on, and the question coming back when the flow refuses the move; the bars that hold a later
// question's place while its step loads; and the question going quiet while the brief is sent, the
// ask keeping the focus. Nothing here sends a brief: the one test that presses the last ask holds
// its request in the browser.

const QUESTIONS = [
  { title: 'Start with a sentence.', payoff: 'sentence', ask: 'Next: your name' },
  { title: 'Put your name on it.', payoff: 'name', ask: 'Next: pick a look' },
  { title: 'Pick a look.', payoff: 'look', ask: 'Next: choose a colour' },
  { title: 'Choose a colour.', payoff: 'colour', ask: 'Next: one last step' },
  { title: 'Where should we send them?', payoff: 'send', ask: 'Show me my three designs' },
] as const

// The title's size from 1440 wide: the hero's, stopped at 4.58rem (plan 5.1).
const TITLE_PX = 73.28

// How long a slow phone network might take over the later questions' chunk.
const SLOW_CHUNK_MS = 600

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function heading(page: Page) {
  return page.locator('main#main h1')
}

function question(n: number) {
  const found = QUESTIONS[n - 1]
  if (found === undefined) throw new Error(`No question ${String(n)}`)
  return found
}

function ask(page: Page, n: number) {
  return page.getByRole('button', { name: question(n).ask, exact: true })
}

async function open(page: Page, n: number) {
  await page.goto(`/start?q=${String(n)}`)
  await expect(heading(page)).toHaveText(question(n).title)
}

// A still page: the question's entrance and every colour change over.
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

function inert(locator: Locator) {
  return locator.evaluate((element) => (element as HTMLElement).inert)
}

test('every title sets its payoff word in the serif italic, at the hero’s size', async ({
  page,
}) => {
  await withDraft(page, { reached: 4 })
  for (const n of [1, 2, 3, 4, 5]) {
    await open(page, n)
    const payoff = heading(page).locator('em')
    await expect(payoff).toHaveCount(1)
    await expect(payoff).toHaveText(question(n).payoff)
    await expect(payoff).toHaveCSS('font-style', 'italic')
    const families = await heading(page).evaluate((h1) => [
      getComputedStyle(h1).fontFamily,
      getComputedStyle(h1.querySelector('em') ?? h1).fontFamily,
    ])
    expect(families[1], `question ${String(n)}`).not.toBe(families[0])
    await expect(heading(page)).toHaveCSS('font-size', `${String(TITLE_PX)}px`)
  }
  // It stops growing at 1440: a wider desk sets it the same.
  await page.setViewportSize({ width: 1920, height: 1080 })
  await expect(heading(page)).toHaveCSS('font-size', `${String(TITLE_PX)}px`)
})

test('the receipt sits under the title, on the ground, and the helper in the white card', async ({
  page,
}) => {
  await withDraft(page, { reached: 2 })
  await open(page, 3)
  const receipt = page.locator('main .start-receipt:visible')
  await expect(receipt).toHaveText('Ashgrove Physio is on the page.')
  const [title, under] = await Promise.all([heading(page).boundingBox(), receipt.boundingBox()])
  expect((under?.y ?? 0) + 1).toBeGreaterThanOrEqual((title?.y ?? 0) + (title?.height ?? 0))
  expect(await receipt.evaluate((element) => element.closest('.start-card'))).toBeNull()

  const card = page.locator('main .start-card')
  await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(card.locator('.start-helper')).toBeVisible()
  await expect(card.getByRole('radiogroup', { name: 'Look' })).toBeVisible()
  await expect(card.getByRole('button', { name: question(3).ask })).toBeVisible()
})

test('the fields are wells of the wash inside the white card', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  await open(page, 5)
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveCSS(
    'background-color',
    'rgb(226, 238, 247)',
  )
})

test('a Next that moves on plays the exit, the ask keeping the focus, then moves once', async ({
  page,
}) => {
  await withDraft(page, { reached: 2 })
  await open(page, 3)
  await settle(page)
  const form = page.locator('main#main form')
  const button = ask(page, 3)
  await button.focus()
  await page.keyboard.press('Enter')
  // A second press in the exit does nothing.
  await page.keyboard.press('Enter')
  await expect(form).toHaveAttribute('data-leaving', 'next')
  await expect(button).toHaveAttribute('aria-disabled', 'true')
  await expect(button).toBeFocused()
  expect(await inert(form.locator('[data-part="controls"]'))).toBe(true)
  expect(await inert(form.locator('[data-part="back"]'))).toBe(true)

  await expect(page).toHaveURL(/q=4$/)
  await expect(heading(page)).toHaveText(question(4).title)
  await expect(heading(page)).toBeFocused()
  await page.waitForTimeout(CONFIG.start.exitMs * 2)
  await expect(page).toHaveURL(/q=4$/)
})

test('a Next that finds an error plays no exit', async ({ page }) => {
  await withDraft(page, { reached: 1, company: '' })
  await open(page, 2)
  await ask(page, 2).click()
  await expect(page.getByText('Tell us your business name.', { exact: true })).toBeVisible()
  await expect(page.locator('main#main form')).not.toHaveAttribute('data-leaving')
  await expect(page).toHaveURL(/q=2$/)
})

test('an answer emptied in the exit brings the question back, the focus on what is wrong', async ({
  page,
}) => {
  await withDraft(page, { reached: 0 })
  await open(page, 1)
  await settle(page)
  const field = page.getByRole('textbox', { name: 'What does your business do?' })
  await field.focus()
  // The Next and the emptying in one task, so the exit is still running however slow the machine.
  // The value is set past React's own record of it, as typing would, so its input event counts.
  await field.evaluate((textarea: HTMLTextAreaElement) => {
    textarea.form?.requestSubmit()
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(textarea, '')
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
  const form = page.locator('main#main form')
  await expect(form).toHaveAttribute('data-leaving', 'next')

  await expect(form).not.toHaveAttribute('data-leaving')
  await expect(page).toHaveURL(/q=1$/)
  await expect(field).toBeFocused()
  await expect(field).toHaveAttribute('aria-invalid', 'true')
  await expect(ask(page, 1)).not.toHaveAttribute('aria-disabled')
  await settle(page)
  await expect(form.locator('.start-helper')).toHaveCSS('opacity', '1')
  expect(await inert(form.locator('[data-part="controls"]'))).toBe(false)
})

test('an arrival at a later question keeps main filled while its step loads', async ({ page }) => {
  // The later questions' steps held back, as on a slow network. Only their chunk defines the name
  // step (the dev server's chunks name their modules), so nothing else waits.
  await page.route(
    (url) => url.pathname.startsWith('/_next/static/chunks/'),
    async (route) => {
      const response = await route.fetch()
      const body = await response.text()
      if (body.includes('brand-step.tsx')) {
        await new Promise((resolve) => setTimeout(resolve, SLOW_CHUNK_MS))
      }
      await route.fulfill({ response, body })
    },
  )
  await withDraft(page, { reached: 1 })
  // What main holds in every frame from the skeleton on: the skeleton's bars, the bars the flow
  // keeps while the step loads (named for the question, which the lamp reads), or the question.
  await page.addInitScript(() => {
    const seen: string[] = []
    Object.assign(window, { __mainStates: seen })
    new MutationObserver(() => {
      const main = document.getElementById('main')
      if (main === null) return
      const state =
        main.querySelector('[data-skeleton-bars]') !== null
          ? 'skeleton'
          : main.querySelector('form h1') !== null
            ? 'question'
            : main.querySelector('[data-question="brand"]') !== null
              ? 'waiting'
              : 'empty'
      if (seen.length === 0 && state !== 'skeleton') return
      if (seen.at(-1) !== state) seen.push(state)
    }).observe(document, { childList: true, subtree: true })
  })
  await open(page, 2)
  await expect(heading(page)).toBeFocused()
  const states = await page.evaluate(
    () => (window as unknown as { __mainStates: string[] }).__mainStates,
  )
  expect(states).toEqual(['skeleton', 'waiting', 'question'])
})

test('Back plays the exit the other way, then goes back', async ({ page }) => {
  await withDraft(page, { reached: 2 })
  await open(page, 3)
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.locator('main#main form')).toHaveAttribute('data-leaving', 'back')
  await expect(page).toHaveURL(/q=2$/)
  await expect(heading(page)).toHaveText(question(2).title)
})

test('while the brief is sent the question goes quiet and the ask keeps the focus', async ({
  page,
}) => {
  // The send's request is held in the browser, never answered and never let through, so the
  // question stays in its sending state and nothing reaches the server.
  await page.route(
    (url) => url.pathname === '/start',
    (route) =>
      route.request().method() === 'GET'
        ? route.fallback()
        : new Promise(() => {
            // Held on purpose.
          }),
  )
  await withDraft(page, { reached: 4 })
  await open(page, 5)
  await settle(page)
  // Enter in the last field sends, and the focus goes to the ask, which keeps it.
  await page.getByRole('textbox', { name: 'Your name' }).press('Enter')
  const sending = page.getByRole('button', { name: 'Sending', exact: true })
  await expect(sending).toBeFocused()
  await expect(sending).toHaveAttribute('aria-disabled', 'true')
  const form = page.locator('main#main form')
  for (const part of ['lead', 'controls', 'back']) {
    for (const element of await form.locator(`[data-part="${part}"]`).all()) {
      expect(await inert(element), part).toBe(true)
    }
  }
  await expect(page.getByRole('status').filter({ hasText: 'Sending your answers.' })).toHaveCount(1)
})

test('the island’s dot sits under the question showing', async ({ page }) => {
  await withDraft(page, { reached: 2 })
  await open(page, 3)
  await settle(page)
  const centres = await page.evaluate(() => {
    const dot = document.querySelector('header .start-dot')?.getBoundingClientRect()
    const segments = [...document.querySelectorAll('header [aria-hidden="true"] > span')]
      .map((segment) => segment.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0 && box.height < 8)
    const third = segments[2]
    if (dot === undefined || third === undefined) return null
    return { dot: dot.x + dot.width / 2, segment: third.x + third.width / 2 }
  })
  expect(centres).not.toBeNull()
  expect(Math.abs((centres?.dot ?? 0) - (centres?.segment ?? Infinity))).toBeLessThanOrEqual(1)
})

test('each look shows its mood art, and a choice draws its check and blooms', async ({ page }) => {
  await withDraft(page, { reached: 2 })
  await open(page, 3)
  const looks = page.getByRole('radiogroup', { name: 'Look' })
  for (const style of ['warm', 'minimal', 'bold', 'dark']) {
    const art = looks.locator(`.mood-art[data-style="${style}"]`)
    await expect(art).toHaveCount(1)
    await expect(art).toHaveAttribute('aria-hidden', 'true')
  }
  await settle(page)
  // The chosen look keeps its check and never blooms on arrival.
  await expect(looks.locator('[data-bloom]')).toHaveCount(0)

  const bold = looks.getByRole('radio', { name: /Bold and bright/ })
  await bold.click({ position: { x: 20, y: 20 } })
  await expect(bold).toHaveAttribute('aria-checked', 'true')
  await expect(bold).toHaveAttribute('data-bloom', '')
  const blooms = await bold.evaluate((card) =>
    card
      .getAnimations({ subtree: true })
      .map((animation) => (animation instanceof CSSAnimation ? animation.animationName : '')),
  )
  expect(blooms).toContain('start-bloom')
  await settle(page)
  await expect(bold.locator('.start-check path')).toHaveCSS('stroke-dashoffset', '0px')
})

test('the palettes are filled with their colour and labelled in white', async ({ page }) => {
  await withDraft(page, { reached: 3 })
  await open(page, 4)
  const forest = page.getByRole('radio', { name: 'Forest' })
  await expect(forest).toHaveCSS('background-color', 'rgb(47, 111, 78)')
  await expect(forest).toHaveCSS('color', 'rgb(255, 255, 255)')
  // A colour of the visitor's own is a plain tile with a swatch, so its label never sits on it.
  const own = page.getByRole('radio', { name: /My own colour/ })
  await expect(own.locator('.start-swatch')).toHaveCount(1)
  await expect(own).not.toHaveAttribute('data-fill')
})
