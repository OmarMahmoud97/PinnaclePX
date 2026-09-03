import Link from 'next/link'
import { MobileNav } from '@/app/_components/mobile-nav'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="header"
            className={buttonStyles({ className: 'hidden md:inline-flex' })}
          >
            {CTA.label}
          </TrackedLink>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
