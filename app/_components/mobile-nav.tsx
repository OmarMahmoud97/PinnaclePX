'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { Button, buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'

const PANEL_ID = 'mobile-nav'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => {
    setOpen(false)
  }

  return (
    <div className="md:hidden">
      <Button
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
              'absolute h-0.5 w-4 bg-on-surface transition-transform',
              open ? 'rotate-45' : '-translate-y-1',
            )}
          />
          <span
            className={cn(
              'absolute h-0.5 w-4 bg-on-surface transition-transform',
              open ? '-rotate-45' : 'translate-y-1',
            )}
          />
        </span>
      </Button>

      <nav
        id={PANEL_ID}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-border bg-surface px-6 py-4"
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={close}
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="mobile-nav"
              onClick={close}
              className={buttonStyles({ className: 'w-full' })}
            >
              {CTA.label}
            </TrackedLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}
