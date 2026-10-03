'use client'

import { Menu, X } from 'lucide-react'
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from 'react'
import type { HarborContent } from '../copy-slots'
import { textEms } from '../fit'
import { container, motion } from '../styles'
import { HarborLogo } from './logo'

type Props = Pick<HarborContent, 'brand' | 'nav'>

const PANEL_ID = 'harbor-menu'

// The source turned its bar to glass this far down, and faded its overlay out over this long.
const GLASS_AT = 40
const EXIT_MS = 250

// Where the bar can show its links and its ask beside the wordmark: the container's room at
// lg, xl and 2xl (the screen less its padding, at most 1440px less 2 × 96px), the gap between
// the links and between the bar's three parts there, and the classes that show the links and
// hide the toggle from there.
const BARS = [
  { room: 896, gap: 24, show: 'lg:flex', hide: 'lg:hidden' },
  { room: 1088, gap: 32, show: 'xl:flex', hide: 'xl:hidden' },
  { room: 1248, gap: 32, show: '2xl:flex', hide: '2xl:hidden' },
] as const

// How wide the bar's parts are on one line, in pixels, estimated from their words as the big
// type is (fit.ts), at the bar's own sizes: the links at 14px tracked 0.025em, the ask at 14px
// tracked 0.05em inside 20px each side, and the wordmark at 24px in two lines at most, or a
// logo at its 34px height. The estimate errs wide, so the toggle stays a little longer rather
// than let a link wrap.
function barWidth({ brand, nav }: Props, gap: number): number {
  const label = (text: string, tracking: number) => 14 * (textEms(text) + tracking * text.length)
  const links = nav.links.reduce((sum, link) => sum + label(link.label, 0.025), 0)
  const ask = label(nav.cta.label, 0.05) + 40
  const { logo } = brand
  const mark = logo.kind === 'image' ? (34 * logo.width) / logo.height : 24 * twoLines(brand.name)
  return links + gap * (nav.links.length - 1) + ask + mark + 2 * gap
}

// The narrowest a name can be set in at most two lines, in ems.
function twoLines(name: string): number {
  const words = name.split(/\s+/)
  let narrowest = textEms(name)
  for (let at = 1; at < words.length; at++) {
    const first = textEms(words.slice(0, at).join(' '))
    const rest = textEms(words.slice(at).join(' '))
    narrowest = Math.min(narrowest, Math.max(first, rest))
  }
  return narrowest
}

