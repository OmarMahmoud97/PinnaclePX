import Link from 'next/link'
import { MobileNav } from '@/app/_components/mobile-nav'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { ThemeToggle } from '@/app/_components/theme-toggle'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="PinnaclePX home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={buttonStyles({
                    variant: 'ghost',
                    size: 'sm',
                    className: 'border border-transparent hover:border-border',
                  })}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={CTA.href} className={buttonStyles({ className: 'hidden md:inline-flex' })}>
            {CTA.label}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
