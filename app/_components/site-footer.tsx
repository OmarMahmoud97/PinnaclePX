import Link from 'next/link'
import { FOOTER_GROUPS } from '@/app/_components/footer-links'
import { Logo } from '@/components/brand/logo'
import { TrackedAnchor } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// Two link groups side by side from the smallest screen, and the identity block under them: the
// mark, the place and the inbox once the owner supplies them, the brand line, the copyright.
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="grid grid-cols-2 md:grid-cols-3 md:divide-x md:divide-border">
        {FOOTER_GROUPS.map(({ heading, links }) => (
          <nav key={heading} aria-label={heading} className="flex flex-col gap-3 p-6 md:p-column">
            <h3 className="text-small font-semibold">{heading}</h3>
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block py-1.5 text-small text-on-surface-muted transition-colors duration-(--motion-tap) hover:text-on-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 flex flex-col gap-4 border-t border-border p-6 md:col-span-1 md:border-t-0 md:p-column">
          <Logo />
          <p className="text-small text-on-surface-muted">
            A UK web design studio. See three homepage designs in your own brand before you decide.
          </p>
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
    </footer>
  )
}
