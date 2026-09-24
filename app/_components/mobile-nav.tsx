'use client'

import Link from 'next/link'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { BOOK_CALL, CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { LogoMark } from '@/components/brand/logo-mark'
import { Button, buttonStyles } from '@/components/ui/button'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CONFIG } from '@/lib/config'

const PANEL_ID = 'mobile-nav'

// The longest a close waits for the sheet's own transitions before hiding it anyway: twice the
// drain, which is the header's step at the menu's pace (900 ms against 450), so it only ever
// catches a transition that never reports its end.
const CLOSE_FAIL_SAFE_MS = CONFIG.motion.headerStepMs * CONFIG.motion.menuPace * 2

// Each row's place in the reveal; the delay itself is .menu-row in app/_styles/header.css.
function rowDelay(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}

// open: the ink blooms from the button and the rows rise. closing: the rows go, the ink drains
// back into the button, and only then is the sheet hidden. Until then the header keeps its normal
// blend and its full-width row (app/_styles/header.css), while its words and mark turn back at the
// moment the drain uncovers them. A reopen mid-drain turns every transition round where it is.
type Phase = 'closed' | 'open' | 'closing'
const toClosing = (current: Phase): Phase => (current === 'open' ? 'closing' : current)

// The ink's centre is the button's, wherever the header has put it at this moment: the corner of
// the full bar at the top of the page, inside the pill once scrolled. The sheet is fixed to the
// viewport, so the button's box is already in the clip's coordinates.
function aimAt(button: HTMLElement | null, nav: HTMLElement | null) {
  if (button === null || nav === null) return
  const box = button.getBoundingClientRect()
  const at = `${String(box.left + box.width / 2)}px ${String(box.top + box.height / 2)}px`
  nav.style.setProperty('--menu-at', at)
}

