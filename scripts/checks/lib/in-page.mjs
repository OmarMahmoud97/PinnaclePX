// Helpers the checks run inside the page. Playwright sends a function's source to the browser,
// so each one here may use only the page's own globals; installHelpers puts the shared ones on
// window.__checks for the others to call.

export function installHelpers() {
  if (window.__checks !== undefined) return
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })
  // Any CSS colour as 8-bit sRGB and alpha 0 to 1, as the browser resolves it.
  const paint = (css) => {
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = '#000'
    context.fillStyle = css
    context.fillRect(0, 0, 1, 1)
    const d = context.getImageData(0, 0, 1, 1).data
    return [d[0], d[1], d[2], d[3] / 255]
  }
  const opacityOf = (el) => {
    let opacity = 1
    for (let n = el; n !== null && n.nodeType === 1; n = n.parentElement) {
      opacity *= Number(getComputedStyle(n).opacity)
    }
    return opacity
  }
  // Drawn and visible: it has a box, is not hidden, and is not faded to nothing.
  const shown = (el) =>
    el.getClientRects().length > 0 &&
    getComputedStyle(el).visibility === 'visible' &&
    opacityOf(el) > 0.05
  // Declared decorative, or out of use: no reader reaches it.
  const decorative = (el) => el.closest('[aria-hidden="true"], [inert], svg') !== null
  // The visually hidden pattern for screen readers: a box of a pixel or none that clips.
  const srOnly = (el) => {
    for (let n = el; n !== null && n !== document.body; n = n.parentElement) {
      const box = n.getBoundingClientRect()
      const cs = getComputedStyle(n)
      if ((box.width <= 1 || box.height <= 1) && cs.overflow !== 'visible') return true
      if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') return true
    }
    return false
  }
  const ownText = (el) =>
    [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
  const describe = (el) => {
    const classes = (typeof el.className === 'string' ? el.className : '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4)
      .join('.')
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40)
    return `${el.tagName.toLowerCase()}${el.id === '' ? '' : `#${el.id}`}${classes === '' ? '' : `.${classes}`} "${text}"`
  }
  const sectionOf = (el) => {
    const s = el.closest('section, header, footer, nav, aside, dialog')
    if (s === null) return 'page'
    return s.id !== '' ? `#${s.id}` : s.tagName.toLowerCase()
  }
  // A marquee: a short box that clips across and holds copies of the same words side by side,
  // or one copy drawn and another not (Meridian's stands still under reduced motion with its
  // second copy hidden), so its words run past it by design. Text inside one is not measured
  // for fit (scripts/checks/README.md). Copies stacked one over the other, as a button that
  // rolls its label on hover keeps them, are not a marquee.
  const marquees = new WeakMap()
  const isMarquee = (box) => {
    if (marquees.has(box)) return marquees.get(box)
    const cs = getComputedStyle(box)
    let found = false
    if (
      (cs.overflowX === 'hidden' || cs.overflowX === 'clip') &&
      box.getBoundingClientRect().height < 600
    ) {
      const byText = new Map()
      for (const n of box.querySelectorAll('*')) {
        const text = ownText(n)
        if (text.length < 2) continue
        byText.set(text, [...(byText.get(text) ?? []), n])
      }
      found = [...byText.values()].some((copies) => {
        if (copies.length < 2) return false
        const lefts = copies.map((n) =>
          n.getClientRects().length === 0 ? null : Math.round(n.getBoundingClientRect().left),
        )
        return lefts.includes(null) || new Set(lefts).size > 1
      })
    }
    marquees.set(box, found)
    return found
  }
  const marqueeOf = (el) => {
    for (let n = el.parentElement; n !== null && n !== document.body; n = n.parentElement) {
      if (isMarquee(n)) return n
    }
    return null
  }
  // The page's header: the top-most header, else a nav, drawn at the top of the first screen.
  const headerOf = () => {
    const near = (e) => {
      const r = e.getBoundingClientRect()
      return r.height > 0 && r.top < 160 && r.bottom > 0 && r.width > window.innerWidth / 2
    }
    const headers = [...document.querySelectorAll('header')].filter(near)
    if (headers.length > 0) return headers[0]
    const navs = [...document.querySelectorAll('nav')].filter(near)
    return navs.find((n) => n.parentElement?.closest('nav') === null) ?? navs[0] ?? null
  }
  // The rectangles a text node's glyphs occupy, one or more a line.
  const rectsOf = (node) => {
    const range = document.createRange()
    range.selectNodeContents(node)
    return [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5)
  }
  // Every text node a visitor reads, with its element: drawn, not decorative, not visually
  // hidden, not a script's or an option's.
  const readableText = (root = document.body) => {
    const items = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      if (node.textContent.trim() === '') continue
      const el = node.parentElement
      if (el === null) continue
      if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TITLE', 'OPTION'].includes(el.tagName)) continue
      if (!shown(el) || decorative(el) || srOnly(el)) continue
      items.push({ node, el })
    }
    return items
  }
  // The colour classes on an element or its nearest ancestor that has one, such as
  // text-on-surface/75: what a failing text's fix would change.
  const tokensOf = (el) => {
    const colour =
      /^(?:[a-z0-9-]+:)*text-(?:on-|brand|accent|surface|scrim|glow|border)[a-z-]*(?:\/\d+)?$/
    for (let n = el; n !== null && n !== document.body; n = n.parentElement) {
      const found = (typeof n.className === 'string' ? n.className : '')
        .split(/\s+/)
        .filter((c) => colour.test(c))
      if (found.length > 0) return found.join(' ')
    }
    return ''
  }

  // A form field's own text, which no text node holds: an empty field's placeholder, a select's
  // chosen option. Its box is the field's content box.
  const fieldItems = () => {
    const fields = [...document.querySelectorAll('input, textarea, select')].filter(
      (f) =>
        shown(f) &&
        !decorative(f) &&
        !['hidden', 'submit', 'button', 'checkbox', 'radio'].includes(f.type),
    )
    return fields.flatMap((field) => {
      const placeholder = field.tagName !== 'SELECT' && field.value === '' ? field.placeholder : ''
      const text =
        field.tagName === 'SELECT' ? (field.selectedOptions[0]?.textContent ?? '') : placeholder
      if (text.trim() === '') return []
      const cs = getComputedStyle(field, field.tagName === 'SELECT' ? null : '::placeholder')
      const own = getComputedStyle(field)
      const r = field.getBoundingClientRect()
      const left = r.left + parseFloat(own.borderLeftWidth) + parseFloat(own.paddingLeft)
      const top = r.top + parseFloat(own.borderTopWidth) + parseFloat(own.paddingTop)
      const right = r.right - parseFloat(own.borderRightWidth) - parseFloat(own.paddingRight)
      const bottom = r.bottom - parseFloat(own.borderBottomWidth) - parseFloat(own.paddingBottom)
      if (right - left < 1 || bottom - top < 1) return []
      return [
        {
          key: `${sectionOf(field)}|${field.tagName.toLowerCase()} ${text.slice(0, 40)}|0`,
          text: text.slice(0, 60),
          section: sectionOf(field),
          el: `${describe(field)} (${field.tagName === 'SELECT' ? 'chosen option' : 'placeholder'})`,
          tokens: tokensOf(field),
          inView:
            top >= -0.5 &&
            bottom <= window.innerHeight + 0.5 &&
            left >= -0.5 &&
            right <= document.documentElement.clientWidth + 0.5,
          covered: false,
          inHeader: false,
          gradient: false,
          colours: [paint(cs.color)],
          opacity: opacityOf(field),
          size: parseFloat(own.fontSize),
          weight: Number(own.fontWeight),
          rects: [
            [
              left + window.scrollX,
              top + window.scrollY,
              right + window.scrollX,
              bottom + window.scrollY,
            ],
          ],
          picture: null,
        },
      ]
    })
  }
  window.__checks = {
    paint,
    opacityOf,
    shown,
    decorative,
    srOnly,
    ownText,
    describe,
    sectionOf,
    marqueeOf,
    headerOf,
    rectsOf,
    readableText,
    tokensOf,
    fieldItems,
  }
}

