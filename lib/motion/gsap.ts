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