// The phone menu: a sheet over the whole screen in the page's dark set, the four sections as big
// type with their numerals, and the two actions at the foot. The header stays on top of it with
// its mark and the button, which has turned into the cross; the dark scope in app/globals.css
// covers the header while the button is expanded. Open, the rest of the page is inert under it.
// Closing, the sheet is inert at once, so it has left the tab order and the accessibility tree
// before the ink has drained, and hidden after.
export function MobileNav() {
  const [phase, setPhase] = useState<Phase>('closed')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const open = phase === 'open'
  const close = () => {
    aimAt(buttonRef.current, navRef.current)
    setPhase(toClosing)
  }

  // Escape closes and returns focus to the button; a tap anywhere outside closes; a viewport that
  // grows past md, where the button is not drawn, closes at once and lets the header go.
  useEffect(() => {
    if (!open) return
    // The open sheet covers the whole page, so everything beside the header leaves the tab order
    // and the accessibility tree while it is open: Tab past the last action goes to the browser
    // and back to the header, never to a control drawn under the ink (WCAG 2.4.11), and a screen
    // reader stays on the menu. It is let go the moment the menu starts to close. So are the
    // header's own parts beside the menu, which the sheet is drawn over too (past the hero, the
    // phone's ask, one Shift+Tab from the cross); the mark and the button sit above the sheet and
    // stay. A child that was inert already is left out, so letting go never clears an inert
    // someone else set.
    const root = rootRef.current
    const beside = [...(root?.parentElement?.children ?? [])]
    const covered =
      root === null
        ? []
        : [...document.body.children, ...beside].filter(
            (child): child is HTMLElement =>
              child instanceof HTMLElement && !child.inert && !child.contains(root),
          )
    for (const element of covered) element.inert = true
    const wide = window.matchMedia('(min-width: 48rem)')
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      aimAt(buttonRef.current, navRef.current)
      setPhase(toClosing)
      buttonRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node) === true) return
      aimAt(buttonRef.current, navRef.current)
      setPhase(toClosing)
    }
    const onWide = () => {
      if (wide.matches) setPhase('closed')
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    wide.addEventListener('change', onWide)
    return () => {
      for (const element of covered) element.inert = false
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      wide.removeEventListener('change', onWide)
    }
  }, [open])

  // Hidden once the sheet's own transitions have settled: the drain, or under reduced motion the
  // fade. getAnimations() flushes style, so it returns the ones this commit has just started, and
  // allSettled lets a transition cancelled on the way (a hover fade the pointer leaves) count as
  // ended. A reopen clears this effect before it can hide anything.
  useEffect(() => {
    const nav = navRef.current
    if (phase !== 'closing' || nav === null) return
    let live = true
    const done = () => {
      if (live) setPhase('closed')
    }
    const failSafe = setTimeout(done, CLOSE_FAIL_SAFE_MS)
    const ends = nav.getAnimations({ subtree: true }).map((animation) => animation.finished)
    void Promise.allSettled(ends).then(done)
    return () => {
      live = false
      clearTimeout(failSafe)
    }
  }, [phase])

  return (
    <div ref={rootRef} data-menu={phase === 'closed' ? undefined : phase} className="md:hidden">
      {/* See-through with a hairline in the current colour, and dimmed rather than recoloured on
          hover: over the hero the header is drawn inverted (header-chrome.tsx), so a filled
          surface or a coloured ring would show as its opposite. Only its opacity moves, so the
          ring and the bars change colour with the header's text in the same frame, and while
          the sheet is shown they take its light ink at once (header.css), since the ink is
          under them from the first frame to the last. Once the header is solid the focus ring
          takes the site's brand-ink, which the dark scope keeps readable. Above the sheet, so
          the cross stays reachable while it is open and a tap during the drain reopens it. */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-lg"
        className="relative z-50 border-current/30 transition-opacity hover:border-current/30 hover:bg-transparent hover:opacity-60 focus-visible:ring-current group-data-solid:focus-visible:ring-brand-ink"
        onClick={() => {
          if (open) {
            close()
            return
          }
          aimAt(buttonRef.current, navRef.current)
          setPhase('open')
        }}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="Menu"
      >
        {/* The two bars meet and turn into the cross, and turn back and part (.menu-bar). */}
        <span aria-hidden="true" className="relative flex size-5 items-center justify-center">
          <span className="menu-bar absolute h-0.5 w-4 bg-current" />
          <span className="menu-bar absolute h-0.5 w-4 bg-current" />
        </span>
      </Button>

      {/* Clipped to a disc of ink that grows from the button and shrinks back into it (.menu-sheet);
          the clip is on the sheet itself, which makes no containing block, so the sheet stays
          fixed to the viewport. Lenis and the browser both leave the page alone while a finger
          or a wheel is over it. */}
      <nav
        ref={navRef}
        id={PANEL_ID}
        aria-label="Mobile"
        hidden={phase === 'closed'}
        inert={phase === 'closing'}
        data-theme="dark"
        data-lenis-prevent=""
        className="menu-sheet fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-surface px-6 pt-28 pb-8 text-on-surface"
      >
        {/* The mark as a watermark in the sheet's empty middle, in the light gradient the dark
            scope gives it, faint enough to be ground rather than a second logo. The rows, the
            actions and the mark take a tablet's measure from 640px (.menu-list in header.css). */}
        <LogoMark
          size={120}
          className="menu-watermark pointer-events-none absolute right-4 bottom-44 opacity-20 sm:bottom-48"
        />
        <ol className="menu-list relative flex flex-col">
          {NAV_LINKS.map((link, index) => (
            <li key={link.href} style={rowDelay(index)} className="menu-row">
              <Link
                href={link.href}
                onClick={close}
                className="menu-link flex items-baseline gap-4 rounded-md py-3 text-title font-semibold tracking-tight transition-opacity duration-(--motion-tap) hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
              >
                <span
                  aria-hidden="true"
                  className="menu-numeral text-label text-on-surface-muted tabular-nums"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ol>
        <div
          style={rowDelay(NAV_LINKS.length)}
          className="menu-row menu-foot relative flex flex-col items-center gap-5"
        >
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="mobile-nav"
            onClick={close}
            className={buttonStyles({ size: 'lg', className: 'menu-cta w-full' })}
          >
            {CTA.label}
          </TrackedLink>
          <TrackedLink
            href={BOOK_CALL.href}
            event="call_click"
            location="mobile-nav"
            onClick={close}
            className={`${textLinkStyles} text-small`}
          >
            {BOOK_CALL.label}
          </TrackedLink>
        </div>
      </nav>
    </div>
  )
}
