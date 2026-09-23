'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { CONFIG } from '@/lib/config'

// The fixed header. Every state is an attribute on the wrapper that the CSS reads
// (`group-data-*` in site-header.tsx, `[data-*]` in app/_styles/header.css), so nothing
// re-renders, and with JavaScript off the header is exactly the plain row the server sent.
//
// Over the hero the header is see-through and blends by difference (ADR 0031): white text minus
// the white page reads black, and over dark ink it stays light. Anything drawn in here is shown
// inverted, so its links change opacity on hover, never colour, and the filled button and the
// row's glass wait for the solid state. Once scrolled the row draws in to a floating pill on a
// glass of the page's surface (header.css); while the phone menu is open the header sits on
// the menu's dark sheet with normal blending.
//
// The blend mode cannot animate, so the two directions differ. On the way in the flip happens
// at once, over the hero's white top where black text becoming navy is nothing to see, and the
// glass and the ask's fill follow it. On the way out the ask empties first, then the blend
// flips and the glass goes in the same instant, so no white glass is ever drawn inside the
// blended header, where it would show as black. Two attributes:
//   data-solid     the blend is normal, the text is --on-surface and the row is the pill
//   data-filled    the ask is the filled button
// one the hero sets as it leaves, data-past-hero, once its own button has scrolled out of the
// top of the viewport (the phone's ask takes over); one the page below sets, data-over-dark,
// while what runs under the bar is dark (ADR 0034): the hero's own foot, then either of the two
// dark bands, the ink stretch under the hero and the footer, which the dark scope in
// app/globals.css reads only together with data-solid, so the bar and its text swap to the
// dark set while the blend, whose text is already light, never sees a dark surface; and
// data-section, the linked section under the reader, for the ink dot under its link.
// The dot's diameter, as app/_styles/header.css draws it, and the reading line the spy uses: the
// share of the viewport's height a section's top must pass for its link to take the dot.
const DOT_PX = 6
const SPY_LINE_SHARE = 0.5

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

    // On the way in the three attributes land together: the row's glass is drawn only once the
    // blend is normal, so there is nothing to stage ahead of it (app/_styles/header.css). On
    // the way out the ask empties first, then the blend flips and the glass goes in the same
    // instant, so no white glass is ever drawn inside the blended header.
    const settle = (scrolled: boolean, staged: boolean) => {
      clearTimeout(step)
      if (scrolled) {
        root.setAttribute('data-solid', '')
        root.setAttribute('data-filled', '')
      } else if (root.hasAttribute('data-solid')) {
        root.removeAttribute('data-filled')
        const clear = () => {
          root.removeAttribute('data-solid')
        }
        if (staged) then(clear)
        else clear()
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

    // The section under the reader, for the ink dot under its link (app/_styles/header.css): the
    // last linked section whose top has passed the middle of the viewport, so a band without a
    // link of its own (the walkthrough, the comparison) keeps the link of the band before it.
    // The dot's position is the link's centre, written as a custom property on the nav.
    const nav = root.querySelector<HTMLElement>('nav[aria-label="Main"]')
    const targets = [...(nav?.querySelectorAll<HTMLAnchorElement>('a[href*="#"]') ?? [])]
      .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
      .filter((target): target is { link: HTMLAnchorElement; section: HTMLElement } => {
        return target.section !== null
      })
    let current: HTMLAnchorElement | undefined
    const placeDot = () => {
      if (nav === null || current === undefined) return
      const centre = current.offsetLeft + current.offsetWidth / 2 - DOT_PX / 2
      nav.style.setProperty('--dot-x', `${String(Math.round(centre))}px`)
    }
    const spy = () => {
      const line = window.innerHeight * SPY_LINE_SHARE
      let next: (typeof targets)[number] | undefined
      for (const target of targets) {
        if (target.section.getBoundingClientRect().top <= line) next = target
      }
      if (next?.link === current) return
      current = next?.link
      if (next === undefined) root.removeAttribute('data-section')
      else root.setAttribute('data-section', next.section.id)
      placeDot()
    }

    let resizeSettle: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(resizeSettle)
      resizeSettle = setTimeout(() => {
        watchBands()
        placeDot()
      }, CONFIG.motion.choreo.resizeSettleMs)
    }
    window.addEventListener('resize', onResize)

    let scrolled = window.scrollY > CONFIG.motion.headerScrolledAtPx
    settle(scrolled, false)
    apply()
    spy()
    const onScroll = () => {
      apply()
      spy()
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
    </div>
  )
}
