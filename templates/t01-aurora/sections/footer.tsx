import { Fragment } from 'react'
import type { AuroraContent, AuroraImage } from '../copy-slots'
import { container, textLink } from '../styles'
import { AuroraLogo } from './logo'

type Credit = NonNullable<AuroraImage['credit']>

type Props = Pick<AuroraContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The brand block and up to two link groups, then the legal line and the photographers' credit
// with the Pexels link the licence asks for.
export function AuroraFooter({ brand, footer, credits }: Props) {
  return (
    <footer className="border-t border-border">
      <div className={`${container} grid gap-10 py-14 md:grid-cols-12`}>
        <div className="md:col-span-6">
          <AuroraLogo brand={brand} />
          <p className="mt-4 max-w-sm text-small text-pretty text-on-surface-muted">
            {brand.tagline}
          </p>
        </div>
        {footer.groups.map((group) => (
          <nav key={group.heading} aria-label={group.heading} className="md:col-span-3">
            <h3 className="text-small font-semibold">{group.heading}</h3>
            <ul className="mt-3 flex flex-col gap-1">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={`inline-block py-1.5 text-small text-on-surface-muted ${textLink}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className={`${container} flex flex-col gap-2 border-t border-border py-6 text-small text-on-surface-muted md:flex-row md:items-center md:justify-between`}
      >
        <p>
          © {YEAR} {brand.legalName}
        </p>
        {credits.length > 0 && (
          <p>
            Photos by{' '}
            {credits.map((credit, index) => (
              <Fragment key={credit.url}>
                {index > 0 && (index === credits.length - 1 ? ' and ' : ', ')}
                <a href={credit.url} className={`underline ${textLink}`}>
                  {credit.photographer}
                </a>
              </Fragment>
            ))}{' '}
            on{' '}
            <a href="https://www.pexels.com" className={`underline ${textLink}`}>
              Pexels
            </a>
          </p>
        )}
      </div>
    </footer>
  )
}
