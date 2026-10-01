import { pageTop } from './motion-stack'

// The source's letters: each glass card's paragraph starts at three tenths of the light and
// its letters turn to the full light one after another as the page scrolls, from when the
// card's top reaches the middle of the screen until the page has gone on by the card's
// content height and half a screen more. The source tied this to the scroll with a lag of 0.75s
// (GSAP's scrub, a tween on an expo curve restarted at every scroll step, chasing the scroll),
// and once every letter was lit it stayed lit. Each frame marks lit only the letters the chase
// has newly reached, or unmarks those it has left, as GSAP set the colour only on the letters
// whose tween had moved: a frame restyles a letter or two, not the paragraph's hundreds.

const LAG = 0.75
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
const clamp = (v: number) => Math.min(1, Math.max(0, v))

type Item = {
  block: HTMLElement
  glass: HTMLElement
  chars: HTMLElement[]
  shown: number
  start: number
  end: number
  value: number
  target: number
  from: number
  at: number
  done: boolean
}

export function lightLetters(root: Element): () => void {
  const items: Item[] = [...root.querySelectorAll<HTMLElement>('[data-lit]')].flatMap((text) => {
    const block = text.closest<HTMLElement>('[data-stack="prev"]')
    const glass = text.closest<HTMLElement>('.inegro-glass')
    if (block === null || glass === null) return []
    return [
      {
        block,
        glass,
        chars: [...text.querySelectorAll<HTMLElement>('.inegro-lit-char')],
        shown: 0,
        start: 0,
        end: 0,
        value: 0,
        target: 0,
        from: 0,
        at: 0,
        done: false,
      },
    ]
  })
  if (items.length === 0) return () => undefined

  const paint = (item: Item) => {
    const shown = Math.floor(item.value * item.chars.length)
    for (let i = item.shown; i < shown; i++) item.chars[i]?.classList.add('is-lit')
    for (let i = shown; i < item.shown; i++) item.chars[i]?.classList.remove('is-lit')
    item.shown = shown
    // Every letter now holds its own light, so the paragraph is left alone: recolouring it would
    // restyle all its letters again for no change on the screen.
    if (item.value >= 1) item.done = true
  }

  // The lines, measured once at load as the source measured them: the screen's height then and
  // the card's content height.
  const vh = window.innerHeight
  const measure = () => {
    for (const item of items) {
      const style = getComputedStyle(item.glass)
      const inner =
        item.glass.clientHeight -
        Number.parseFloat(style.paddingTop) -
        Number.parseFloat(style.paddingBottom)
      item.start = pageTop(item.block) - vh / 2
      item.end = item.start + inner + vh / 2
    }
  }

  // Each frame does what GSAP's ticker did: first the running chase is carried on to this
  // frame's time, then the scroll is read, and a new target restarts the chase from where it now
  // stands. So a smooth scroll that moves every frame still moves the letters by a frame's worth
  // every frame; restarting before carrying on would hold them still until the scroll stopped.
  let frame = 0
  const tick = (now: number) => {
    frame = 0
    const y = window.scrollY
    let active = false
    for (const item of items) {
      if (item.done) continue
      if (item.value !== item.target) {
        const t = clamp((now - item.at) / (LAG * 1000))
        item.value = t >= 1 ? item.target : item.from + (item.target - item.from) * expoOut(t)
      }
      const target = clamp((y - item.start) / (item.end - item.start))
      if (target !== item.target) {
        item.target = target
        item.from = item.value
        item.at = now
      }
      paint(item)
      if (item.value !== item.target) active = true
    }
    if (active) frame = requestAnimationFrame(tick)
  }
  const onScroll = () => {
    if (frame === 0) frame = requestAnimationFrame(tick)
  }
  const onResize = () => {
    measure()
    onScroll()
  }

  measure()
  for (const item of items) paint(item)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  }
}
