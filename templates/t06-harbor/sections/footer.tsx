import { ArrowUpRight } from 'lucide-react'
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
// print. The source's email field did nothing; here it posts to the owner's email as a mail
// message when it is known, and otherwise leads to the page's ask. The source's own maker's
// credit is not here; the photographers' credit the Pexels licence asks for is.
export function HarborFooter({ brand, footer, credits }: Props) {
  const { newsletter } = footer
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
            <p className="mb-8 max-w-xs text-sm leading-relaxed text-on-surface/60">
              {footer.description}
            </p>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-widest text-on-surface uppercase">
                {newsletter.label}
              </p>
              <form
                className="flex"
                action={
                  newsletter.email === null
                    ? '#cta'
                    : `mailto:${newsletter.email}?subject=${encodeURIComponent(newsletter.label)}`
                }
                method={newsletter.email === null ? 'get' : 'post'}
                encType={newsletter.email === null ? undefined : 'text/plain'}
              >
                <input
                  type="email"
                  name="email"
                  aria-label={newsletter.label}
                  placeholder={newsletter.placeholder}
                  className="flex-1 rounded-l-full border border-r-0 border-on-surface/10 bg-accent px-5 py-3 text-sm text-on-surface placeholder:text-on-surface/40 focus:border-brand-deeper/30 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label={newsletter.label}
                  className="rounded-r-full bg-brand-deeper px-5 py-3 text-sm font-bold text-on-brand transition-colors hover:bg-brand-deepest"
                >
                  <ArrowUpRight size={16} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-8">
            {footer.columns.map((column) => (
              <div key={column.heading}>
                <h4 className="mb-5 font-display text-xs font-black tracking-widest text-on-surface uppercase">
                  {column.heading}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        className="text-sm text-on-surface/60 transition-colors duration-200 hover:text-on-surface"
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
          <p className="text-xs text-on-surface/40">
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
            <p className="text-xs text-on-surface/40">
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
          <p className="text-xs text-on-surface/40">{footer.smallPrint}</p>
        </div>
      </div>
    </footer>
  )
}
