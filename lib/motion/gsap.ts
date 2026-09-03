import 'client-only'
import type { gsap } from 'gsap'

export type Gsap = typeof gsap

let loading: Promise<Gsap> | undefined

// The one way to load GSAP: a cached dynamic import, so it is a separate chunk that is never in
// the server bundle or the initial script tags. Only lib/motion may import gsap (ESLint).
export function loadGsap(): Promise<Gsap> {
  loading ??= import('gsap').then((core) => core.gsap)
  return loading
}

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
