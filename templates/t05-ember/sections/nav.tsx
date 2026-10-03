'use client'

import { Menu, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { EmberContent } from '../copy-slots'
import { menuButton, pad, pill } from '../styles'
import { EmberLogo } from './logo'

type Props = Pick<EmberContent, 'brand' | 'nav'>

const PANEL_ID = 'ember-menu'

// The source turned its bar to glass this far down.
const GLASS_AT = 10

// The source's Navbar: a fixed bar with the logo at the left, the links in the middle and the
// round button at the right from md, and below md a dark square button that slides a
// full-screen sheet in from the right, holding the links stacked in the centre over a close
// button. The source toggled the sheet by state and turned the bar to glass by a scroll
// listener at ten pixels, over its 300ms transition; both are the same here. The sheet is
// inert while closed, so its links are out of the tab order, and Escape closes it. Closed by
// Escape or its close button, it hands focus back to the menu button, so a keyboard is not left
// on a sheet that has gone; a link chosen in it hands focus to the block the link leads to, so
// the next Tab carries on from there rather than from the top of the page (decision 15, as
// refined on 2 October 2026, docs/template-fit-decisions.md).
export function EmberNav({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)

  // A link's jump to its section clears focus once its click is over, so the hand-back waits
  // until then. A block is not a control, so it holds focus only until focus moves on
  // (ember.css draws it no ring).
  const close = useCallback((chosen: string | null) => {
    setOpen(false)
    window.setTimeout(() => {
      const block = chosen === null ? null : document.getElementById(chosen)
      if (block === null) {
        toggle.current?.focus({ preventScroll: true })
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
    })
  }, [])

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
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(null)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <>
      <header
        className={`fixed top-0 z-20 ${pad} w-full transition-all duration-300 ${scrolled ? 'bg-surface/70 backdrop-blur-md' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 py-4 font-medium">
          <a href="#top" aria-label={`${brand.name} home`}>
            <EmberLogo brand={brand} />
          </a>
          <nav
            aria-label="Main"
            className="hidden flex-wrap items-center justify-center gap-x-6 gap-y-2 whitespace-nowrap md:flex lg:gap-x-10"
          >
            {nav.links.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-on-surface-muted">
                {link.label}
              </a>
            ))}
          </nav>
          <a href={nav.cta.href} className={`hidden whitespace-nowrap md:block ${pill}`}>
            {nav.cta.label}
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
            className={`md:hidden ${menuButton}`}
          >
            <Menu aria-hidden="true" />
          </button>
        </div>
      </header>
      <div
        id={PANEL_ID}
        inert={!open}
        className={`fixed inset-0 z-40 flex transform flex-col items-center justify-center bg-surface/70 p-8 backdrop-blur-md transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <nav aria-label="Mobile" className="flex flex-col items-center space-y-6 font-medium">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-2xl text-on-surface/85 transition hover:text-brand-deeper"
              onClick={() => {
                close(link.href.startsWith('#') ? link.href.slice(1) : null)
              }}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              close(null)
            }}
            aria-label="Close menu"
            className={menuButton}
          >
            <X aria-hidden="true" />
          </button>
        </nav>
      </div>
    </>
  )
}
