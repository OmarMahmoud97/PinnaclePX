// The source's stacking: each glass card is followed by a block that starts tucked 165px up
// under it and slides down into place over the 550px of scroll after the card's foot reaches the
// screen's, at three tenths of the scroll's speed, so it seems to come out from under the card.
// The source's script left a block where it was if the page jumped past; this clamps instead.

const RUN = 550
const RATE = 0.3

// The distance from the page's top to an element's top, from layout alone, so the shift the
// script sets never feeds back into where it measures.
export function pageTop(el: HTMLElement): number {
  let top = 0
  let node: HTMLElement | null = el
  while (node !== null) {
    top += node.offsetTop
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null
  }
  return top
}

export function stackCards(root: Element): () => void {
  const pairs = [...root.querySelectorAll<HTMLElement>('[data-stack="prev"]')].flatMap((card) => {
    const next = card.nextElementSibling
    return next instanceof HTMLElement && next.dataset.stack === 'row' ? [{ card, next }] : []
  })
  if (pairs.length === 0) return () => undefined

  // The screen's height as the source measured it, once at load, so a phone's toolbar showing or
  // hiding does not move the runs; a change of width is a real resize and measures it again.
  let vw = window.innerWidth
  let vh = window.innerHeight
  const shifts = pairs.map(() => '')

  // Every block's place is read before any is moved, so a frame lays the page out once, and a
  // block is moved only when its shift changes, as the source moved it only inside its run.
  let frame = 0
  const paint = () => {
    frame = 0
    const y = window.scrollY
    const values = pairs.map(({ card }) => {
      const start = pageTop(card) + card.offsetHeight - vh
      const past = Math.min(RUN, Math.max(0, y - start))
      return `translateY(${String(-RATE * Math.round(RUN - past))}px)`
    })
    pairs.forEach(({ next }, index) => {
      const value = values[index] ?? ''
      if (value === shifts[index]) return
      shifts[index] = value
      next.style.transform = value
    })
  }
  const request = () => {
    if (frame === 0) frame = requestAnimationFrame(paint)
  }
  const onResize = () => {
    if (window.innerWidth !== vw) {
      vw = window.innerWidth
      vh = window.innerHeight
    }
    request()
  }
  paint()
  window.addEventListener('scroll', request, { passive: true })
  window.addEventListener('resize', onResize)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', request)
    window.removeEventListener('resize', onResize)
    for (const { next } of pairs) next.style.transform = ''
  }
}
