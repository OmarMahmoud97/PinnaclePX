import { expect, type Locator, type Page } from '@playwright/test'
import sharp from 'sharp'
import { QUESTION_IDS } from '@/lib/brief/question-ids'

// What the live draft's specs share (docs/start-page-journey-plan.md, package P6): moving on a
// question, waiting for the page to come to rest, and measuring how much of a box an answer or a
// Next changes.

// The question's own Next, done once question `to` (counted from 1) has rendered, the draft with
// it: the address moves before the flow renders the question it names. It never presses the last
// question's ask, which would send the brief.
export async function next(page: Page, to: number): Promise<void> {
  if (to < 2 || to > QUESTION_IDS.length) throw new Error(`no Next leads to question ${String(to)}`)
  await page.locator('main form').getByRole('button', { name: /^Next/ }).click()
  await expect(page).toHaveURL(new RegExp(`q=${String(to)}$`))
  const id = QUESTION_IDS[to - 1] ?? ''
  await expect(page.locator(`main form[data-question="${id}"]`)).toBeVisible()
}

// Every finite animation and transition on the page has ended, and the fonts are in.
export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready
    for (let round = 0; round < 4; round += 1) {
      const running = document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            animation.effect?.getComputedTiming().endTime !== Infinity,
        )
      if (running.length === 0) return
      await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)))
    }
  })
}

type Pixels = Readonly<{ data: Buffer; width: number; height: number; channels: number }>

// A box's pixels, from a page shot clipped to it: a locator's own shot drops the phone's coarse
// pointer in Chromium, so a page shot is what shows the box as the visitor sees it.
export async function pixels(page: Page, locator: Locator): Promise<Pixels> {
  const box = await locator.boundingBox()
  if (box === null) throw new Error('nothing to shoot')
  const png = await page.screenshot({ clip: box })
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height, channels: info.channels }
}

// The share of a box that changed between two shots of it: the pixels whose three channels moved
// by more than 30 together, the measure the plan's audit took (section 1, row 2).
export function changed(before: Pixels, after: Pixels): number {
  const width = Math.min(before.width, after.width)
  const height = Math.min(before.height, after.height)
  let moved = 0
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = (y * before.width + x) * before.channels
      const b = (y * after.width + x) * after.channels
      let sum = 0
      for (let channel = 0; channel < 3; channel += 1) {
        sum += Math.abs((before.data[a + channel] ?? 0) - (after.data[b + channel] ?? 0))
      }
      if (sum > 30) moved += 1
    }
  }
  return moved / (width * height)
}
