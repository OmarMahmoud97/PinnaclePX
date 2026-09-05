'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { MeridianContent, MeridianLink } from '../copy-slots'
import { button, separator } from '../styles'
import { MeridianLogo } from './logo'

type Props = { brand: MeridianContent['brand']; links: readonly MeridianLink[]; cta: MeridianLink }

const PANEL_ID = 'meridian-menu'

// The source's phone menu, the template's one piece of JavaScript: a sheet that slides in from
// the left over a dark overlay, its right corners rounded, with the logo at its head, the links
// stacked as ghost buttons, and a rule at its foot over the button where the source had its
// theme toggle. Escape closes and returns focus, a tap on the overlay closes, and choosing a
// link closes.
export function NavMenu({ brand, links, cta }: Props) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
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
    <div className="flex items-center lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((current) => !current)
        }}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="Menu"
        className="cursor-pointer lg:hidden"
      >
        <Menu />
      </button>

      <div id={PANEL_ID} hidden={!open}>
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-0 z-50 cursor-default bg-scrim/80 transition-opacity duration-(--motion-enter) starting:opacity-0"
        />
        <div className="fixed inset-y-0 left-0 z-50 flex h-full w-3/4 flex-col justify-between gap-4 rounded-tr-2xl rounded-br-2xl border-r border-surface-muted bg-accent p-6 shadow-lg transition-[translate,opacity] duration-500 ease-in-out sm:max-w-sm starting:-translate-x-full">
          <div>
            <div className="mb-4 ml-4 flex flex-col text-center sm:text-left [&>*+*]:mt-2">
              <p className="flex items-center text-lg font-semibold text-on-surface">
                <a href="#top" className="flex items-center">
                  <MeridianLogo brand={brand} />
                </a>
              </p>
            </div>

            <nav aria-label="Mobile" className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`${button.ghost} justify-start text-base`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-start justify-start">
            <hr className={`${separator} mb-2 border-0`} />
            <a href={cta.href} onClick={close} className={button.ghostSm}>
              {cta.label}
            </a>
          </div>

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
    </div>
  )
}
