'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { CONFIG } from '@/lib/config'

// The fixed header and, under it, the surface it stands on once the page has scrolled. Every
// state is an attribute on the wrapper that the CSS reads (`group-data-*`), so nothing
// re-renders, and with JavaScript off the header is exactly the plain one the server sent.
// Height never changes.
//
// Over the hero the header is see-through and blends by difference (ADR 0031): white text minus
// the white page reads black, and over dark ink it stays light. Anything drawn in here is shown
// inverted, so its links change opacity on hover, never colour, and the filled button waits for
// the solid state. Once scrolled, or while the phone menu is open, the header is the plain bar
// it always was: surface, blur, normal blending.
//
// The blend mode cannot animate, so the change is staged rather than snapped. The surface is a
// layer of its own under the header (inside it, a white bar would blend to black too) and fades
// in first; once it is opaque the blend flips, which nobody sees, because white minus a white
// surface was already reading as the header's black; only then does the ask fill with brand
// blue, which the difference blend would have shown as orange. Leaving runs the same steps in
// reverse: the ask empties while the blend is still normal, then the blend flips over the
// still-opaque surface and the surface fades. One attribute per step:
//   data-scrolled  the surface is shown
//   data-solid     the blend is normal and the text is --on-surface
//   data-filled    the ask is the filled button
// one the hero sets as it leaves, data-past-hero, once its own button has scrolled out of the
// top of the viewport (the phone's ask takes over), and one the page below sets, data-over-dark,
// while what runs under the bar is dark (ADR 0034): the hero's own foot, then either of the two
// dark bands, the ink stretch under the hero and the footer. The dark scope in app/globals.css
// reads it only together with data-solid, so the bar and its text swap to the dark set while
// the blend, whose text is already light, never sees a dark surface.
export function HeaderChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (root === null) return
    let step: ReturnType<typeof setTimeout> | undefined
    const then = (next: () => void) => {
      clearTimeout(step)
      step = setTimeout(next, CONFIG.motion.headerStepMs)
    }

    // The three steps, in order on the way in and reversed on the way out. A page that loads
    // already scrolled (a fragment link, a reload) takes the settled state at once.
    const settle = (scrolled: boolean, staged: boolean) => {
      clearTimeout(step)
      if (scrolled) {
        root.setAttribute('data-scrolled', '')
        const solid = () => {
          root.setAttribute('data-solid', '')
          root.setAttribute('data-filled', '')
        }
        if (staged) then(solid)
        else solid()
      } else if (root.hasAttribute('data-solid')) {
        root.removeAttribute('data-filled')
        const clear = () => {
          root.removeAttribute('data-solid')
          root.removeAttribute('data-scrolled')
        }
        if (staged) then(clear)
        else clear()
      } else {
        // Back up before the surface had settled: nothing to unwind, the surface just fades.
        root.removeAttribute('data-scrolled')
      }
    }

    // What is under the bar, read at its middle. Two sources, ORed: any dark band whose box
    // crosses that line, watched by an observer whose root is the one-pixel strip at that
    // height, and the hero's own foot, which is not a band but the ramp's dark end, dark once no
    // more than heroDarkFootShare of the hero is still below the line. The foot check stays true
    // until the hero has left the viewport altogether, so the hand-over to the stretch that
    // follows it, which the observer reports a frame later, never shows a light bar between.
    const hero = document.getElementById('hero')
    const headerPx = root.querySelector('header')?.offsetHeight ?? 0
    const mid = Math.round(headerPx / 2)
    const dark = new Set<Element>()
    const heroDark = () => {
      if (hero === null) return false
      const box = hero.getBoundingClientRect()
      return box.bottom > 0 && box.bottom - mid <= box.height * CONFIG.motion.heroDarkFootShare
    }
    const apply = () => {
      root.toggleAttribute('data-over-dark', dark.size > 0 || heroDark())
    }
    // The strip's margins bake in the viewport height, so the observer is rebuilt once a resize
    // has settled; observing fires for every band at once, which refills the set.
    let bands: IntersectionObserver | undefined
    const watchBands = () => {
      bands?.disconnect()
      dark.clear()
      bands = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) dark.add(entry.target)
            else dark.delete(entry.target)
          }
          apply()
        },
        {
          rootMargin: `-${String(mid)}px 0px -${String(window.innerHeight - mid - 1)}px 0px`,
        },
      )
      for (const band of document.querySelectorAll('[data-theme="dark"]')) bands.observe(band)
    }
    watchBands()
    let resizeSettle: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeSettle)
      resizeSettle = setTimeout(watchBands, CONFIG.motion.choreo.resizeSettleMs)
    }
    window.addEventListener('resize', onResize)

    let scrolled = window.scrollY > CONFIG.motion.headerScrolledAtPx
    settle(scrolled, false)
    apply()
    const onScroll = () => {
      apply()
      const next = window.scrollY > CONFIG.motion.headerScrolledAtPx
      if (next === scrolled) return
      scrolled = next
      settle(next, true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const heroCta = document.getElementById('hero-cta')
    const pastCta = new IntersectionObserver(([entry]) => {
      const past = entry !== undefined && !entry.isIntersecting && entry.boundingClientRect.top < 0
      root.toggleAttribute('data-past-hero', past)
    })
    if (heroCta !== null) pastCta.observe(heroCta)

    return () => {
      clearTimeout(step)
      clearTimeout(resizeSettle)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      pastCta.disconnect()
      bands?.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className="group contents">
      {/* The text takes --on-surface once solid through `.header-bar` (app/globals.css), whose
          held ink fades between the light and dark sets while the blend flip itself snaps. */}
      <header className="header-bar fixed inset-x-0 top-0 z-50 text-surface mix-blend-difference group-has-[[aria-expanded=true]]:text-on-surface group-has-[[aria-expanded=true]]:mix-blend-normal group-data-solid:mix-blend-normal">
        {children}
      </header>
      {/* The surface, painted under the header and never inside it. Its colour follows the dark
          scope, so over a dark band it is the foot at the same alpha, and the change fades. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-16 bg-surface/92 opacity-0 shadow-header backdrop-blur-lg transition-[opacity,background-color] duration-(--motion-enter) ease-standard group-has-[[aria-expanded=true]]:opacity-100 group-data-scrolled:opacity-100"
      />
    </div>
  )
}
