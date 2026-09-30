// The source's ring. Its drift and turn (inegro.css) start when the block's top reaches the
// middle of the screen. Its three lines cycle on their own clock, from three seconds after
// load: each line's letters light a tenth of a second apart from a second into its turn, the
// whole line holds for two seconds, then fades over a second and a half (GSAP's power1.out),
// and the next begins; after the third the cycle starts again with every line dark.

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
    const count = el.querySelectorAll('.inegro-lit-char').length
    return { el, count, span: LEAD + STEP * Math.max(0, count - 1) + HOLD + FADE }
  })
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

  const paint = (elapsed: number) => {
    if (elapsed < 0 || cycle === 0) return
    let t = elapsed % cycle
    for (const line of lines) {
      if (t < 0 || t >= line.span) {
        line.el.style.setProperty('--lit', '0')
        line.el.style.opacity = '1'
      } else {
        const lit = t < LEAD ? 0 : Math.min(line.count, Math.floor((t - LEAD) / STEP + 1e-6) + 1)
        line.el.style.setProperty('--lit', String(lit))
        const fadeAt = line.span - FADE
        line.el.style.opacity = t < fadeAt ? '1' : String(1 - power1((t - fadeAt) / FADE))
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
  for (const line of lines) line.el.style.setProperty('--lit', '0')

  return () => {
    observer.disconnect()
    watch.disconnect()
    cancelAnimationFrame(frame)
  }
}
