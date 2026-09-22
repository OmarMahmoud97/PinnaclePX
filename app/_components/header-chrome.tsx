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
// it always was: surface, hairline, blur, normal blending.
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
// and two the hero sets as it leaves: data-past-hero once its own button has scrolled out of the
// top of the viewport (the phone's ask takes over), and data-framed once the whole hero has and
// the page's hairline frame is what runs under the header, so the header's own frame rules draw.
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
    let scrolled = window.scrollY > CONFIG.motion.headerScrolledAtPx
    settle(scrolled, false)
    const onScroll = () => {
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

    // The frame is under the header once the hero's foot has passed the header's own foot: the
    // root is the viewport less the header, and the hero, first on the page, can only leave it
    // upwards.
    const hero = document.getElementById('hero')
    const headerPx = root.querySelector('header')?.offsetHeight ?? 0
    const framed = new IntersectionObserver(
      ([entry]) => {
        root.toggleAttribute('data-framed', entry !== undefined && !entry.isIntersecting)
      },
      { rootMargin: `-${String(headerPx)}px 0px 0px 0px` },
    )
    if (hero !== null) framed.observe(hero)

    return () => {
      clearTimeout(step)
      window.removeEventListener('scroll', onScroll)
      pastCta.disconnect()
      framed.disconnect()
    }
  }, [])

  return (
    <div ref={ref} className="group contents">
      <header className="fixed inset-x-0 top-0 z-50 text-surface mix-blend-difference group-has-[[aria-expanded=true]]:text-on-surface group-has-[[aria-expanded=true]]:mix-blend-normal group-data-solid:text-on-surface group-data-solid:mix-blend-normal">
        {children}
      </header>
      {/* The surface, painted under the header and never inside it. The frame rules on its inner
          column draw only while the page's frame is what runs beneath, so they never hang over
          the edge-to-edge hero. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-16 border-b border-on-surface/10 bg-surface/92 opacity-0 shadow-header backdrop-blur-lg transition-opacity duration-(--motion-enter) ease-standard group-has-[[aria-expanded=true]]:opacity-100 group-data-scrolled:opacity-100"
      >
        <div className="mx-auto h-full max-w-7xl border-border opacity-0 transition-opacity duration-(--motion-enter) ease-standard group-data-framed:opacity-100 md:border-x" />
      </div>
    </div>
  )
}
