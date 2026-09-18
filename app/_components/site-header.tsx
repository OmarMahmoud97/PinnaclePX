import Link from 'next/link'
import { HeaderChrome } from '@/app/_components/header-chrome'
import { MobileNav } from '@/app/_components/mobile-nav'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

// A link in the header: text in the current colour, dimmed on hover rather than recoloured,
// because over the hero the header is drawn inverted (header-chrome.tsx) and any colour set in
// here would show as its opposite. The focus outline follows the text for the same reason.
const headerLink =
  'inline-flex h-8 items-center px-3 text-sm font-medium transition-opacity duration-(--motion-tap) hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'

// The wordmark, the section links, a rule, and the ask, as the reference lays its nav out. Over
// the hero the ask is a link like the others; once the header is solid it becomes the filled
// button, which the blend would otherwise invert. On a phone the button appears only once the
// hero's own button has scrolled away, taking the wordmark's place beside the mark, so the
// first screen is unchanged and the primary action is never more than a thumb away after it.
export function SiteHeader() {
  return (
    <HeaderChrome>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:group-data-scrolled:border-x md:group-data-scrolled:border-border">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo nameClassName="max-md:group-data-past-hero:hidden" />
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={headerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {/* The rule between the sections and the ask: the current colour at 30%, which
                  reads as a mid grey after the difference blend and as itself once solid. */}
              <li aria-hidden="true" className="mx-3 h-px w-8 bg-current opacity-30" />
              <li>
                <TrackedLink
                  href={CTA.href}
                  event="cta_click"
                  location="header"
                  className={cn(headerLink, 'group-data-scrolled:hidden')}
                >
                  {CTA.label}
                </TrackedLink>
                <TrackedLink
                  href={CTA.href}
                  event="cta_click"
                  location="header"
                  className={buttonStyles({ className: 'hidden group-data-scrolled:inline-flex' })}
                >
                  {CTA.label}
                </TrackedLink>
              </li>
            </ul>
          </nav>
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