// The text items a check measures, each with its colours (one, or a gradient's stops), its
// opacity, its size and weight, its colour classes, and its line boxes in page coordinates.
// keys null: the items a fifth or more of whose lines lie on a picture (an img, canvas or video,
// or a background image; the stand-in logo is not a picture). keys 'all': every item, with each
// form field's placeholder or chosen option as an item too. A list of keys: those items,
// whatever lies under them. scope: page, header (the page's header), or menu (the open panel).
export function textItems({ keys = null, scope = 'page', menuId = null }) {
  const C = window.__checks
  // A picture's slot, from the stand-in's address (app/dev/_render/stand-in.ts), whether it is
  // an img or a CSS background.
  const pictureName = (el) => {
    const source =
      el.tagName === 'IMG' ? el.currentSrc || el.src : getComputedStyle(el).backgroundImage
    const m = /\/dev\/picture\/[a-z0-9]+\/\d+x\d+-([a-z0-9-]+)\.png/.exec(
      decodeURIComponent(source),
    )
    return m === null ? el.tagName.toLowerCase() : m[1]
  }
  const isPicture = (el) =>
    ['IMG', 'CANVAS', 'VIDEO'].includes(el.tagName) ||
    getComputedStyle(el).backgroundImage.includes('url(')
  const pictures =
    keys !== null
      ? []
      : [...document.querySelectorAll('body *')]
          .filter((el) => isPicture(el) && C.shown(el) && pictureName(el) !== 'logo')
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter((p) => p.r.width >= 24 && p.r.height >= 24)
  const header = C.headerOf()
  const panel = scope !== 'menu' ? null : menuId === null ? header : document.getElementById(menuId)
  const counts = new Map()
  const items = []
  for (const { node, el } of C.readableText()) {
    const text = node.textContent.replace(/\s+/g, ' ').trim()
    const section = C.sectionOf(el)
    const base = `${section}|${text.slice(0, 60)}`
    const n = counts.get(base) ?? 0
    counts.set(base, n + 1)
    const key = `${base}|${String(n)}`
    const inHeader = header !== null && header.contains(el)
    if (scope === 'header' && !inHeader) continue
    if (scope === 'menu' && (panel === null || !panel.contains(el))) continue
    const rects = C.rectsOf(node)
    if (rects.length === 0) continue
    let picture = null
    if (keys === 'all') {
      // every item
    } else if (keys === null) {
      picture =
        pictures.find((p) =>
          rects.some((r) => {
            const w = Math.min(r.right, p.r.right) - Math.max(r.left, p.r.left)
            const h = Math.min(r.bottom, p.r.bottom) - Math.max(r.top, p.r.top)
            return w > 0 && h > 0 && (w * h) / (r.width * r.height) >= 0.2
          }),
        ) ?? null
      if (picture === null) continue
    } else if (!keys.includes(key)) continue
    const cs = getComputedStyle(el)
    // Whether a visitor sees it from here: whole on the screen, and with nothing opaque drawn
    // over it (a footer the page reveals by scrolling past lies under the page until then). A
    // clear overlay, such as a link stretched over a card, does not hide it.
    const width = document.documentElement.clientWidth
    const inView = rects.every(
      (r) =>
        r.top >= -0.5 &&
        r.bottom <= window.innerHeight + 0.5 &&
        r.left >= -0.5 &&
        r.right <= width + 0.5,
    )
    const covered = rects.some((r) => {
      const hit = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)
      if (hit === null || el.contains(hit) || hit.contains(el)) return false
      // From what is on top up to the box both share: anything opaque there hides the text.
      for (let n = hit; n !== null && !n.contains(el); n = n.parentElement) {
        if (['IMG', 'CANVAS', 'VIDEO'].includes(n.tagName)) return true
        if (C.paint(getComputedStyle(n).backgroundColor)[3] > 0.5) return true
      }
      return false
    })
    const gradient = cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text'
    const stops =
      cs.backgroundImage.match(/(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g) ?? []
    items.push({
      key,
      text: text.slice(0, 60),
      section,
      el: C.describe(el),
      tokens: C.tokensOf(el),
      inView,
      covered,
      inHeader,
      gradient,
      colours: gradient && stops.length > 0 ? stops.map(C.paint) : [C.paint(cs.color)],
      opacity: C.opacityOf(el),
      size: parseFloat(cs.fontSize),
      weight: Number(cs.fontWeight),
      rects: rects.map((r) => [
        r.left + window.scrollX,
        r.top + window.scrollY,
        r.right + window.scrollX,
        r.bottom + window.scrollY,
      ]),
      picture: picture === null ? null : pictureName(picture.el),
    })
  }
  if (keys === 'all') items.push(...C.fieldItems())
  else if (Array.isArray(keys)) items.push(...C.fieldItems().filter((f) => keys.includes(f.key)))
  return items
}

