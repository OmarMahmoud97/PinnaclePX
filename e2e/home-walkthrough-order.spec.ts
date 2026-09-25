import { expect, type Locator, type Page, test } from '@playwright/test'
import { QUESTIONS } from '@/app/start/_components/start-copy'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { refuseSends } from './helpers/start'

// The home walkthrough in /start's order (docs/start-page-journey-plan.md, D29 and 8.1, package
// P4). Its five steps are the questionnaire's five headings, in the questionnaire's order, and
// each paints its own answer into the example brand's phone as it passes the frame: the
// sentence; the name, then the logo; the look; the colour; and the send, halfway down which the
// page is built. The progress line counts the step being painted, one element throughout. This
// replaces home.spec.ts's walkthrough test, which walked the old order. Nothing here sends a
// brief.

const TITLES = QUESTION_IDS.map((id) => QUESTIONS[id].title)
const BUILT_HEADLINE = 'Gardens that grow with you.'

type Stop = Readonly<{ stages: string; progress: string; built: boolean; y: number }>

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

function section(page: Page): Locator {
  return page.locator('#how-it-works')
}

function wire(page: Page, name: string): Locator {
  return section(page).locator(`[data-wire="${name}"]`).first()
}

// Walks the section 20 px at a time, as a reader scrolls, and lists the stops on the way: the
// step being painted (its data-stages), what the progress line says, whether the caption says the
// page is built, and a scroll position in the middle of the stretch the stop holds for, so a
// visit there is clear of either edge.
async function walk(page: Page): Promise<Stop[]> {
  await expect(page.locator('html')).toHaveAttribute('data-motion', '')
  return page.evaluate(async (builtCaption) => {
    const root = document.getElementById('how-it-works')
    if (root === null) return []
    // Two frames: the track reads the scroll in the first and writes its stop by the second.
    const settle = () =>
      new Promise<void>((done) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            done()
          })
        })
      })
    const runs: {
      key: string
      stages: string
      progress: string
      built: boolean
      from: number
      to: number
    }[] = []
    const top = root.getBoundingClientRect().top + scrollY
    for (let y = top - innerHeight; y < top + root.offsetHeight; y += 20) {
      // Instant: the page scrolls smoothly by CSS until Lenis has taken over.
      scrollTo({ top: y, behavior: 'instant' })
      await settle()
      const step = root.querySelector<HTMLElement>('[data-current]')
      if (step === null) continue
      const stages = step.dataset.stages ?? ''
      const progress =
        [...root.querySelectorAll('span')]
          .map((span) => span.textContent)
          .find((text) => /^Question \d of \d$/.test(text)) ?? ''
      const built = root.textContent.includes(builtCaption)
      const key = `${stages}|${progress}|${String(built)}`
      const last = runs.at(-1)
      if (last?.key === key) last.to = y
      else runs.push({ key, stages, progress, built, from: y, to: y })
    }
    return runs.map(({ stages, progress, built, from, to }) => ({
      stages,
      progress,
      built,
      y: Math.round((from + to) / 2),
    }))
  }, SKETCH_CAPTION.walkthroughBuilt)
}

async function visit(page: Page, stop: Stop | undefined): Promise<void> {
  if (stop === undefined) throw new Error('The walk missed a stop.')
  await page.evaluate((y) => {
    scrollTo({ top: y, behavior: 'instant' })
  }, stop.y)
  const progress = section(page).getByText(/^Question \d of 5$/)
  await expect(progress).toHaveCount(1)
  await expect(progress).toHaveText(stop.progress)
}

test("the walkthrough's steps are /start's questions, in its order", async ({ page }) => {
  await page.goto('/')
  await expect(section(page).locator('[data-stages] h3')).toHaveText(TITLES)
})

test('each step is counted as its question, on one progress line, and the send builds the page', async ({
  page,
}) => {
  await page.goto('/')
  const stops = await walk(page)
  expect(stops.map(({ stages, progress, built }) => ({ stages, progress, built }))).toEqual([
    { stages: '1', progress: 'Question 1 of 5', built: false },
    { stages: '2', progress: 'Question 2 of 5', built: false },
    { stages: '3', progress: 'Question 3 of 5', built: false },
    { stages: '4', progress: 'Question 4 of 5', built: false },
    { stages: '5 6', progress: 'Question 5 of 5', built: false },
    { stages: '5 6', progress: 'Question 5 of 5', built: true },
  ])
})

// The frame is read once GSAP has arrived, so each check waits out a glide; the stops are visited
// in order, then the page goes back above the section and the frame empties again.
test("the frame paints each step's answer as it passes, and unpaints on the way back", async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto('/')
  const stops = await walk(page)
  const slow = { timeout: 15_000 }
  const builtHeadline = section(page).getByText(BUILT_HEADLINE)

  // The sentence types in alone.
  await visit(page, stops[0])
  await expect(wire(page, 'paragraph')).toBeVisible(slow)
  await expect(wire(page, 'headline')).toBeHidden(slow)
  await expect(wire(page, 'mark-logo')).toBeHidden()

  // Put your name on it: the name, then the logo, on one stop.
  await visit(page, stops[1])
  await expect(wire(page, 'headline')).toBeVisible(slow)
  await expect(wire(page, 'mark-logo')).toBeVisible(slow)
  await expect(wire(page, 'photo')).toBeHidden()

  // Pick a look: the photographs.
  await visit(page, stops[2])
  await expect(wire(page, 'photo')).toBeVisible(slow)
  await expect(wire(page, 'glow')).toBeHidden()

  // Choose a colour: the colour and its glow.
  await visit(page, stops[3])
  await expect(wire(page, 'glow')).toBeVisible(slow)

  // Where should we send them: the finished sketch holds while the step is read, then the page
  // is built halfway down it.
  await visit(page, stops[4])
  await expect(section(page).getByText(SKETCH_CAPTION.walkthrough)).toBeVisible()
  await expect(builtHeadline).toBeHidden(slow)
  await visit(page, stops[5])
  await expect(section(page).getByText(SKETCH_CAPTION.walkthroughBuilt)).toBeVisible()
  await expect(builtHeadline).toBeVisible(slow)
  await expect(wire(page, 'headline-slot')).toBeHidden()

  await page.locator('#included').scrollIntoViewIfNeeded()
  await expect(section(page).getByText('Question 1 of 5')).toBeVisible()
  await expect(wire(page, 'headline-slot')).toBeVisible(slow)
  await expect(builtHeadline).toBeHidden()
})

// The screen reader hears the example brief in the walkthrough's own words and order, one step at
// a time, never the questionnaire's.
test('the brief in words follows the steps', async ({ page }) => {
  await page.goto('/')
  const stops = await walk(page)
  const words = section(page).getByText(/^An example brief so far/)
  await visit(page, stops[0])
  await expect(words).toHaveText('An example brief so far: Sentence.')
  await visit(page, stops[1])
  await expect(words).toHaveText('An example brief so far: Sentence, Fernbrook Gardens, logo.')
  await visit(page, stops[4])
  await expect(words).toHaveText(
    'An example brief so far: Sentence, Fernbrook Gardens, logo, Warm and natural, 4 photos, Forest, Your details.',
  )
  // Back at the top of the page, the frame is empty again, and so is the brief.
  await page.evaluate(() => {
    scrollTo({ top: 0, behavior: 'instant' })
  })
  await expect(words).toHaveText('An example brief so far is empty.')
})
