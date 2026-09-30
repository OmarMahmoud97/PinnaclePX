// The source's travelling cards. When the band's foot reaches the screen's, the cards set out
// one after another along the two ribbons (the first, third on the yellow; the second and last
// on the purple): each fades in over 2s while moving from the ribbon's start to 0.21 of its
// length, rests 10s, then fades out over 1.5s while moving on to half its length, and the next
// sets out; the last stays. All of it runs at an even pace, as the source's did. A light sweeps
// once along the purple ribbon over 2s on a sine after the first card arrives. A card's centre
// sits on the ribbon, measured along the drawn path, as GSAP's motion path placed it.

const IN = 2
const REST = 10
const OUT = 1.5
const STOP = 0.21
const LEAVE = 0.5
const SWEEP = 2

// GSAP's sine.inOut.
const sine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

type Card = { el: HTMLElement; path: SVGGeometryElement; length: number; start: number }

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
    const card = { el, path, length: path.getTotalLength(), start: at }
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

  // A card's centre on its ribbon at a share of the ribbon's length.
  const place = (card: Card, share: number, opacity: number) => {
    const point = card.path.getPointAtLength(share * card.length)
    const matrix = card.path.getScreenCTM()
    if (matrix === null) return
    const box = band.getBoundingClientRect()
    const x = matrix.a * point.x + matrix.c * point.y + matrix.e - box.left
    const y = matrix.b * point.x + matrix.d * point.y + matrix.f - box.top
    card.el.style.transform = `translate(${String(x - card.el.offsetWidth / 2)}px, ${String(y - card.el.offsetHeight / 2)}px)`
    card.el.style.opacity = String(opacity)
  }

  const sweep = (t: number) => {
    if (pulse === null || pulse === undefined) return
    const eased = sine(Math.min(1, Math.max(0, t / SWEEP)))
    pulse.setAttribute('x1', `${String(-10 + 110 * eased)}%`)
    pulse.setAttribute('x2', `${String(120 * eased)}%`)
  }

  const paint = (elapsed: number) => {
    for (const card of cards) {
      const t = elapsed - card.start
      if (t < 0) {
        card.el.style.opacity = '0'
        continue
      }
      if (t < IN) place(card, (STOP * t) / IN, t / IN)
      else if (t < IN + REST || card === last) place(card, STOP, 1)
      else if (t < IN + REST + OUT) {
        const k = (t - IN - REST) / OUT
        place(card, STOP + (LEAVE - STOP) * k, 1 - k)
      } else card.el.style.opacity = '0'
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
    window.removeEventListener('scroll', check)
    frame = requestAnimationFrame(tick)
  }
  // Once the run is over, the last card keeps its place on its ribbon as the layout changes.
  const onResize = () => {
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