// Where each stand-in logo is drawn, in page coordinates: the part of its box the mark fills,
// by its object-fit and object-position, so the box's empty margins are not measured.
export function logoBoxes() {
  const C = window.__checks
  const header = C.headerOf()
  return [...document.querySelectorAll('img')]
    .filter(
      (img) => /-logo\.png/.test(decodeURIComponent(img.currentSrc || img.src)) && C.shown(img),
    )
    .map((img) => {
      const r = img.getBoundingClientRect()
      const cs = getComputedStyle(img)
      const natural = { w: img.naturalWidth || 480, h: img.naturalHeight || 160 }
      let w = r.width
      let h = r.height
      if (cs.objectFit === 'contain' || cs.objectFit === 'scale-down') {
        const scale = Math.min(r.width / natural.w, r.height / natural.h)
        w = natural.w * (cs.objectFit === 'scale-down' ? Math.min(scale, 1) : scale)
        h = natural.h * (cs.objectFit === 'scale-down' ? Math.min(scale, 1) : scale)
      }
      const [px, py] = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100)
      const left = r.left + (r.width - w) * (Number.isNaN(px) ? 0.5 : px) + window.scrollX
      const top = r.top + (r.height - h) * (Number.isNaN(py) ? 0.5 : py) + window.scrollY
      const where =
        header !== null && header.contains(img)
          ? 'header'
          : img.closest('footer')
            ? 'footer'
            : 'page'
      return { where, rect: [left, top, left + w, top + h] }
    })
}

