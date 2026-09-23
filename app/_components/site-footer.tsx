import Link from 'next/link'
import { FOOTER_GROUPS } from '@/app/_components/footer-links'
import { FOOTER } from '@/app/_components/section-copy'
import { shell } from '@/app/_components/section-styles'
import { Logo } from '@/components/brand/logo'
import { eyebrowStyles } from '@/components/ui/caption'
import { TrackedAnchor } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

// The page ends on the hero's foot again (ADR 0034, plan 7.10): a dark sheet with rounded top
// corners laid over the closing's white, holding the two link groups side by side from the
// smallest screen and the identity block beside or under them, with no rule between any of
// them. Under the columns the studio's name sits at display size in a slate a whisper lighter
// than the ground, cut off by the page's bottom edge; it is decoration, so it is hidden from
// assistive technology and cannot be selected, and it stays inside the footer's clip so a
// phone never scrolls sideways to reach the rest of it. From md up the choreography
// (app/_components/motion/footer.ts) scrubs it the last of the way up as the sheet arrives.
export function SiteFooter() {
  return (
    <footer data-theme="dark" className="sheet overflow-clip bg-surface pt-band-sm">
      <div className={shell}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-10">
          {FOOTER_GROUPS.map(({ heading, links }) => (
            <nav key={heading} aria-label={heading} className="flex flex-col gap-3">
              {/* Merged rather than appended: the recipe's own muted colour is emitted later in
                  the sheet and would win over a plain text-on-surface beside it. */}
              <h3 className={cn(eyebrowStyles, 'text-on-surface')}>{heading}</h3>
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block rounded-sm py-1.5 text-small text-on-surface-muted transition-colors duration-(--motion-tap) hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="col-span-2 flex flex-col gap-4 text-on-surface md:col-span-1">
            <Logo />
            <p className="text-small text-on-surface-muted">{FOOTER.blurb}</p>
            {(SITE.town !== null || SITE.contactEmail !== null) && (
              <p className="text-small text-on-surface-muted">
                {SITE.town !== null && `${SITE.legalName}, ${SITE.town}, UK. `}
                {SITE.contactEmail !== null && (
                  <TrackedAnchor
                    href={`mailto:${SITE.contactEmail}`}
                    event="contact_click"
                    location="footer"
                    className="underline underline-offset-4 hover:text-on-surface"
                  >
                    {SITE.contactEmail}
                  </TrackedAnchor>
                )}
              </p>
            )}
            <p className="text-small text-on-surface-muted">
              © {new Date().getFullYear()} {SITE.legalName}
            </p>
          </div>
        </div>
        {/* The name sits in its own box so the scrub's transform lands on the span, never on
            the p: GSAP folds an element's own CSS translate into its transform and clears it,
            which would undo the cut. */}
        <p aria-hidden="true" className="wordmark mt-16 md:mt-20">
          <span className="inline-block">{SITE.name}</span>
        </p>
      </div>
    </footer>
  )
}
