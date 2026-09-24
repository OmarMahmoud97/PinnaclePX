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
// glass of the page's surface (header.css); while the phone menu's sheet is shown the header
// sits on it with normal blending (app/_styles/header.css).
//
// The blend mode cannot animate, so the header changes in layers (ADR 0034, amendment of
// 24 September 2026). On the way in the blend goes normal and the row draws in to the island
// together, over the hero's white top where black text becoming navy is nothing to see. On the
// way out the island dissolves while the blend is still normal (the glass and the artwork fade,
// the row unwinds) and the blend flips back only once it has, so nothing drawn in here is ever
// shown inverted. The ask belongs to the hero's own button: it fills, and on a phone it takes
// the name's place, once that button has left the top of the viewport. Every part moves by a
// CSS transition, so a change of direction at any speed turns each one round from where it is.
//   data-solid      the blend is normal and the text reads --bar-ink
//   data-island     the row is the pill on its glass, and the mark is the artwork
//   data-past-hero  the hero's button has scrolled away; data-filled lands with it (the fill)
// and two the page below sets: data-over-dark, while what runs under the bar is dark (ADR
// 0034): the hero's own foot, then either of the two dark bands, the ink stretch under the hero
// and the footer, which the dark scope in app/globals.css reads only together with data-solid,
// so the bar and its text swap to the dark set while the blend, whose text is already light,
// never sees a dark surface; and data-section, the linked section under the reader, for the
// ink dot under its link.
//
// A page without the hero's white top (the questionnaire, start-chrome.tsx) passes `island`,
// and `overDark` when its first screen is dark. Both are rendered into the server's HTML, so
// the first paint is already the island with its blend normal and its mark and words in the
// right set: over any other ground the difference blend would draw the page's complement (a
// brown over the wash). The scroll never dissolves an island the page asked for.

// The dot's diameter, as app/_styles/header.css draws it, and the reading line the spy uses: the
// share of the viewport's height a section's top must pass for its link to take the dot.
const DOT_PX = 6
const SPY_LINE_SHARE = 0.5

type Props = {
  children: ReactNode
  // The page opens on the island and keeps it: solid, drawn in and never dissolved by the scroll.
  island?: boolean
  // What runs under the bar at the page's top is dark, so the first paint takes the dark set.
  overDark?: boolean
}

