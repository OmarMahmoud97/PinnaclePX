'use client'

import { useEffect, useRef, useState } from 'react'
import type { AuroraLink } from '../copy-slots'
import { button } from '../styles'

type Props = { links: readonly AuroraLink[]; cta: AuroraLink }

const PANEL_ID = 'aurora-menu'

const LINE =
  'absolute h-0.5 w-4 bg-on-surface transition-transform duration-(--motion-enter) ease-standard'

// The phone menu: the template's one piece of JavaScript. A button that opens a panel under the
// header; Escape closes and returns focus, a tap outside closes, and choosing a link closes.
export function NavMenu({ links, cta }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node) !== true) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div ref={rootRef} className="md:hidden">
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
        className="absolute inset-x-0 top-16 border-b border-border bg-surface px-6 py-4 transition-[opacity,translate] duration-(--motion-enter) ease-enter starting:-translate-y-2 starting:opacity-0"
      >
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={close}
                className="block rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-(--motion-tap) hover:bg-on-surface/6"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a href={cta.href} onClick={close} className={`${button.primary} w-full`}>
              {cta.label}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
