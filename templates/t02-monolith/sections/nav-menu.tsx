'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MonolithContent, MonolithLink } from '../copy-slots'
import { button } from '../styles'
import { MonolithLogo } from './logo'

type Props = {
  brand: MonolithContent['brand']
  links: readonly MonolithLink[]
  cta: MonolithLink
  // The class that hides the toggle from the width where the bar shows its links (nav.tsx).
  hide: string
}

const PANEL_ID = 'monolith-menu'

// The source's phone menu, the template's one piece of JavaScript: a sheet that slides in from
// the left over a dark overlay, with the brand name at its head, the links stacked in the
// centre, the bordered button under them and a close mark at the top right. The button under
// the links is at least the source's 110px and grows with its label rather than spill.
//
// Escape, the close mark or a tap on the overlay close the sheet and hand focus back to the menu
// button. Choosing a link closes it and puts focus on the link's section instead, so a keyboard
// user's next Tab goes on from there rather than from the top of the page (decision 15, as
// refined on 2 October 2026). The overlay takes no Tab stop, so the first Tab after opening
// reaches the first link.
export function NavMenu({ brand, links, cta, hide }: Props) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }
  // The link still scrolls to its section; focus moves there without a second scroll.
  const follow = (href: string) => {
    setOpen(false)
    const target = href.startsWith('#') ? document.getElementById(href.slice(1)) : null
    if (target === null) return
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
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

  return (
    <span className={`flex shrink-0 ${hide}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((current) => !current)
        }}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className="px-2"
      >
        <Menu className="flex h-5 w-5" />
        <span className="sr-only">Menu</span>
      </button>

      <div id={PANEL_ID} hidden={!open}>
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-50 cursor-default bg-scrim/80 transition-opacity duration-(--motion-enter) starting:opacity-0"
        />
        <div className="fixed inset-y-0 left-0 z-50 flex h-full w-3/4 flex-col gap-4 border-r border-border bg-surface p-6 shadow-lg transition-[translate,opacity] duration-500 ease-in-out sm:max-w-sm starting:-translate-x-full">
          <div className="flex flex-col text-center sm:text-left [&>*+*]:mt-2">
            <p className="flex justify-center text-xl font-bold sm:justify-start">
              <MonolithLogo brand={brand} />
            </p>
          </div>
          <nav aria-label="Mobile" className="mt-4 flex flex-col items-center justify-center gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  follow(link.href)
                }}
                className={button.ghost}
              >
                {link.label}
              </a>
            ))}
            <a
              href={cta.href}
              onClick={() => {
                follow(cta.href)
              }}
              className={`min-w-[110px] border border-border ${button.secondary}`}
            >
              {cta.label}
            </a>
          </nav>
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-surface transition-opacity hover:opacity-100 focus:ring-2 focus:ring-brand-deepest focus:ring-offset-2 focus:outline-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </span>
  )
}
