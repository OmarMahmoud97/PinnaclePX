import { Fragment } from 'react'
import type { VectorContent, VectorImage } from '../copy-slots'
import { container, pad } from '../styles'

type Credit = NonNullable<VectorImage['credit']>

type Props = Pick<VectorContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

const HEADING = 'mb-6 text-sm font-medium text-surface/60'
const LINK = 'text-surface transition-colors hover:text-surface/60'

// The source's Footer, the page inverted: the ink behind, the surface on it. It sticks to the
// foot of the window from lg, under the page, so the page slides up off it as it ends. At the
// top a giant address (the owner's email when it is known) over a round button; a rule; the
// name and a tagline beside columns of places, services, links and social links; and the small
// links, the legal line (with the photographers' credit the Pexels licence asks for) and a
// closing line.
export function VectorFooter({ brand, footer, credits }: Props) {
  const { places, social } = footer
  return (
    <footer
      id="contact"
      className="scroll-mt-25 bg-on-surface text-surface lg:sticky lg:bottom-0 lg:z-0"
    >
      <div className={`${pad} pt-24 pb-16 text-center sm:text-left lg:pt-32 lg:pb-24 ${container}`}>
        {footer.email !== null && (
          <a
            href={`mailto:${footer.email}`}
            className="text-2xl font-medium tracking-tight break-all transition-opacity hover:opacity-80 sm:text-5xl sm:break-normal lg:text-7xl"
          >
            {footer.email}
          </a>
        )}
        <div className={footer.email === null ? '' : 'mt-10'}>
          <a
            className="inline-flex w-full items-center justify-center rounded-full bg-surface px-8 py-4 text-lg font-medium text-on-surface transition-colors hover:bg-surface/90 sm:w-auto"
            href={footer.cta.href}
          >
            {footer.cta.label}
          </a>
        </div>
      </div>
      <div className={`${pad} ${container}`}>
        <div className="border-t border-surface/10" />
      </div>
      <div className={`${pad} py-16 lg:py-24 ${container}`}>
        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-8">
          <div>
            <span className="text-4xl font-medium tracking-tight">{brand.name}</span>
            <p className="mt-4 text-4xl text-surface/60">{footer.tagline}</p>
          </div>
          <div className="flex flex-col gap-16 sm:flex-row lg:gap-24">
            {places !== null && (
              <div>
                <h4 className={HEADING}>{places.heading}</h4>
                {places.entries.map((entry, index) => (
                  <div
                    key={entry.title}
                    className={index < places.entries.length - 1 ? 'mb-6' : ''}
                  >
                    <p className="mb-1 font-medium">{entry.title}</p>
                    <p className="text-sm text-surface/60">
                      {entry.lines.map((line, i) => (
                        <span key={line}>
                          {i > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div>
              <h4 className={HEADING}>{footer.services.heading}</h4>
              <ul className="space-y-3">
                {footer.services.items.map((item) => (
                  <li key={item}>
                    <span className="text-surface">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={HEADING}>{footer.navigation.heading}</h4>
              <ul className="space-y-3">
                {footer.navigation.links.map((link) => (
                  <li key={link.label}>
                    <a className={LINK} href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {social !== null && (
              <div>
                <h4 className={HEADING}>{social.heading}</h4>
                <ul className="space-y-3">
                  {social.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={`${pad} py-6 ${container}`}>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-6">
            {footer.bottomLinks.map((link) => (
              <a
                key={link.label}
                className="text-sm text-surface/60 transition-colors hover:text-surface"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-sm text-surface/60">
            &copy; {YEAR} {brand.legalName} - All rights reserved
            {credits.length > 0 && (
              <>
                {' '}
                &middot; Photos by{' '}
                {credits.map((credit, index) => (
                  <Fragment key={credit.url}>
                    {index > 0 && (index === credits.length - 1 ? ' and ' : ', ')}
                    <a href={credit.url} className="hover:text-surface">
                      {credit.photographer}
                    </a>
                  </Fragment>
                ))}{' '}
                on{' '}
                <a href="https://www.pexels.com" className="hover:text-surface">
                  Pexels
                </a>
              </>
            )}
          </p>
          {footer.credit !== '' && <p className="text-sm text-surface/60">{footer.credit}</p>}
        </div>
      </div>
    </footer>
  )
}
