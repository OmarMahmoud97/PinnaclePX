'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { CONFIG } from '@/lib/config'

// The fixed header, with two states it takes on its own: `data-scrolled` once the page has moved
// past the first few pixels, and `data-past-hero` once the hero's own button has scrolled out of
// the top of the viewport. Both are attributes the CSS reads, so nothing re-renders, and with
// JavaScript off the header is exactly the plain one the server sent. Height never changes.
//
// Over the hero the header is see-through and blends by difference (ADR 0031): white text minus
// the white page reads black, and over dark ink it stays light. Anything drawn in here is shown
// inverted, so its links change opacity on hover, never colour, and the filled button waits for
// the solid state. Once scrolled, or while the phone menu is open, the header is the plain bar
// it always was: surface, hairline, blur, normal blending. The blend mode cannot animate, so
// the colour snaps with it and only the surface fades in.
export function HeaderChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = ref.current
    if (header === null) return
    const onScroll = () => {
      header.toggleAttribute('data-scrolled', window.scrollY > CONFIG.motion.headerScrolledAtPx)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const heroCta = document.getElementById('hero-cta')
    const observer = new IntersectionObserver(([entry]) => {
      const past = entry !== undefined && !entry.isIntersecting && entry.boundingClientRect.top < 0
      header.toggleAttribute('data-past-hero', past)
    })
    if (heroCta !== null) observer.observe(heroCta)

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <header
      ref={ref}
      className="group fixed inset-x-0 top-0 z-50 text-surface mix-blend-difference transition-[background-color,border-color] duration-(--motion-enter) ease-standard has-[[aria-expanded=true]]:border-b has-[[aria-expanded=true]]:border-border has-[[aria-expanded=true]]:bg-surface has-[[aria-expanded=true]]:text-on-surface has-[[aria-expanded=true]]:mix-blend-normal data-scrolled:border-b data-scrolled:border-on-surface/10 data-scrolled:bg-surface/88 data-scrolled:text-on-surface data-scrolled:mix-blend-normal data-scrolled:backdrop-blur-md"
    >
      {children}
    </header>
  )
}
