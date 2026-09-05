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
