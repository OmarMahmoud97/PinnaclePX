import 'client-only'

// Safari has no requestIdleCallback, so the type admits its absence.
type MaybeIdle = Partial<Pick<Window, 'requestIdleCallback' | 'cancelIdleCallback'>>

// Runs the callback once the browser is idle or the visitor scrolls, whichever comes first, so
// motion never competes with hydration or the first paint. Returns a cancel function.
export function whenIdle(callback: () => void): () => void {
  let done = false
  const run = () => {
    if (done) return
    done = true
    window.removeEventListener('scroll', run)
    callback()
  }
  window.addEventListener('scroll', run, { once: true, passive: true })
  const { requestIdleCallback, cancelIdleCallback } = window as MaybeIdle
  const idle = requestIdleCallback?.call(window, run, { timeout: 1500 })
  const timer = idle === undefined ? window.setTimeout(run, 200) : undefined
  return () => {
    done = true
    window.removeEventListener('scroll', run)
    if (idle !== undefined) cancelIdleCallback?.call(window, idle)
    if (timer !== undefined) window.clearTimeout(timer)
  }
}

// The signals that a visitor is about to move the page: the wheel and a touch land a frame or
// two before the scroll they cause, and a key can scroll without either.
const INTENT_EVENTS = ['wheel', 'touchstart', 'keydown', 'scroll'] as const

// The keys that scroll the page. Any other key is typing, and typing is not intent: the hero's
// prompt is a textarea, and its first character must not fetch GSAP and ScrollTrigger.
const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '])

// A key counts as intent only when it is one that scrolls and it is not going into a field,
// where the same key edits text instead (a space in the prompt, End on its line).
function isScrollIntent(event: Event): boolean {
  if (!(event instanceof KeyboardEvent)) return true
  if (!SCROLL_KEYS.has(event.key)) return false
  const { target } = event
  if (!(target instanceof HTMLElement)) return true
  return !(target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

// Runs the callback on the first sign of scrolling and never on idle alone: Lighthouse reaches
// idle without ever scrolling, and its script total (lighthouserc.json) must not carry the
// chunks the page's scroll choreography needs (ADR 0034). Returns a cancel function.
export function whenScrolled(callback: () => void): () => void {
  let done = false
  const run = (event: Event) => {
    if (done || !isScrollIntent(event)) return
    done = true
    for (const type of INTENT_EVENTS) window.removeEventListener(type, run)
    callback()
  }
  for (const type of INTENT_EVENTS) window.addEventListener(type, run, { passive: true })
  return () => {
    done = true
    for (const type of INTENT_EVENTS) window.removeEventListener(type, run)
  }
}
