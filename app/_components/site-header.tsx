import Link from 'next/link'
import { HeaderChrome } from '@/app/_components/header-chrome'
import { headerLink } from '@/app/_components/header-link'
import { MobileNav } from '@/app/_components/mobile-nav'
import { CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// The ask: the same element in both states, so the fill grows around the same words instead of
// one link swapping for another. Over the hero it is a text link like the others; once the
// hero's own button has left the top of the viewport the chrome sets `data-filled` beside
// `data-past-hero` (only ever while the blend is normal, since brand blue under the difference
// blend would show as orange), and it is the primary button from components/ui/button.tsx, size
// md, filling where it stands on the settled pill, so the two blue buttons are never on screen
// together. The padding is the button's throughout, so nothing beside it moves, and only the
// height, the fill and the ink change. The timing, and the ink, are `.header-ask` in
// app/globals.css.
const headerCta =
  'header-ask inline-flex h-8 items-center rounded-full px-4 text-sm font-medium hover:opacity-60 lg:px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current group-data-filled:h-10 group-data-filled:bg-brand-deeper group-data-filled:hover:bg-brand-deepest group-data-filled:hover:opacity-100 group-data-filled:focus-visible:outline-brand-ink group-data-filled:motion-safe:active:scale-[0.98]'

// The wordmark, the section links, a rule, and the ask, as the reference lays its nav out, in
// one row that is two things (app/_styles/header.css): over the hero the row spans the column,
// see-through and blended by difference; once the page has scrolled (`data-island`) it draws in
// to a floating pill in the middle of the bar, on a glass of the page's own surface, with the
// same elements in the same order. Between md and lg the pill folds the name beside the mark
// away, because at 768 the four links and the ask fill it on their own. Under the section
// links a dot of the product's blue marks the section the reader is in, moved by the chrome.
// On a phone the button unfolds only once the hero's own button has scrolled away, as the name
// beside the mark folds, so the first screen is unchanged and the primary action is never more
// than a thumb away after it; both fold by grid track (`.header-name`, `.header-ask-phone`).
// The mark and the menu button sit above the phone sheet the menu opens (mobile-nav.tsx),
// which is why they carry a z-index.
export function SiteHeader() {
  return (
    <HeaderChrome>
      <div className="header-row mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" aria-label={`${SITE.name} home`} className="relative z-50 shrink-0">
          <Logo nameClassName="header-name" />
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="relative hidden md:block">
            <ul className="flex items-center gap-1 whitespace-nowrap">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={headerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
              {/* The rule between the sections and the ask: the current colour at 30%, which
                  reads as a mid grey after the difference blend and as itself once solid. It
                  waits for lg: at md the pill holds the mark, four links and the ask with
                  nothing to spare, so the rule sits out. */}
              <li
                aria-hidden="true"
                className="mx-3 hidden h-px w-8 bg-current opacity-30 lg:block"
              />
              <li>
                <TrackedLink
                  href={CTA.href}
                  event="cta_click"
                  location="header"
                  className={headerCta}
                >
                  {CTA.label}
                </TrackedLink>
              </li>
            </ul>
            {/* The ink dot, placed under the current section's link by the chrome (--dot-x). */}
            <span aria-hidden="true" className="header-dot" />
          </nav>
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="header-mobile"
            className={buttonStyles({ size: 'sm', className: 'header-ask-phone hidden' })}
          >
            {CTA.label}
          </TrackedLink>
          <MobileNav />
        </div>
      </div>
    </HeaderChrome>
  )
}
