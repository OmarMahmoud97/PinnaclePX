/* eslint-disable no-console */
import { expect, type Page, test } from '@playwright/test'
import { refuseSends, withDraft } from './helpers/start'

// Throwaway diagnostic for CI's layout at 390 by 664 (PR #41). Never merged.

test.beforeEach(async ({ page }) => {
  await refuseSends(page)
})

async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const { endTime } = animation.effect?.getComputedTiming() ?? {}
      return !Number.isFinite(endTime) || animation.playState !== 'running'
    }),
  )
}

function dump(page: Page, control: string): Promise<string> {
  return page.evaluate((find) => {
    const rows: string[] = []
    const main = document.querySelector('main#main')
    const ask = document.querySelector('.start-ask')
    const found = main?.querySelector(find) ?? null
    if (main === null || ask === null || found === null) return 'missing main, ask or control'
    const limit = found.getBoundingClientRect().top + 1
    const short = (value: string) => value.replace(/"/g, '').slice(0, 28)
    const walk = (parent: Element, depth: number) => {
      if (depth > 9) return
      for (const child of Array.from(parent.children)) {
        const box = child.getBoundingClientRect()
        if (box.height === 0 || box.top > limit) continue
        const style = getComputedStyle(child)
        const ownText = Array.from(child.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => (node.textContent ?? '').trim())
          .join(' ')
          .trim()
        const id = child.id === '' ? '' : `#${child.id}`
        const name = `${child.tagName.toLowerCase()}${id}.${Array.from(child.classList).slice(0, 3).join('.')}`
        const text = ownText === '' ? '' : ` txt="${ownText.slice(0, 32)}"`
        rows.push(
          `${'  '.repeat(depth)}${name} top=${box.top.toFixed(1)} h=${box.height.toFixed(1)} w=${box.width.toFixed(0)} ff=${short(style.fontFamily)} fs=${style.fontSize} lh=${style.lineHeight}${text}`,
        )
        walk(child, depth + 1)
      }
    }
    walk(main, 0)
    const fonts = Array.from(document.fonts)
      .map((face) => `${face.family} ${face.weight} ${face.style} ${face.status}`)
      .join('; ')
    const askBox = ask.getBoundingClientRect()
    const controlBox = found.getBoundingClientRect()
    const env = [
      `ua=${navigator.userAgent}`,
      `inner=${String(window.innerWidth)}x${String(window.innerHeight)} dpr=${String(window.devicePixelRatio)}`,
      `clientW=${String(document.documentElement.clientWidth)} scrollY=${String(window.scrollY)}`,
      `fontsStatus=${document.fonts.status} count=${String(document.fonts.size)}`,
      `clearance=${(askBox.top - controlBox.top).toFixed(3)} askTop=${askBox.top.toFixed(1)} controlTop=${controlBox.top.toFixed(1)}`,
    ]
    return [...env, `fonts: ${fonts}`, ...rows].join('\n')
  }, control)
}

test.describe('diag on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  for (const { question, control } of [
    { question: 1, control: 'textarea' },
    { question: 5, control: 'input[type=email]' },
  ] as const) {
    test(`q${String(question)} layout stack`, async ({ page }) => {
      await withDraft(page, { reached: 4 })
      await page.goto(`/start?q=${String(question)}`)
      await expect(page.locator('main#main h1')).toBeFocused()
      await settle(page)
      const arrival = await dump(page, control)
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(2000)
      await settle(page)
      const later = await dump(page, control)
      console.log(
        `\n===== q${String(question)} ON ARRIVAL =====\n${arrival}\n===== q${String(question)} AFTER fonts.ready + 2 s =====\n${later}\n`,
      )
    })
  }
})
