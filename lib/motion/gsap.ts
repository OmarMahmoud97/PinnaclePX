import 'client-only'
import type { gsap } from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

export type Gsap = typeof gsap
export type ScrollTriggerStatic = typeof ScrollTrigger

let loading: Promise<Gsap> | undefined

// The one way to load GSAP: a cached dynamic import, so it is a separate chunk that is never in
// the server bundle or the initial script tags. Only lib/motion may import gsap (ESLint).
export function loadGsap(): Promise<Gsap> {
  loading ??= import('gsap').then((core) => core.gsap)
  return loading
}

export type ScrollMotion = Readonly<{ gsap: Gsap; ScrollTrigger: ScrollTriggerStatic }>

let loadingScroll: Promise<ScrollMotion> | undefined

// ScrollTrigger behind the same loader (ADR 0034): the core and the plugin are lazy chunks, the
// plugin is registered once, and ignoreMobileResize keeps a phone's address bar from refreshing
// every trigger as it hides and shows. The walkthrough keeps loadGsap alone; the page's scroll
// choreography (app/_components/page-choreography.tsx) is the one caller of this.
export function loadScrollTrigger(): Promise<ScrollMotion> {
  loadingScroll ??= Promise.all([loadGsap(), import('gsap/ScrollTrigger')]).then(
    ([core, plugin]) => {
      core.registerPlugin(plugin.ScrollTrigger)
      plugin.ScrollTrigger.config({ ignoreMobileResize: true })
      return { gsap: core, ScrollTrigger: plugin.ScrollTrigger }
    },
  )
  return loadingScroll
}
