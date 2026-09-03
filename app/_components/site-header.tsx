import Link from 'next/link'
import { HeaderChrome } from '@/app/_components/header-chrome'
import { MobileNav } from '@/app/_components/mobile-nav'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// Three links and one button. On a phone the button appears only once the hero's own button has
// scrolled away, taking the wordmark's place beside the mark, so the first screen is unchanged
// and the primary action is never more than a thumb away after it.
export function SiteHeader() {
  return (
    <HeaderChrome>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between border-border px-6 md:border-x">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo nameClassName="max-md:group-data-past-hero:hidden" />
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
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="header-mobile"
            className={buttonStyles({
              size: 'sm',
              className:
                'hidden transition-[opacity,translate,display] transition-discrete duration-(--motion-enter) ease-enter max-md:group-data-past-hero:inline-flex starting:translate-y-1.5 starting:opacity-0',
            })}
          >
            {CTA.label}
          </TrackedLink>
          <MobileNav />
        </div>
      </div>
    </HeaderChrome>
  )
}
