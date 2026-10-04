'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { SummitContent } from '../copy-slots'
import { arrow, menuButton, pad } from '../styles'
import { SummitLogo } from './logo'

// pictured: the first screen is a photograph, under the hero's veil (summit.css).
type Props = Pick<SummitContent, 'brand' | 'nav'> & { pictured: boolean }

const PANEL_ID = 'summit-menu'

// The source turned its bar to glass this far down.
const GLASS_AT = 10

// The source's Navbar: a fixed bar with the logo at the left, the links in the middle and a
// square dark button at the right from md, and below md a dark square toggle. Below md the
// links' own row becomes a full-screen sheet of frosted glass that widens from nothing to the
// whole screen over 300ms, holding the links stacked in the centre over a close button; the
// bar itself is clear while the sheet is open. The source toggled the sheet by state and turned
// the bar to glass by a scroll listener at ten pixels; both are the same here. The sheet is
// inert while closed below md, so its links are out of the tab order there and still in it
// from md where the same row is the menu, and Escape closes it. While the bar is clear over the
// hero's photograph it sits on the hero's veil of the page surface, where its name and links keep
// their greys. The sheet's glass is frosted thicker than the source's, enough for its grey links
// to read over any photograph behind it. The toggle comes before the sheet in the page, where the
// source put it after, so the first Tab after opening reaches the sheet's first link rather than
// the hero behind it; it is the only thing in the bar below md, so it still sits at the right.
// Escape and the close button hand focus back to the toggle; a link hands it to the block it
// leads to, so the next Tab goes on from there. The source left focus on a link the closed sheet
// hides. From md to lg the links sit closer than the source's, and neither a link nor the ask
// ever wraps: the name gives way instead, wrapping, so the row fits at 768 with any labels. On a
// page with a photograph the links are underlined under the pointer rather than faded, since the
// lighter grey falls below WCAG AA over the picture, on the veil and on the glass.
export function SummitNav({ brand, nav, pictured }: Props) {
  // Both start below the studio's bar while any of it shows (--chrome-top, decision 22); the
  // transition eases the glass, never the bar's place, so the bar keeps pace with the studio's.
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)

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
    const query = window.matchMedia('(max-width: 767px)')
    const onChange = () => {
      setNarrow(query.matches)
    }
    onChange()
    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // The close button hands focus straight back. A link in the open sheet still scrolls to its
  // block; focus moves there without a second scroll. From md the same links are the bar's row,
  // where the sheet is never open and a link leaves focus as the browser puts it.
  const close = () => {
    setOpen(false)
    toggle.current?.focus()
  }
  const follow = (href: string) => {
    if (!open) return
    setOpen(false)
    const target = href.startsWith('#') ? document.getElementById(href.slice(1)) : null
    if (target === null) return
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  return (
    <nav
      className={`fixed top-(--chrome-top,0px) right-0 left-0 z-50 flex w-full flex-col items-center transition-[background-color,backdrop-filter] duration-300 ${scrolled && !open ? 'bg-surface/70 backdrop-blur-md' : 'bg-transparent'}`}
      aria-label="Main"
    >
      <div
        className={`relative flex w-full max-w-360 items-center justify-between gap-3 ${pad} py-4`}
      >
        <a href="#top" aria-label={`${brand.name} home`} className="min-w-0">
          <SummitLogo brand={brand} />
        </a>
        <button
          ref={toggle}
          type="button"
          onClick={() => {
            setOpen(true)
          }}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          aria-label="Menu"
          className={menuButton}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12h16" />
            <path d="M4 18h16" />
            <path d="M4 6h16" />
          </svg>
        </button>
        <div
          id={PANEL_ID}
          inert={narrow && !open}
          className={`${open ? 'max-md:w-full' : 'max-md:w-0'} flex items-center gap-10 text-sm max-md:fixed max-md:top-(--chrome-top,0px) max-md:bottom-0 max-md:left-0 max-md:z-50 max-md:flex-col max-md:justify-center max-md:overflow-hidden max-md:bg-surface/75 max-md:backdrop-blur max-md:transition-all max-md:duration-300 md:gap-5 lg:gap-10`}
        >
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => {
                follow(link.href)
              }}
              className={`font-medium whitespace-nowrap text-on-surface/75 ${pictured ? 'underline-offset-4 hover:underline' : 'hover:text-on-surface'}`}
            >
              {link.label}
            </a>
          ))}
          <button type="button" onClick={close} aria-label="Close menu" className={menuButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <a
          href={nav.cta.href}
          className="group hidden shrink-0 cursor-pointer items-center gap-1.5 rounded-sm bg-brand-deeper px-4 py-3 text-sm font-medium whitespace-nowrap text-on-brand transition hover:bg-brand-deepest md:flex"
        >
          {nav.cta.label}
          <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" className={arrow} />
        </a>
      </div>
    </nav>
  )
}
