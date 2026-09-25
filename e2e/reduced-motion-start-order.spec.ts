import { expect, type Page, test } from '@playwright/test'
import { PIXEL_PNG, refuseSends } from './helpers/start'

// Under reduced motion /start moves colour and opacity only, through the whole walk in its new
// order (docs/start-page-journey-plan.md, package P3): a question still fades in on Next and on
// Back, the sketch still takes each answer, and nothing slides; and the ask's spinner, shown while
// the brief waits for a picture still uploading, holds still. The entrances are short, so a
// script the page runs before its own samples every running animation on every frame of the walk
// and notes any whose keyframes move something. Nothing here sends a brief or stores a file.

// transform and translate are what the entrances use; scale and rotate are movement too.
const MOVING = ['transform', 'translate', 'scale', 'rotate']

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'

type Watch = { entrances: number; moving: string[] }

async function watchMotion(page: Page) {
  await page.addInitScript((moving: readonly string[]) => {
    const watch: Watch = { entrances: 0, moving: [] }
    const noted = new WeakSet<Animation>()
    Object.assign(window, { startMotion: watch })

    function describe(effect: KeyframeEffect) {
      const target = effect.target
      if (target === null) return 'nothing'
      const classes = [...target.classList].slice(0, 3).join('.')
      return `${target.tagName.toLowerCase()}${classes === '' ? '' : `.${classes}`}${effect.pseudoElement ?? ''}`
    }

    function sample() {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect
        if (animation.playState !== 'running' || !(effect instanceof KeyframeEffect)) continue
        if (noted.has(animation)) continue
        noted.add(animation)
        // Every question is a fresh form, and its entrance is the form's own animation.
        if (effect.target instanceof HTMLFormElement) watch.entrances += 1
        const moved = effect
          .getKeyframes()
          .flatMap((frame) => Object.keys(frame))
          .filter((property) => moving.includes(property))
        if (moved.length === 0) continue
        const name =
          animation instanceof CSSAnimation
            ? animation.animationName
            : animation instanceof CSSTransition
              ? `a transition of ${animation.transitionProperty}`
              : 'a script animation'
        watch.moving.push(`${name} on ${describe(effect)}: ${[...new Set(moved)].join(', ')}`)
      }
      requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  }, MOVING)
}

async function press(page: Page, name: string, question: number, title: string) {
  await page.getByRole('button', { name, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
  // The logo's upload is left unanswered, so it stays on its way and the last ask waits for it.
  await page.route('**/api/upload**', () => {
    // Left unanswered on purpose.
  })
})

// The desk and the phone lay the page out differently (the ask rides at the foot below lg), so
// the walk runs at both.
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`nothing on the questionnaire moves through Next and Back at ${String(viewport.width)}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await watchMotion(page)
    await page.goto('/start')
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true,
    )
    await expect(
      page.getByRole('heading', { level: 1, name: 'Start with a sentence.' }),
    ).toBeVisible()

    await page.getByLabel('What does your business do?').fill(SENTENCE)
    await press(page, 'Next: your name', 2, 'Put your name on it.')
    await page.getByLabel('Business name').fill('Ashgrove Physio')
    await page.getByRole('radio', { name: /Use my logo/ }).click()
    await page.getByLabel('Choose a file').setInputFiles(PIXEL_PNG)
    await expect(page.getByText('Uploading your logo.')).toBeVisible()
    await press(page, 'Next: pick a look', 3, 'Pick a look.')
    await page.getByRole('radio', { name: /Dark and moody/ }).click()
    await press(page, 'Next: choose a colour', 4, 'Choose a colour.')
    // A hover previews a colour in the sketch; a click chooses one.
    await page.getByRole('radio', { name: 'Plum' }).hover()
    await page.getByRole('radio', { name: 'Clay' }).click()
    await press(page, 'Next: one last step', 5, 'Where should we send them?')
    await page.getByLabel('Email').fill('sam@ashgrove.example')
    await page.getByLabel('Your name').fill('Sam')

    // The brief waits for the logo, and the ask's spinner shows without turning.
    await page.getByRole('button', { name: 'Show me my three designs', exact: true }).click()
    const spinner = page.locator('.start-ask .start-spinner')
    await expect(spinner).toBeVisible()
    await page.waitForTimeout(300)
    expect(await spinner.evaluate((element) => element.getAnimations().length)).toBe(0)

    // The browser's own Back, which calls the waiting send off, then the page's.
    await page.goBack()
    await expect(page).toHaveURL(/q=4$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Choose a colour.' })).toBeVisible()
    await press(page, 'Back', 3, 'Pick a look.')
    await press(page, 'Back', 2, 'Put your name on it.')
    await press(page, 'Back', 1, 'Start with a sentence.')

    // Let the last entrance and the last colour change finish inside the watch. Only animations
    // that end are waited for, so a pulse that loops can never hold the test.
    await page.waitForFunction(() =>
      document.getAnimations().every((animation) => {
        const { endTime } = animation.effect?.getComputedTiming() ?? {}
        return !Number.isFinite(endTime) || animation.playState !== 'running'
      }),
    )
    const watch = await page.evaluate(
      () => (window as unknown as { startMotion: Watch }).startMotion,
    )
    expect(watch.moving).toEqual([])
    // The watch saw what it guards: the first question's entrance and one for each of the eight
    // changes of question.
    expect(watch.entrances).toBeGreaterThanOrEqual(9)
  })
}
