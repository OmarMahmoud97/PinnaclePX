'use client'

import { Menu, X } from 'lucide-react'
import { type CSSProperties, useEffect, useState } from 'react'
import type { HarborContent } from '../copy-slots'
import { container, motion } from '../styles'
import { HarborLogo } from './logo'

type Props = Pick<HarborContent, 'brand' | 'nav'>

const PANEL_ID = 'harbor-menu'

// The source turned its bar to glass this far down, and faded its overlay out over this long.
const GLASS_AT = 40
const EXIT_MS = 250

// The source's Navbar: a fixed bar with the logo at the left, the links in the middle and the
// round accent button at the right from md, and below md a toggle that opens a full-screen
// overlay of the links stacked in the centre with the button under them. The source dropped
// the bar in on load, turned it to glass by a scroll listener and animated the overlay and its
// links in and out with a motion library; here the drop is a keyframe (harbor.css), the glass
// is the same listener, the overlay is state, its parts arrive by starting-style transitions at
// the source's delays, and it fades out before it goes. Escape closes it. The source showed two
// close marks while the overlay was open, its toggle's over the overlay's own; here the toggle
// hides and the overlay's close mark, which arrives with it, is the one control. The bar stays
// above the overlay so the logo shows, but lets clicks through to that mark.
export function HarborNav({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
        <div className={container}>
          <div className="flex h-20 items-center justify-between">
            <a
              className="group flex items-center gap-2"
              href="#top"
              aria-label={`${brand.name} home`}
            >
              <HarborLogo brand={brand} />
            </a>
            <ul className="hidden items-center gap-8 md:flex">
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
            <div className="hidden items-center gap-4 md:flex">
              <a
                href={nav.cta.href}
                className="harbor-glow-a rounded-full bg-brand-deeper px-5 py-2.5 font-display text-sm font-bold tracking-wider text-on-brand uppercase transition-all duration-200 hover:scale-[1.03] hover:bg-brand-deepest active:scale-[0.97]"
              >
                {nav.cta.label}
              </a>
            </div>
            <button
              type="button"
              className={`p-1 text-on-surface md:hidden ${open ? 'invisible' : ''}`}
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
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-surface transition-[opacity,translate] duration-[250ms] md:hidden starting:-translate-y-5 starting:opacity-0 ${closing ? '-translate-y-5 opacity-0' : ''}`}
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
                onClick={close}
                className="font-display text-3xl font-black tracking-widest text-on-surface uppercase transition-colors hover:text-brand-deeper"
              >
                {link.label}
              </a>
            </div>
          ))}
          <a
            href={nav.cta.href}
            onClick={close}
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
