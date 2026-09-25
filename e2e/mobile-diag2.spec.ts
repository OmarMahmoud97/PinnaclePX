/* eslint-disable no-console */
import { expect, test } from '@playwright/test'
import { refuseSends, withDraft } from './helpers/start'

// Throwaway: the send button's label against its room at phone widths. Never merged.

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

test('q5 label metrics by width', async ({ page }) => {
  await withDraft(page, { reached: 4 })
  await page.goto('/start?q=5')
  await expect(page.locator('main#main h1')).toBeFocused()
  const lines: string[] = []
  for (const width of [430, 412, 390, 375, 360, 320]) {
    await page.setViewportSize({ width, height: 664 })
    await page.waitForTimeout(400)
    lines.push(
      await page.evaluate((w) => {
        const ask = document.querySelector('.start-ask')
        const button = ask?.querySelector('button') ?? null
        if (ask === null || button === null) return `${String(w)}: no ask`
        const text = Array.from(button.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
        )
        if (text === undefined) return `${String(w)}: no label text`
        const style = getComputedStyle(button)
        const askH = ask.getBoundingClientRect().height
        const buttonH = button.getBoundingClientRect().height
        const range = document.createRange()
        range.selectNodeContents(text)
        const rendered = range.getBoundingClientRect().width
        const before = button.style.whiteSpace
        button.style.whiteSpace = 'nowrap'
        const single = range.getBoundingClientRect().width
        button.style.whiteSpace = before
        const room =
          button.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight) -
          parseFloat(style.columnGap) -
          20
        return `${String(w)}: askH=${askH.toFixed(1)} buttonH=${buttonH.toFixed(1)} clientW=${String(button.clientWidth)} pad=${style.paddingLeft}/${style.paddingRight} gap=${style.columnGap} room=${room.toFixed(2)} labelSingleLine=${single.toFixed(2)} labelRendered=${rendered.toFixed(2)} fw=${style.fontWeight} ls=${style.letterSpacing} fs=${style.fontSize}`
      }, width),
    )
  }
  console.log(`\n===== LABEL METRICS =====\n${lines.join('\n')}\n`)
})
