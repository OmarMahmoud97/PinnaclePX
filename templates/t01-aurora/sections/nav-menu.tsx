'use client'

import { useEffect, useRef, useState } from 'react'
import type { AuroraLink } from '../copy-slots'
import { button } from '../styles'

type Props = {
  links: readonly AuroraLink[]
  cta: AuroraLink
  // The class that hides the menu's button from the width where the bar shows its links (nav.tsx).
  hide: string
}

const PANEL_ID = 'aurora-menu'

const LINE =
  'absolute h-0.5 w-4 bg-on-surface transition-transform duration-(--motion-enter) ease-standard'

// The menu wherever the bar does not show its links: the template's one piece of JavaScript. A
// button that opens a panel under the header, holding the links, and the bar's button too below
// md, where the bar does not show it.
//
// Escape closes the panel and hands focus back to the menu button, and so does a press outside
// it on nothing that takes focus. Choosing a link closes it and puts focus on the link's section
// instead, so a keyboard user's next Tab goes on from there rather than from the top of the page
// (decision 15, as refined on 2 October 2026). The panel follows the button, so the first Tab
// after opening reaches the first link.
export function NavMenu({ links, cta, hide }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
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
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node) === true) return
      setOpen(false)
      // Once the press has moved focus where it goes: a link or a field pressed keeps it, and a
      // press on nothing that takes focus hands it back to the menu button.
      setTimeout(() => {
        const active = document.activeElement
        if (active === null || active === document.body) buttonRef.current?.focus()
      }, 0)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div ref={rootRef} className={hide}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((current) => !current)
        }}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="Menu"
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-on-surface/15 transition-colors duration-(--motion-tap) outline-none hover:bg-on-surface/5 focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span aria-hidden="true" className="relative flex size-5 items-center justify-center">
          <span className={`${LINE} ${open ? 'rotate-45' : '-translate-y-1'}`} />
          <span className={`${LINE} ${open ? '-rotate-45' : 'translate-y-1'}`} />
        </span>
      </button>

      <nav
        id={PANEL_ID}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-surface px-6 py-4 transition-[opacity,translate] duration-(--motion-enter) ease-enter md:px-10 starting:-translate-y-2 starting:opacity-0"
      >
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => {
                  follow(link.href)
                }}
                className="block rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-(--motion-tap) hover:bg-on-surface/6"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2 md:hidden">
            <a
              href={cta.href}
              onClick={() => {
                follow(cta.href)
              }}
              className={`${button.primary} w-full`}
            >
              {cta.label}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
