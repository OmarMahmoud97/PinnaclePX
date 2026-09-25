import { expect, type Page, test } from '@playwright/test'
import { EDGE_NAMES, refuseSends, withDraft } from './helpers/start'

// Long names on the narrowest phone (docs/start-page-journey-plan.md, 7.7): with a 60-character
// business name that has nowhere to break and a 64-character email, no question from the name on
// shows any text wider than its box, and the page never scrolls sideways. mobile-done.spec.ts
// holds the done view to the same, building and ready. Nothing here sends a brief.

const NAMES = { company: EDGE_NAMES.unbrokenCompany, email: EDGE_NAMES.longEmail }

test.use({ viewport: { width: 320, height: 640 } })

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

// Every visible element in main that holds text of its own and is wider inside than out. Form
// fields scroll their own text, a screen reader's line is clipped by design, and an inline box has
// no width to overflow, so none of those counts.
function overflowing(page: Page) {
  return page.locator('main#main').evaluate((main) => {
    const wide: string[] = []
    for (const element of main.querySelectorAll<HTMLElement>('*')) {
      if (element.matches('input, textarea') || element.closest('.sr-only, [hidden]') !== null) {
        continue
      }
      const ownText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
      )
      if (!ownText || element.getClientRects().length === 0) continue
      if (element.scrollWidth > element.clientWidth + 1) {
        wide.push(`${element.tagName.toLowerCase()}: ${element.textContent.slice(0, 40)}`)
      }
    }
    return wide
  })
}

async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

test('the questions hold a long business name and email', async ({ page }) => {
  await withDraft(page, { ...NAMES, reached: 4 })
  for (const question of [2, 3, 4, 5]) {
    await page.goto(`/start?q=${String(question)}`)
    await expect(page.locator('main#main h1')).toBeFocused()
    await settled(page)
    // The look's and the last question's helpers say the name, so the check has it to hold.
    if (question === 3 || question === 5) {
      await expect(page.locator('main .start-helper')).toContainText(NAMES.company)
    }
    expect(await overflowing(page), `question ${String(question)}`).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  }
})
