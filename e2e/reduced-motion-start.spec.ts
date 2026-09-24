import { expect, type Page, test } from '@playwright/test'

// Under reduced motion /start moves colour and opacity only: a question still fades in on Next
// and on Back, the sketch still takes each answer, and nothing slides. The entrances last a fifth
// of a second, too short to catch with one look after a click, so a script the page runs before
// its own samples every running animation on every frame of the walk and notes any whose
// keyframes move something.

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

async function ask(page: Page, name: string, question: number, heading: string) {
  await page.getByRole('button', { name, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`q=${String(question)}$`))
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
}

// Sending the brief runs the paid pipeline; this walk never presses the last question's button,
// and every POST to /start, which is how the Server Action travels, is refused besides.
test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === '/start',
    (route) => (route.request().method() === 'POST' ? route.abort() : route.fallback()),
  )
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
      page.getByRole('heading', { level: 1, name: 'First, your business.' }),
    ).toBeVisible()

    await page.getByLabel('What does your business do?').fill(SENTENCE)
    await ask(page, 'Next', 2, 'Where should we send your link?')
    await page.getByLabel('Your name').fill('Sam')
    await page.getByLabel('Company').fill('Ashgrove Physio')
    await page.getByLabel('Email').fill('sam@ashgrove.example')
    await ask(page, 'Next', 3, "Add Ashgrove Physio's logo, or skip it.")
    await ask(page, 'Next', 4, 'How should Ashgrove Physio look?')
    await page.getByRole('radio', { name: 'Dark and moody' }).click()
    await ask(page, 'Next', 5, "Pick Ashgrove Physio's colours.")
    // A hover previews a palette in the sketch; a click chooses one.
    await page.getByRole('radio', { name: 'Plum' }).hover()
    await page.getByRole('radio', { name: 'Clay' }).click()

    // The browser's own Back, then the page's.
    await page.goBack()
    await expect(page).toHaveURL(/q=4$/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'How should Ashgrove Physio look?' }),
    ).toBeVisible()
    await ask(page, 'Back', 3, "Add Ashgrove Physio's logo, or skip it.")
    await ask(page, 'Back', 2, 'Where should we send your link?')
    await ask(page, 'Back', 1, 'First, your business.')

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