// The source's Navbar: a fixed bar with the logo at the left, the links in the middle and the
// round accent button at the right from md, and below md a toggle that opens a full-screen
// overlay of the links stacked in the centre with the button under them. The source dropped
// the bar in on load, turned it to glass by a scroll listener and animated the overlay and its
// links in and out with a motion library; here the drop is a keyframe (harbor.css), the glass
// is the same listener, the overlay is state, its parts arrive by starting-style transitions at
// the source's delays, and it fades out before it goes. Escape closes it. The source showed two
// close marks while the overlay was open, its toggle's over the overlay's own; here the toggle
// hides and the overlay's close mark, which arrives with it, is the one control. The bar stays
// above the overlay so the logo shows, but lets clicks through to that mark. The source left
// focus on the page's body however the overlay closed. Here, closed by Escape or its close
// mark, focus goes back to the toggle; when a link is chosen, focus goes to the block it leads
// to, so a keyboard's next Tab carries on from there rather than from the top of the page.
//
// From md to past lg the source's links, button and name wrapped inside themselves and ran
// past the bar, so here the links and the button show from the first of lg, xl and 2xl whose
// container holds them on one line beside the wordmark (BARS), never wrapping, and the toggle
// serves every screen below that, or every screen when no breakpoint holds them. The wordmark
// may take two lines, and on a narrow screen it is sized so its longest word fits beside the
// toggle (logo.tsx); the bar grows rather than cut it.
export function HarborNav({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  // Whether the overlay has been open, so focus returns when it closes but not on the first
  // render.
  const wasOpen = useRef(false)
  // The block a link chosen in the overlay leads to, which takes focus once the overlay has gone.
  const chosen = useRef<string | null>(null)
  const bar = BARS.find((option) => barWidth({ brand, nav }, option.gap) <= option.room)
  const show = bar?.show ?? ''
  const hide = bar?.hide ?? ''

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > GLASS_AT)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, EXIT_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [closing])

  const close = () => {
    setClosing(true)
  }

  // A link chosen in the overlay closes it and records the block its address leads to.
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute('href') ?? ''
    chosen.current = href.startsWith('#') ? href.slice(1) : null
    close()
  }

  // The toggle is hidden while the overlay shows, so focus can go back to it only once the
  // overlay has gone and the toggle is drawn again. A link's jump has already scrolled the page
  // by then, so the focus leaves the scroll where it is. A block is not a control, so it holds
  // focus only until focus moves on (harbor.css draws it no ring).
  useEffect(() => {
    if (open) {
      wasOpen.current = true
      return
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    const block = chosen.current === null ? null : document.getElementById(chosen.current)
    chosen.current = null
    if (block === null) {
      toggleRef.current?.focus({ preventScroll: true })
      return
    }
    if (!block.hasAttribute('tabindex')) {
      block.setAttribute('tabindex', '-1')
      block.addEventListener(
        'blur',
        () => {
          block.removeAttribute('tabindex')
        },
        { once: true },
      )
    }
    block.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const stagger = (index: number): CSSProperties => ({
    transitionDelay: `${String(0.08 * index)}s`,
  })

  return (
    <>
      <nav
        aria-label="Main"
        className={`harbor-bar fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${scrolled ? 'bg-surface/90 backdrop-blur-xl' : 'bg-transparent'} ${open ? 'pointer-events-none' : ''}`}
        style={motion(0, '-80px')}
      >
        <div className={`${container} @container`}>
          <div className="flex min-h-20 items-center justify-between gap-6 xl:gap-8">
            <a
              className="group flex min-w-0 items-center gap-2"
              href="#top"
              aria-label={`${brand.name} home`}
            >
              <HarborLogo brand={brand} />
            </a>
            <ul className={`hidden shrink-0 items-center gap-6 whitespace-nowrap xl:gap-8 ${show}`}>
              {nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    className="text-sm font-medium tracking-wide text-on-surface/70 uppercase transition-colors duration-200 hover:text-on-surface"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className={`hidden shrink-0 items-center gap-4 ${show}`}>
              <a
                href={nav.cta.href}
                className="harbor-glow-a rounded-full bg-brand-deeper px-5 py-2.5 font-display text-sm font-bold tracking-wider whitespace-nowrap text-on-brand uppercase transition-all duration-200 hover:scale-[1.03] hover:bg-brand-deepest active:scale-[0.97]"
              >
                {nav.cta.label}
              </a>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className={`shrink-0 p-1 text-on-surface ${hide} ${open ? 'invisible' : ''}`}
              onClick={() => {
                setOpen(true)
              }}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls={PANEL_ID}
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div
          id={PANEL_ID}
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-surface transition-[opacity,translate] duration-[250ms] starting:-translate-y-5 starting:opacity-0 ${hide} ${closing ? '-translate-y-5 opacity-0' : ''}`}
        >
          <button
            type="button"
            autoFocus
            className="absolute top-6 right-6 text-on-surface"
            onClick={close}
            aria-label="Close menu"
          >
            <X size={28} aria-hidden="true" />
          </button>
          {nav.links.map((link, index) => (
            <div
              key={link.href}
              className="transition-[opacity,translate] duration-300 starting:translate-y-5 starting:opacity-0"
              style={stagger(index)}
            >
              <a
                href={link.href}
                onClick={follow}
                className="font-display text-3xl font-black tracking-widest text-on-surface uppercase transition-colors hover:text-brand-deeper"
              >
                {link.label}
              </a>
            </div>
          ))}
          <a
            href={nav.cta.href}
            onClick={follow}
            className="mt-4 rounded-full bg-brand-deeper px-8 py-3 font-display text-lg font-bold tracking-wider text-on-brand uppercase transition-[opacity,translate] duration-300 starting:translate-y-5 starting:opacity-0"
            style={stagger(nav.links.length)}
          >
            {nav.cta.label}
          </a>
        </div>
      )}
    </>
  )
}
