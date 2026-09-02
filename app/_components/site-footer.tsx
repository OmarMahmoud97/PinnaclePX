import Link from 'next/link'
import { FOOTER_GROUPS } from '@/app/_components/footer-links'
import { Logo } from '@/components/brand/logo'

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border">
      <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {FOOTER_GROUPS.map(({ heading, links }) => (
          <nav key={heading} aria-label={heading} className="flex flex-col gap-4 p-8 lg:pt-18">
            <h3 className="text-sm font-semibold">{heading}</h3>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-muted transition-colors hover:text-on-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="flex flex-col gap-4 p-8 lg:pt-18">
          <Logo />
          <p className="text-sm text-on-surface-muted">
            A branded landing page preview from a five-question brief.
          </p>
          <p className="text-sm text-on-surface-muted">© {new Date().getFullYear()} PinnaclePX</p>
        </div>
      </div>
    </footer>
  )
}
