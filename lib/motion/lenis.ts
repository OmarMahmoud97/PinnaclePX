import 'client-only'
import type Lenis from 'lenis'

export type LenisClass = typeof Lenis

let loading: Promise<LenisClass> | undefined

// The one way to load Lenis: a cached dynamic import, so it is a separate chunk that is never in
// the server bundle or the initial script tags. Only lib/motion may import lenis (ESLint).
export function loadLenis(): Promise<LenisClass> {
  loading ??= import('lenis').then((module) => module.default)
  return loading
}

// The instance driving the page, while there is one. The SmoothScroll leaf registers it when it
// starts and clears it when it is destroyed.
let active: Lenis | undefined

export function setActiveLenis(instance: Lenis | undefined): void {
  active = instance
}

// Takes the page to the top. Through Lenis while it runs, because a native scroll that lands
// mid-glide is overwritten on its next frame; natively otherwise, where the CSS decides whether
// the move is smooth.
export function scrollToTop(): void {
  if (active === undefined) window.scrollTo({ top: 0 })
  else active.scrollTo(0, { force: true })
}
