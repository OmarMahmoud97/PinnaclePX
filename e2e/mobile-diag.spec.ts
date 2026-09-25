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

const KEYS = [
  'position',
  'bottom',
  'height',
  'minHeight',
  'paddingTop',
  'paddingBottom',
  'marginTop',
  'marginBottom',
  'whiteSpace',
  'fontFamily',
  'fontSize',
  'lineHeight',
  'display',
  'flexWrap',
] as const

function dump(page: Page): Promise<string> {
  return page.evaluate((keys) => {
    const rows: string[] = []
    const main = document.querySelector('main#main')
    const ask = document.querySelector('.start-ask')
    if (main === null || ask === null) return 'missing main or ask'
    const props = (style: CSSStyleDeclaration) =>
      keys.map((key) => `${key}=${style[key].replace(/"/g, '').slice(0, 22)}`).join(' ')
    const describe = (el: Element, depth: number, full: boolean) => {
      const box = el.getBoundingClientRect()
      if (box.height === 0 || box.top < 380) return
      const style = getComputedStyle(el)
      const ownText = Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => (node.textContent ?? '').trim())
        .join(' ')
        .trim()
      const id = el.id === '' ? '' : `#${el.id}`
      const name = `${el.tagName.toLowerCase()}${id}.${Array.from(el.classList).slice(0, 4).join('.')}`
      const text = ownText === '' ? '' : ` txt="${ownText.slice(0, 40)}"`
      const detail = full
        ? props(style)
        : `ff=${style.fontFamily.replace(/"/g, '').slice(0, 20)} fs=${style.fontSize} lh=${style.lineHeight}`
      rows.push(
        `${'  '.repeat(depth)}${name} top=${box.top.toFixed(1)} h=${box.height.toFixed(1)} w=${box.width.toFixed(0)} ${detail}${text}`,
      )
      if (full) {
        for (const pseudo of ['::before', '::after']) {
          const ps = getComputedStyle(el, pseudo)
          if (ps.content !== 'none' && ps.content !== '')
            rows.push(
              `${'  '.repeat(depth + 1)}${pseudo} ${props(ps)} content=${ps.content.slice(0, 12)}`,
            )
        }
      }
      if (depth < 9) for (const child of Array.from(el.children)) describe(child, depth + 1, full)
    }
    describe(main, 0, false)
    rows.push('===== ASK SUBTREE =====')
    describe(ask, 0, true)
    const askBox = ask.getBoundingClientRect()
    return [
      `inner=${String(window.innerWidth)}x${String(window.innerHeight)} scrollY=${String(window.scrollY)} fontsStatus=${document.fonts.status}`,
      `askTop=${askBox.top.toFixed(1)} askH=${askBox.height.toFixed(1)}`,
      ...rows,
    ].join('\n')
  }, KEYS)
}

test.describe('diag on a 390 by 664 phone', () => {
  test.use({ viewport: { width: 390, height: 664 } })

  test('q5 layout stack', async ({ page }) => {
    await withDraft(page, { reached: 4 })
    await page.goto('/start?q=5')
    await expect(page.locator('main#main h1')).toBeFocused()
    await settle(page)
    console.log(`\n===== q5 ON ARRIVAL =====\n${await dump(page)}\n`)
  })
})
