import { Fragment } from 'react'
import type { HarborContent, HarborImage } from '../copy-slots'
import { container } from '../styles'
import { HarborLogo } from './logo'
import { SocialIcon, socialLabel } from './socials'

type Credit = NonNullable<HarborImage['credit']>

type Props = Pick<HarborContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's Footer: the name set huge and almost invisible along its foot, then the logo, a
// paragraph and a joined email field and arrow button at the left, three columns of links at
// the right, and under a hairline the legal line, the ringed social marks and a line of small
// print. The email field offered news by email and the small print named privacy and terms
// pages; no visitor's sentence offers news and a taster has neither page, so neither is drawn,
// though the copy still carries their words. The columns' headings are h3, one level under the
// page's block headings, where the source's h4 skipped one. The source's own maker's credit is
// not here; the photographers' credit the Pexels licence asks for is.
export function HarborFooter({ brand, footer, credits }: Props) {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface pt-20 pb-10">
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 flex items-end justify-center overflow-hidden select-none"
        aria-hidden="true"
      >
        <span className="translate-y-6 font-display text-[22vw] leading-none font-black tracking-tighter text-on-surface/2.5 uppercase">
          {brand.name}
        </span>
      </div>
      <div className={`${container} relative z-10`}>
        <div className="mb-20 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <a
              className="mb-6 flex items-center gap-2"
              href="#top"
              aria-label={`${brand.name} home`}
            >
              <HarborLogo brand={brand} />
            </a>
            <p className="max-w-xs text-sm leading-relaxed text-on-surface-muted">
              {footer.description}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-8">
            {footer.columns.map((column) => (
              <div key={column.heading}>
                <h3 className="mb-5 font-display text-xs font-black tracking-widest text-on-surface uppercase">
                  {column.heading}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        className="text-sm text-on-surface-muted transition-colors duration-200 hover:text-on-surface"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-on-surface-muted">
            &copy; {YEAR} {brand.legalName}. All rights reserved.
            {footer.note === '' ? '' : ` ${footer.note}`}
          </p>
          {footer.socials !== null && (
            <div className="flex items-center gap-3">
              {footer.socials.map((social) => (
                <a
                  key={social.network}
                  href={social.href}
                  aria-label={socialLabel(social.network)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-on-surface/10 text-on-surface/60 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.15] hover:border-brand-deeper/50 hover:text-brand-deeper active:scale-90"
                >
                  <SocialIcon network={social.network} />
                </a>
              ))}
            </div>
          )}
          {credits.length > 0 && (
            <p className="text-xs text-on-surface-muted">
              Photos by{' '}
              {credits.map((credit, index) => (
                <Fragment key={credit.url}>
                  {index > 0 && (index === credits.length - 1 ? ' and ' : ', ')}
                  <a href={credit.url} className="underline">
                    {credit.photographer}
                  </a>
                </Fragment>
              ))}{' '}
              on{' '}
              <a href="https://www.pexels.com" className="underline">
                Pexels
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