export function HeaderChrome({ children, island: always = false, overDark = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (root === null) return
    let step: ReturnType<typeof setTimeout> | undefined
    let live = true

    // What is under the bar, read at its middle. Two sources, ORed: any dark band whose box
    // crosses that line, watched by an observer whose root is the one-pixel strip at that
    // height, and the hero's own foot, which is not a band but the ramp's dark end, dark once no
    // more than heroDarkFootShare of the hero is still below the line. The foot check stays true
    // until the hero has left the viewport altogether, so the hand-over to the stretch that
    // follows it, which the observer reports a frame later, never shows a light bar between.
    // The middle is the same line for the full row and for the island (8px down, 48px tall), and
    // is read from the row as it stands, so a page that opens on the island reads it too.
    const hero = document.getElementById('hero')
    const row = root.querySelector<HTMLElement>('.header-row')
    const rowBox = row?.getBoundingClientRect()
    const mid = rowBox === undefined ? 0 : Math.round(rowBox.top + rowBox.height / 2)
    const dark = new Set<Element>()
    const heroDark = () => {
      if (hero === null) return false
      const box = hero.getBoundingClientRect()
      return box.bottom > 0 && box.bottom - mid <= box.height * CONFIG.motion.heroDarkFootShare
    }
    // Until the observer has reported once since it was last built, the set is empty for want of
    // an answer, not because nothing dark is under the bar: only a yes is written then, so a
    // data-over-dark the server sent, or one standing through a resize's rebuild, is held rather
    // than cleared for the frames before the first report puts it back.
    let reported = false
    const apply = () => {
      const over = dark.size > 0 || heroDark()
      if (over || reported) root.toggleAttribute('data-over-dark', over)
    }
    // The strip's margins bake in the viewport height, so the observer is rebuilt once a resize
    // has settled; observing fires for every band at once, which refills the set. It is rebuilt
    // too when a ground changes its scope after load (the questionnaire's page turns to the ink
    // once the brief is sent), since the set of bands is read only here.
    let bands: IntersectionObserver | undefined
    const watchBands = () => {
      bands?.disconnect()
      dark.clear()
      reported = false
      bands = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) dark.add(entry.target)
            else dark.delete(entry.target)
          }
          reported = true
          apply()
        },
        {
          rootMargin: `-${String(mid)}px 0px -${String(window.innerHeight - mid - 1)}px 0px`,
        },
      )
      // The phone menu's sheet is not a band: counting it would set data-over-dark a frame after
      // the menu opens and clear it a frame after the sheet hides, so over a light band the
      // island would stay dark through the drain and fade its words to navy on white after it.
      const found = document.querySelectorAll('[data-theme="dark"]:not(#mobile-nav)')
      for (const band of found) bands.observe(band)
      // With nothing to observe there is no report to wait for.
      if (found.length === 0) {
        reported = true
        apply()
      }
    }
    watchBands()
    const scopes = new MutationObserver(watchBands)
    scopes.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-theme'],
    })

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

    // The island's width at rest, written as a length, so the draw-in is a change between two
    // lengths and animates in every engine (a change to fit-content animates only where
    // interpolate-size is supported). A clone of the row goes into a hidden box that carries the
    // two attributes that shape it, as they are about to land, where header.css lets it take its
    // content's width; it is read and removed in the same task, so it is never painted. The
    // sheet stays out of the clone and the menu's state leaves it, so an open menu cannot skew
    // the measure with its full-width row. The width is written before the attributes, so the
    // row sees one change and every part of it runs on the same clock: on a phone the pill
    // breathes out at the hand-over exactly as the ask's track opens. A page that opens on the
    // island is measured at mount, where the length replaces the server's fit-content in one
    // step (a keyword to a length does not animate), so nothing moves.
    const measure = (past: boolean) => {
      if (row === null) return
      const box = document.createElement('div')
      box.className = 'group header-measure'
      box.setAttribute('data-island', '')
      box.toggleAttribute('data-past-hero', past)
      box.append(row.cloneNode(true))
      box.querySelector('#mobile-nav')?.remove()
      box.querySelector('[data-menu]')?.removeAttribute('data-menu')
      document.body.append(box)
      const width = box.firstElementChild?.getBoundingClientRect().width ?? 0
      box.remove()
      row.style.setProperty('--pill-w', `${String(Math.ceil(width))}px`)
    }

    // The island and the hand-over, read in the frame the page moves (an observer reports a frame
    // late). The hand-over is the hero's button leaving the top of the viewport; a page without
    // that button hands over with the island. A page that asked for the island keeps it at any
    // scroll; the first call below still measures it and settles the attributes around it.
    const heroCta = document.getElementById('hero-cta')
    let island = false
    let past = false
    const update = () => {
      const nextIsland = always || window.scrollY > CONFIG.motion.headerScrolledAtPx
      const nextPast = heroCta === null ? nextIsland : heroCta.getBoundingClientRect().bottom <= 0
      if (nextIsland === island && nextPast === past) return
      if (nextIsland) measure(nextPast)
      if (nextPast !== past) {
        past = nextPast
        root.toggleAttribute('data-past-hero', past)
        root.toggleAttribute('data-filled', past)
      }
      if (nextIsland === island) return
      island = nextIsland
      clearTimeout(step)
      root.toggleAttribute('data-island', island)
      // The blend flips back one step after the island has gone: the glass and the mark fade
      // over --motion-enter and the row unwinds over --motion-settle, which the step equals, so
      // the flip lands on a wide row with nothing left in the header to invert.
      if (island) root.setAttribute('data-solid', '')
      else
        step = setTimeout(() => {
          root.removeAttribute('data-solid')
        }, CONFIG.motion.headerStepMs)
    }

    // The name's width changes once the brand face has loaded, so the island is measured again.
    // A change of the viewport's width re-lays the island at once, as a resize always has: the row
    // and the folding labels drop their transitions for that one style change, so no link spills
    // past the glass while a length catches up with a new breakpoint. A change of height alone (a
    // phone's toolbar folding away as the page scrolls) leaves a running draw-in alone.
    void document.fonts.ready.then(() => {
      if (live && island) measure(past)
    })
    let viewWidth = window.innerWidth
    const relay = () => {
      if (row === null || window.innerWidth === viewWidth) return
      viewWidth = window.innerWidth
      if (!island) return
      const parts = [row, ...row.querySelectorAll<HTMLElement>('.header-name, .header-ask-phone')]
      for (const part of parts) part.style.transition = 'none'
      measure(past)
      row.getBoundingClientRect()
      for (const part of parts) part.style.transition = ''
    }
    let resizeSettle: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      relay()
      clearTimeout(resizeSettle)
      resizeSettle = setTimeout(() => {
        watchBands()
        placeDot()
      }, CONFIG.motion.choreo.resizeSettleMs)
    }
    window.addEventListener('resize', onResize)

    // A reader's text spacing or own style sheet changes the words' widths without a resize, and
    // the island would keep its old length: the phone's ask clipped at both ends, the desktop ask
    // out past the glass, the questionnaire's exit squeezed out of round (WCAG 1.4.12). A hidden
    // line of the row's own words, at its natural width and off the left edge of the bar, reports
    // any such change, and a standing island is measured again. Its first report is only its width.
    const gauge = document.createElement('span')
    gauge.className = 'header-gauge'
    gauge.setAttribute('aria-hidden', 'true')
    gauge.textContent = row?.textContent ?? ''
    row?.after(gauge)
    let gaugeWidth: number | undefined
    const words = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width
      if (gaugeWidth !== undefined && width !== gaugeWidth && island) measure(past)
      gaugeWidth = width
    })
    words.observe(gauge)

    update()
    apply()
    spy()
    const onScroll = () => {
      apply()
      spy()
      update()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      live = false
      clearTimeout(step)
      clearTimeout(resizeSettle)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      bands?.disconnect()
      scopes.disconnect()
      words.disconnect()
      gauge.remove()
    }
  }, [always])

  // The props land as attributes in the server's HTML and never change after, so React leaves
  // the attributes alone once the effect above has taken them over.
  return (
    <div
      ref={ref}
      data-solid={always ? '' : undefined}
      data-island={always ? '' : undefined}
      data-over-dark={overDark ? '' : undefined}
      className="group contents"
    >
      {/* The text takes --on-surface once solid through `.header-bar` (app/globals.css), whose
          held ink fades between the light and dark sets while the blend flip itself snaps. */}
      <header className="header-bar fixed inset-x-0 top-0 z-50 text-surface mix-blend-difference group-data-solid:mix-blend-normal">
        {children}
      </header>
    </div>
  )
}