// The look's two faces, loaded before anything is measured. They load on demand (fonts.ts sets
// no preload), so the document can report its fonts ready before either has started; a text
// measured in the fallback face can fit where the look's own face does not.
export async function loadFonts() {
  const root = [...document.querySelectorAll('[style]')].find(
    (el) => el.style.getPropertyValue('--template-font-display') !== '',
  )
  if (root !== undefined) {
    for (const name of ['--template-font-display', '--template-font-body']) {
      const family = root.style.getPropertyValue(name)
      if (family === '') continue
      await Promise.all(
        ['400', '700'].map((weight) => document.fonts.load(`${weight} 24px ${family}`)),
      )
    }
  }
  await document.fonts.ready
}

// The page at rest: every running animation or transition that ends has ended (a marquee never
// does, so it is not waited for), at most three seconds, then two frames. On a fresh server a
// page can still be moving when it reports itself loaded, and a measure taken mid-move is wrong.
export async function settle() {
  const ending = document.getAnimations().filter((animation) => {
    const timing = animation.effect?.getTiming?.()
    return (
      timing !== undefined && timing.iterations !== Infinity && animation.playState === 'running'
    )
  })
  await Promise.race([
    Promise.all(ending.map((animation) => animation.finished.catch(() => undefined))),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ])
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

// Whether the page has its style sheet: the app's base styles set the body's margin to 0, which a
// page served without them keeps at the browser's 8px. Unstyled text flows freely, so a measure
// of it would pass everything.
export function isStyled() {
  return document.styleSheets.length > 0 && getComputedStyle(document.body).marginTop === '0px'
}
