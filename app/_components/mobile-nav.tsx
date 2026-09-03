'use client'

import Link from 'next/link'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { Button, buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'

const PANEL_ID = 'mobile-nav'

// Each row waits its turn as the panel opens; four rows, so the last arrives within 120 ms.
function rowDelay(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = () => {
    setOpen(false)
  }

  // Escape closes and returns focus to the button; a tap anywhere outside closes.
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
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon-lg"
        onClick={() => {
          setOpen((current) => !current)
        }}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="Menu"
      >
        <span aria-hidden="true" className="relative flex size-5 items-center justify-center">
          <span
            className={cn(
              'absolute h-0.5 w-4 bg-on-surface transition-transform duration-(--motion-enter) ease-standard',
              open ? 'rotate-45' : '-translate-y-1',
            )}
          />
          <span
            className={cn(
              'absolute h-0.5 w-4 bg-on-surface transition-transform duration-(--motion-enter) ease-standard',
              open ? '-rotate-45' : 'translate-y-1',
            )}
          />
        </span>
      </Button>

      <nav
        id={PANEL_ID}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-border bg-surface px-6 py-4 transition-[opacity,translate] duration-(--motion-enter) ease-enter starting:-translate-y-2 starting:opacity-0"
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link, index) => (
            <li
              key={link.href}
              style={rowDelay(index)}
              className="transition-[opacity,translate] delay-[calc(var(--i)*30ms)] duration-(--motion-enter) ease-enter starting:-translate-y-1 starting:opacity-0"
            >
              <Link
                href={link.href}
                onClick={close}
                className="block rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-(--motion-tap) hover:bg-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li
            style={rowDelay(NAV_LINKS.length)}
            className="pt-2 transition-[opacity,translate] delay-[calc(var(--i)*30ms)] duration-(--motion-enter) ease-enter starting:-translate-y-1 starting:opacity-0"
          >
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="mobile-nav"
              onClick={close}
              className={buttonStyles({ size: 'lg', className: 'w-full' })}
            >
              {CTA.label}
            </TrackedLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}
