// What lies under the words: the page is screenshotted with every glyph made transparent, so
// each pixel is what a text box sits on (picture, veil, gradient, surface), as painted.
import sharp from 'sharp'
import { levelOf, over, ratio } from './colour.mjs'

const HIDE_TEXT = `
*, *::before, *::after, *::placeholder {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
  text-decoration-color: transparent !important;
  caret-color: transparent !important;
}
[data-check-hidden] { visibility: hidden !important; }
`

// Hide every glyph, and the elements the selector names (gradient text, whose background is its
// glyphs, and stand-in logos), until the returned function puts them back.
export async function hideText(page, alsoHide = '') {
  await page.evaluate((selector) => {
    const style = document.createElement('style')
    style.id = 'check-hide-text'
    style.textContent = window.__hideText
    document.head.append(style)
    const gradient = [...document.querySelectorAll('body *')].filter((el) => {
      const cs = getComputedStyle(el)
      return cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text'
    })
    const named = selector === '' ? [] : [...document.querySelectorAll(selector)]
    for (const el of [...gradient, ...named]) el.setAttribute('data-check-hidden', '')
  }, alsoHide)
  await page.waitForTimeout(50)
  return async () => {
    await page.evaluate(() => {
      document.getElementById('check-hide-text')?.remove()
      for (const el of document.querySelectorAll('[data-check-hidden]')) {
        el.removeAttribute('data-check-hidden')
      }
    })
  }
}

// Colours at rest for the whole measurement. Hiding the glyphs and putting them back changes
// every text's colour, and a text with a colour transition (transition-colors) would fade back
// in over the next screenshots: Meridian's benefit titles were read at 2.11:1 mid-fade and are
// 15.14:1 at rest. With transitions off, every change is whole at once.
const AT_REST = '*, *::before, *::after { transition: none !important; }'

// Ready a page for the measures: transitions off from here on, and the hiding rule kept for
// hideText.
export async function prepareHiding(page) {
  await page.evaluate(
    ({ css, rest }) => {
      window.__hideText = css
      if (document.getElementById('check-at-rest') === null) {
        const style = document.createElement('style')
        style.id = 'check-at-rest'
        style.textContent = rest
        document.head.append(style)
      }
    },
    { css: HIDE_TEXT, rest: AT_REST },
  )
}

// A region of the page as raw RGB: in page coordinates with fullPage, else in the viewport's.
export async function grab(page, clip, fullPage) {
  const x = Math.max(0, Math.floor(clip.left))
  const y = Math.max(0, Math.floor(clip.top))
  const screen = fullPage ? null : page.viewportSize()
  const right =
    screen === null ? Math.ceil(clip.right) : Math.min(screen.width, Math.ceil(clip.right))
  const bottom =
    screen === null ? Math.ceil(clip.bottom) : Math.min(screen.height, Math.ceil(clip.bottom))
  const width = Math.max(1, right - x)
  const height = Math.max(1, bottom - y)
  const png = await page.screenshot({ fullPage, clip: { x, y, width, height } })
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  return { x, y, width: info.width, height: info.height, data }
}

// Each pixel of a text box's rectangles that the region holds: its centre must lie inside.
function* pixelsOf(region, rects) {
  for (const [left, top, right, bottom] of rects) {
    for (let py = Math.ceil(top - 0.5); py + 0.5 <= bottom; py += 1) {
      for (let px = Math.ceil(left - 0.5); px + 0.5 <= right; px += 1) {
        const rx = px - region.x
        const ry = py - region.y
        if (rx < 0 || ry < 0 || rx >= region.width || ry >= region.height) continue
        const i = (ry * region.width + rx) * 3
        yield [region.data[i], region.data[i + 1], region.data[i + 2]]
      }
    }
  }
}

// One text item over the pixels under it: its colours (one, or a gradient's stops) composited at
// its opacity over each pixel, against the level its size needs. The worst ratio, and the share
// of pixels where every colour meets the level.
export function judge(item, region) {
  const level = levelOf(item.size, item.weight)
  let worst = Infinity
  let pass = 0
  let count = 0
  for (const pixel of pixelsOf(region, item.rects)) {
    let pixelWorst = Infinity
    for (const [r, g, b, a] of item.colours) {
      pixelWorst = Math.min(pixelWorst, ratio(over([r, g, b, a * item.opacity], pixel), pixel))
    }
    worst = Math.min(worst, pixelWorst)
    count += 1
    if (pixelWorst >= level) pass += 1
  }
  return {
    level,
    worst: count === 0 ? null : worst,
    share: count === 0 ? null : pass / count,
    pixels: count,
  }
}

// The union of rectangles, for one screenshot that holds them all.
function unionOf(rects) {
  return {
    left: Math.min(...rects.map((r) => r[0])),
    top: Math.min(...rects.map((r) => r[1])),
    right: Math.max(...rects.map((r) => r[2])),
    bottom: Math.max(...rects.map((r) => r[3])),
  }
}

// Each item judged over the pixels under it, read where a visitor sees it. query(keys) asks the
// page for those items as it stands (in-page.mjs, textItems). With walk, the page is scrolled a
// screen at a time from the top, and each item is judged at the first stop where it lies whole
// on the screen with nothing opaque over it; without, it is judged where the page stands (the
// header scrolled, a menu open). An item never seen so is returned with unseen: true.
export async function measureItems(tab, items, query, { walk = true } = {}) {
  const judged = []
  if (items.length === 0) return judged
  const pending = new Map(items.map((item) => [item.key, item]))
  const stops = walk
    ? await tab.evaluate(() => {
        const height = document.documentElement.scrollHeight
        const step = Math.max(200, Math.floor(window.innerHeight * 0.85))
        const ys = []
        for (let y = 0; y < height - window.innerHeight; y += step) ys.push(y)
        ys.push(Math.max(0, height - window.innerHeight))
        return ys
      })
    : [null]
  for (const y of stops) {
    if (pending.size === 0) break
    if (y !== null) {
      await tab.evaluate((top) => window.scrollTo(0, top), y)
      await tab.waitForTimeout(120)
    }
    const here = (await query([...pending.keys()])).filter((i) => i.inView && !i.covered)
    if (here.length === 0) continue
    const scroll = await tab.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))
    const restore = await hideText(tab)
    try {
      for (const section of new Set(here.map((i) => i.section))) {
        const mine = here.filter((i) => i.section === section)
        const box = unionOf(mine.flatMap((i) => i.rects))
        const region = await grab(
          tab,
          {
            left: box.left - scroll.x - 1,
            top: box.top - scroll.y - 1,
            right: box.right - scroll.x + 1,
            bottom: box.bottom - scroll.y + 1,
          },
          false,
        )
        // The region in page coordinates, so the items' rectangles index it directly.
        const placed = { ...region, x: region.x + scroll.x, y: region.y + scroll.y }
        for (const item of mine) {
          // What the first query knew (the picture under it) with where it is now.
          judged.push({
            ...pending.get(item.key),
            rects: item.rects,
            ...judge(item, placed),
            unseen: false,
          })
          pending.delete(item.key)
        }
      }
    } finally {
      await restore()
    }
  }
  if (walk) await tab.evaluate(() => window.scrollTo(0, 0))
  for (const item of pending.values()) {
    judged.push({ ...item, level: null, worst: null, share: null, pixels: 0, unseen: true })
  }
  return judged
}

// An item as a result keeps: everything but its line boxes and colours, which only the
// measurement needs.
export function withoutGeometry(item) {
  const kept = { ...item }
  delete kept.rects
  delete kept.colours
  return kept
}
