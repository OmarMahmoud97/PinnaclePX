'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { SummitContent } from '../copy-slots'
import { arrow, menuButton, pad } from '../styles'
import { SummitLogo } from './logo'

type Props = Pick<SummitContent, 'brand' | 'nav'>

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
// from md where the same row is the menu, and Escape closes it.
export function SummitNav({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [narrow, setNarrow] = useState(false)

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
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => {
    setOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 flex w-full flex-col items-center transition-all duration-300 ${scrolled && !open ? 'bg-surface/70 backdrop-blur-md' : 'bg-transparent'}`}
      aria-label="Main"
    >
      <div className={`relative flex w-full max-w-360 items-center justify-between ${pad} py-4`}>
        <a href="#top" aria-label={`${brand.name} home`}>
          <SummitLogo brand={brand} />
        </a>
        <div
          id={PANEL_ID}
          inert={narrow && !open}
          className={`${open ? 'max-md:w-full' : 'max-md:w-0'} flex items-center gap-10 text-sm max-md:fixed max-md:top-0 max-md:left-0 max-md:z-50 max-md:h-screen max-md:flex-col max-md:justify-center max-md:overflow-hidden max-md:bg-surface/25 max-md:backdrop-blur max-md:transition-all max-md:duration-300`}
        >
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="font-medium text-on-surface/75 hover:text-on-surface/55"
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
          className="group hidden cursor-pointer items-center gap-1.5 rounded-sm bg-brand-deeper px-4 py-3 text-sm font-medium text-on-brand transition hover:bg-brand-deepest md:flex"
        >
          {nav.cta.label}
          <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" className={arrow} />
        </a>
        <button
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
      </div>
    </nav>
  )
}
