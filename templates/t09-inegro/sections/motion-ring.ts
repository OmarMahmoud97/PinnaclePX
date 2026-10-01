// The source's ring. Its drift and turn (inegro.css) start when the block's top reaches the
// middle of the screen. Its three lines cycle on their own clock, from three seconds after
// load: each line's letters light a tenth of a second apart from a second into its turn, the
// whole line holds for two seconds, then fades over a second and a half (GSAP's power1.out),
// and the next begins; after the third the cycle starts again with every line dark. As GSAP
// set each letter's colour once, a frame marks lit or unlit only the letters that change and
// writes a line's opacity only while it fades.

const FIRST = 3
const LEAD = 1
const STEP = 0.1
const HOLD = 2
const FADE = 1.5

const power1 = (t: number) => 1 - (1 - t) ** 2

export function runRing(root: Element): () => void {
  const ring = root.querySelector<HTMLElement>('[data-ring]')
  const block = ring?.closest<HTMLElement>('.inegro-process')
  if (!ring || !block) return () => undefined
  const lines = [...ring.querySelectorAll<HTMLElement>('[data-ring-line]')].map((el) => {
    const chars = [...el.querySelectorAll<HTMLElement>('.inegro-lit-char')]
    const span = LEAD + STEP * Math.max(0, chars.length - 1) + HOLD + FADE
    return { el, chars, span, shown: 0, opacity: '1' }
  })
  type Line = (typeof lines)[number]
  const cycle = lines.reduce((sum, line) => sum + line.span, 0)

  // The drift starts once, when the block's top is past the middle of the screen.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          ring.dataset.running = ''
          observer.disconnect()
        }
      }
    },
    { rootMargin: '0px 0px -50% 0px' },
  )
  observer.observe(block)

  const set = (line: Line, shown: number, opacity: string) => {
    for (let i = line.shown; i < shown; i++) line.chars[i]?.classList.add('is-lit')
    for (let i = shown; i < line.shown; i++) line.chars[i]?.classList.remove('is-lit')
    line.shown = shown
    if (opacity !== line.opacity) {
      line.opacity = opacity
      line.el.style.opacity = opacity
    }
  }

  const paint = (elapsed: number) => {
    if (elapsed < 0 || cycle === 0) return
    let t = elapsed % cycle
    for (const line of lines) {
      if (t < 0 || t >= line.span) {
        set(line, 0, '1')
      } else {
        const count = line.chars.length
        const lit = t < LEAD ? 0 : Math.min(count, Math.floor((t - LEAD) / STEP + 1e-6) + 1)
        const fadeAt = line.span - FADE
        set(line, lit, t < fadeAt ? '1' : String(1 - power1((t - fadeAt) / FADE)))
      }
      t -= line.span
    }
  }

  // The clock runs from load; the lines are painted only while the ring is on the screen.
  const began = performance.now() + FIRST * 1000
  let frame = 0
  let visible = false
  const tick = (now: number) => {
    paint((now - began) / 1000)
    frame = visible ? requestAnimationFrame(tick) : 0
  }
  const watch = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
    if (visible && frame === 0) frame = requestAnimationFrame(tick)
  })
  watch.observe(ring)

  return () => {
    observer.disconnect()
    watch.disconnect()
    cancelAnimationFrame(frame)
  }
}
