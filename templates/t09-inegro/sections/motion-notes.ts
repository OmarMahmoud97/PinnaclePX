// The source's travelling cards. When the band's foot reaches the screen's, the cards set out
// one after another along the two ribbons (the first, third on the yellow; the second and last
// on the purple): each fades in over 2s while moving from the ribbon's start to 0.21 of its
// length, rests 10s, then fades out over 1.5s while moving on to half its length, and the next
// sets out; the last stays. All of it runs at an even pace, as the source's did. A light sweeps
// once along the purple ribbon over 2s on a sine after the first card arrives. A card's centre
// sits on the ribbon, measured along the drawn path, as GSAP's motion path placed it. As GSAP
// did, the ribbons' place in the band and the cards' sizes are measured once, when the run
// begins (and again on a resize), and a frame writes only what has changed: nothing while a card
// rests.

const IN = 2
const REST = 10
const OUT = 1.5
const STOP = 0.21
const LEAVE = 0.5
const SWEEP = 2

// GSAP's sine.inOut.
const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

type Card = {
  el: HTMLElement
  path: SVGGeometryElement
  length: number
  start: number
  width: number
  height: number
  share: number
  transform: string
  opacity: string
  nudge: number
}

type Frame = { a: number; b: number; c: number; d: number; e: number; f: number }

export function travelNotes(root: Element): () => void {
  const band = root.querySelector<HTMLElement>('.inegro-notes')
  const svg = band?.querySelector('svg')
  const yellow = band?.querySelector<SVGGeometryElement>('[data-ribbon="yellow"]')
  const purple = band?.querySelector<SVGGeometryElement>('[data-ribbon="purple"]')
  const pulse = band?.querySelector('#inegro-note-pulse')
  if (!band || !svg || !yellow || !purple) return () => undefined

  const els = [...band.querySelectorAll<HTMLElement>('[data-note]')]
  let at = 0
  const cards: Card[] = els.map((el, index) => {
    const path = index % 2 === 0 ? yellow : purple
    const card = {
      el,
      path,
      length: path.getTotalLength(),
      start: at,
      width: 0,
      height: 0,
      share: Number.NaN,
      transform: '',
      opacity: '0',
      nudge: 0,
    }
    at += IN + REST + OUT
    return card
  })
  const last = cards.at(-1)
  if (last === undefined) return () => undefined

  // The script takes the cards over: the last no longer rests where the stylesheet put it.
  for (const card of cards) {
    delete card.el.dataset.rest
    card.el.style.opacity = '0'
  }

  // Each ribbon's drawing units to the band's pixels, and each card's size and nudge: how far its
  // resting point must move for the card to rest inside the band, nothing wherever it fits.
  const frames = new Map<SVGGeometryElement, Frame>()
  const measure = () => {
    const box = band.getBoundingClientRect()
    for (const ribbon of [yellow, purple]) {
      const m = ribbon.getScreenCTM()
      if (m === null) continue
      frames.set(ribbon, { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e - box.left, f: m.f - box.top })
    }
    for (const card of cards) {
      card.width = card.el.offsetWidth
      card.height = card.el.offsetHeight
      card.share = Number.NaN
      const m = frames.get(card.path)
      if (m === undefined) continue
      const rest = card.path.getPointAtLength(STOP * card.length)
      const centred = m.a * rest.x + m.c * rest.y + m.e - card.width / 2
      const inside = Math.min(Math.max(0, centred), Math.max(0, box.width - card.width))
      card.nudge = inside - centred
    }
  }

  const fade = (card: Card, opacity: number) => {
    const value = String(opacity)
    if (value === card.opacity) return
    card.opacity = value
    card.el.style.opacity = value
  }

  // A card's centre on its ribbon at a share of the ribbon's length. On a narrow phone the
  // ribbon's resting point is nearer the edge than half a card, so the card is nudged in by as
  // much as it needs to rest inside the band, the nudge growing over its arrival and shrinking
  // over its departure; wherever it fits there is no nudge and it travels as the source's did,
  // in from beyond the band's side and out past the other.
  const place = (card: Card, share: number, opacity: number) => {
    fade(card, opacity)
    const m = frames.get(card.path)
    if (share === card.share || m === undefined) return
    card.share = share
    const point = card.path.getPointAtLength(share * card.length)
    const weight = share <= STOP ? share / STOP : Math.max(0, 1 - (share - STOP) / (LEAVE - STOP))
    const x = m.a * point.x + m.c * point.y + m.e - card.width / 2 + card.nudge * weight
    const y = m.b * point.x + m.d * point.y + m.f - card.height / 2
    const transform = `translate(${String(x)}px, ${String(y)}px)`
    if (transform === card.transform) return
    card.transform = transform
    card.el.style.transform = transform
  }

  let swept = -1
  const sweep = (t: number) => {
    if (pulse === null || pulse === undefined) return
    const eased = sine(Math.min(1, Math.max(0, t / SWEEP)))
    if (eased === swept) return
    swept = eased
    pulse.setAttribute('x1', `${String(-10 + 110 * eased)}%`)
    pulse.setAttribute('x2', `${String(120 * eased)}%`)
  }

  const paint = (elapsed: number) => {
    for (const card of cards) {
      const t = elapsed - card.start
      if (t < 0) {
        fade(card, 0)
        continue
      }
      if (t < IN) place(card, (STOP * t) / IN, t / IN)
      else if (t < IN + REST || card === last) place(card, STOP, 1)
      else if (t < IN + REST + OUT) {
        const k = (t - IN - REST) / OUT
        place(card, STOP + (LEAVE - STOP) * k, 1 - k)
      } else fade(card, 0)
    }
    if (elapsed >= IN) sweep(elapsed - IN)
  }

  let frame = 0
  let began = 0
  let finished = false
  const tick = (now: number) => {
    const elapsed = (now - began) / 1000
    paint(elapsed)
    if (elapsed < last.start + IN || elapsed < IN + SWEEP) frame = requestAnimationFrame(tick)
    else finished = true
  }

  const check = () => {
    if (began !== 0) return
    if (band.getBoundingClientRect().bottom > window.innerHeight) return
    began = performance.now()
    measure()
    window.removeEventListener('scroll', check)
    frame = requestAnimationFrame(tick)
  }
  // A new layout moves the ribbons: the cards are measured again and placed afresh, and once the
  // run is over the last card keeps its place on its ribbon.
  const onResize = () => {
    if (began === 0) return
    measure()
    if (finished) place(last, STOP, 1)
  }

  check()
  window.addEventListener('scroll', check, { passive: true })
  window.addEventListener('resize', onResize)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', check)
    window.removeEventListener('resize', onResize)
  }
}
