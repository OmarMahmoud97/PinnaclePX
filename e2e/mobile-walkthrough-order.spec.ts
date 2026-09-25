import { expect, type Page, test } from '@playwright/test'
import { QUESTIONS } from '@/app/start/_components/start-copy'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { refuseSends } from './helpers/start'

// The walkthrough on a 390 by 844 phone in /start's order (docs/start-page-journey-plan.md, D29
// and 8.1, package P4). The step being painted docks under the phone (ADR 0036), so its title,
// /start's own heading for the question, sits under the progress line that counts it:
// "Put your name on it." under "Question 2 of 5". mobile-walkthrough.spec.ts holds the dock's
// geometry, which the new order leaves as it was. Nothing here sends a brief.

const TITLES = QUESTION_IDS.map((id) => QUESTIONS[id].title)

type Docked = Readonly<{ title: string; progress: string; y: number }>

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

// Walks the section 20 px at a time and lists each step as it docks under the pinned phone: its
// title, what the progress line over the phone says, and a scroll position in the middle of the
// stretch it stays docked for.
async function dockings(page: Page): Promise<Docked[]> {
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  await expect(page.locator('#how-it-works [data-dock]')).toHaveCount(1)
  return page.evaluate(async () => {
    const root = document.getElementById('how-it-works')
    const stage = root?.querySelector<HTMLElement>('.walkthrough-stage')
    if (!root || !stage) return []
    // Two frames: the track reads the scroll in the first and writes its stop by the second.
    const settle = () =>
      new Promise<void>((done) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            done()
          })
        })
      })
    const pinned = parseFloat(getComputedStyle(stage).top)
    const runs: { title: string; progress: string; from: number; to: number }[] = []
    const top = root.getBoundingClientRect().top + scrollY
    for (let y = top; y < top + root.offsetHeight; y += 20) {
      // Instant: the page scrolls smoothly by CSS until Lenis has taken over.
      scrollTo({ top: y, behavior: 'instant' })
      await settle()
      const title = root.querySelector('[data-current] h3')?.textContent
      if (title === undefined || Math.abs(stage.getBoundingClientRect().top - pinned) > 1) continue
      const progress =
        [...stage.querySelectorAll('span')]
          .map((span) => span.textContent)
          .find((text) => /^Question \d of \d$/.test(text)) ?? ''
      const last = runs.at(-1)
      if (last?.title === title && last.progress === progress) last.to = y
      else runs.push({ title, progress, from: y, to: y })
    }
    return runs.map(({ title, progress, from, to }) => ({
      title,
      progress,
      y: Math.round((from + to) / 2),
    }))
  })
}

test("each docked step is the question the progress line counts, in /start's order", async ({
  page,
}) => {
  await page.goto('/')
  const docked = await dockings(page)
  expect(docked.map(({ title, progress }) => ({ title, progress }))).toEqual(
    TITLES.map((title, index) => ({ title, progress: `Question ${String(index + 1)} of 5` })),
  )
})

// The name and the logo are one question on /start, so the phone paints both while "Put your
// name on it." is docked, and nothing of the look yet.
test('the name step lands the name and the logo together', async ({ page }) => {
  await page.goto('/')
  const docked = await dockings(page)
  const name = docked.find(({ title }) => title === QUESTIONS.brand.title)
  if (name === undefined) throw new Error('The name step never docked.')
  await page.evaluate((y) => {
    scrollTo({ top: y, behavior: 'instant' })
  }, name.y)
  const section = page.locator('#how-it-works')
  const wire = (id: string) => section.locator(`[data-wire="${id}"]`).first()
  await expect(wire('headline')).toBeVisible({ timeout: 15_000 })
  await expect(wire('mark-logo')).toBeVisible({ timeout: 15_000 })
  await expect(wire('photo')).toBeHidden()
})

test.describe('under reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test("the plain list reads in /start's order under the finished sketch", async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-motion', '')
    const section = page.locator('#how-it-works')
    await expect(section.locator('[data-dock]')).toHaveCount(0)
    await expect(section.locator('[data-stages] h3')).toHaveText(TITLES)
    await expect(section.getByText(/^Question \d of 5$/)).toHaveText('Question 5 of 5')
  })
})
