'use client'

import Link from 'next/link'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { BOOK_CALL, CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { LogoMark } from '@/components/brand/logo-mark'
import { Button, buttonStyles } from '@/components/ui/button'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'

const PANEL_ID = 'mobile-nav'

// Each row waits its turn as the sheet opens; five rows, so the last arrives within 160 ms.
function rowDelay(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}

const ROW =
  'transition-[opacity,translate] delay-[calc(var(--i)*40ms)] duration-(--motion-settle) ease-enter starting:translate-y-3 starting:opacity-0'

// The phone menu: a sheet over the whole screen in the page's dark set, the four sections as
// big type with their numerals, and the two actions at the foot. The header stays on top of it
// with its mark and the button, which has turned into the cross; the globals dark scope covers
// the header while the button is expanded, so the mark and the cross read light on the sheet.
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
      {/* See-through with a hairline in the current colour, and dimmed rather than recoloured on
          hover: over the hero the header is drawn inverted (header-chrome.tsx), so a filled
          surface or a coloured ring would show as its opposite. Once the header is solid the
          focus ring takes the site's brand-ink, which the dark scope keeps readable. Above the
          sheet, so the cross stays reachable while it is open. */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-lg"
        className="relative z-50 border-current/30 hover:border-current/30 hover:bg-transparent hover:opacity-60 focus-visible:ring-current group-data-solid:focus-visible:ring-brand-ink"
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
              'absolute h-0.5 w-4 bg-current transition-transform duration-(--motion-enter) ease-standard',
              open ? 'rotate-45' : '-translate-y-1',
            )}
          />
          <span
            className={cn(
              'absolute h-0.5 w-4 bg-current transition-transform duration-(--motion-enter) ease-standard',
              open ? '-rotate-45' : 'translate-y-1',
            )}
          />
        </span>
      </Button>

      <nav
        id={PANEL_ID}
        aria-label="Mobile"
        hidden={!open}
        data-theme="dark"
        className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-surface px-6 pt-28 pb-8 text-on-surface transition-opacity duration-(--motion-enter) ease-enter starting:opacity-0"
      >
        {/* The mark as a watermark in the sheet's empty middle, in the light gradient the dark
            scope gives it, faint enough to be ground rather than a second logo. */}
        <LogoMark
          size={120}
          className="pointer-events-none absolute right-4 bottom-44 opacity-20 sm:bottom-48"
        />
        <ol className="relative flex flex-col">
          {NAV_LINKS.map((link, index) => (
            <li key={link.href} style={rowDelay(index)} className={ROW}>
              <Link
                href={link.href}
                onClick={close}
                className="flex items-baseline gap-4 rounded-md py-3 text-title font-semibold tracking-tight transition-opacity duration-(--motion-tap) hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
              >
                <span aria-hidden="true" className="text-label text-on-surface-muted tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ol>
        <div
          style={rowDelay(NAV_LINKS.length)}
          className={`relative flex flex-col items-center gap-5 ${ROW}`}
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
          <TrackedLink
            href={BOOK_CALL.href}
            event="call_click"
            location="mobile-nav"
            onClick={close}
            className={`${textLinkStyles} text-small`}
          >
            {BOOK_CALL.label}
          </TrackedLink>
        </div>
      </nav>
    </div>
  )
}
