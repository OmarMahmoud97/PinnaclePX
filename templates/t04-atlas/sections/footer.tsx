import { Fragment } from 'react'
import type { AtlasContent, AtlasImage } from '../copy-slots'
import { button, navLink } from '../styles'
import { AtlasLogo } from './logo'
import { Mdi } from './mdi'

type Credit = NonNullable<AtlasImage['credit']>

type Props = Pick<AtlasContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's BaseFooter: a ruled band of four cells, the logo beside the first column of
// links, two more columns of links, and a fourth cell with a newsletter's title, line, input and
// arrow button (or, without one, a note and a button); then the legal line, with the
// photographers' credit the Pexels licence asks for. The cell borders are the source's, cell by
// cell and breakpoint by breakpoint.
export function AtlasFooter({ brand, footer, credits }: Props) {
  const [first = [], second = [], third = []] = footer.columns
  const { newsletter } = footer
  const email = newsletter?.email ?? null
  return (
    <footer className="mx-auto max-w-(--breakpoint-xl) px-8">
      <div className="w-full border-y border-border">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          <div className="flex w-full flex-col border-border py-6 sm:w-1/2 sm:flex-row sm:border-r-0 sm:px-6 sm:py-12 md:w-full lg:w-full xl:w-fit sm:[&>*+*]:ml-10">
            <div className="mb-6 sm:mb-0 sm:hidden xl:block">
              <a href="#top" aria-label={`${brand.name} home`}>
                <AtlasLogo brand={brand} where="footer" />
              </a>
            </div>
            <ul className="[&>*+*]:mt-4">
              {first.map((link) => (
                <li key={link.label} className="w-full">
                  <a className={navLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full border-t border-border py-6 sm:w-1/2 sm:border-t sm:px-16 sm:py-12 md:w-full lg:w-full lg:border-r xl:w-fit xl:border-r">
            <ul className="[&>*+*]:mt-4">
              {second.map((link) => (
                <li key={link.label} className="w-full">
                  <a className={navLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full border-t border-border py-6 sm:w-1/2 sm:border-t-0 sm:border-r-0 sm:px-16 sm:py-12 md:w-full md:border-t lg:w-full xl:w-fit">
            <ul className="[&>*+*]:mt-4">
              {third.map((link) => (
                <li key={link.label} className="w-full">
                  <a className={navLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full border-border py-6 sm:w-1/2 sm:border-t sm:px-10 sm:py-12 md:w-full md:border-t lg:w-full xl:w-[22rem] [&>*+*]:mt-4">
            {newsletter === null ? (
              <>
                <h5 className="text-sm font-medium text-on-surface-muted">{footer.note.title}</h5>
                <p className="text-sm text-on-surface-muted">{footer.note.body}</p>
                <a href={footer.action.href} className={`${button.gradient} px-6 py-3`}>
                  {footer.action.label}
                </a>
              </>
            ) : (
              <>
                <h5 className="text-sm font-medium text-on-surface-muted">{newsletter.title}</h5>
                <p className="text-sm text-on-surface-muted">{newsletter.body}</p>
                <form
                  className="flex items-center [&>*+*]:ml-2"
                  action={
                    email === null
                      ? '#start'
                      : `mailto:${email}?subject=${encodeURIComponent(newsletter.title)}`
                  }
                  method={email === null ? 'get' : 'post'}
                  encType={email === null ? undefined : 'text/plain'}
                >
                  <input
                    type="email"
                    name="email"
                    aria-label={newsletter.title}
                    className="w-full rounded-lg border border-on-surface-muted/60 px-2 py-4 text-sm placeholder:text-on-surface-muted/80 focus:outline-none sm:rounded-md sm:py-3"
                    placeholder={newsletter.placeholder}
                  />
                  <button
                    type="submit"
                    aria-label={newsletter.title}
                    className="atlas-blue-gradient rounded-md px-4 py-4 text-on-brand transition duration-300 hover:shadow-md sm:py-3"
                  >
                    <Mdi name="arrowRight" size={20} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="py-8 text-center text-sm text-on-surface-muted hover:text-on-surface sm:py-4">
        &copy; Copyright {YEAR} {brand.legalName}. All rights reserved
        {credits.length > 0 && (
          <span className="block">
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
          </span>
        )}
      </div>
    </footer>
  )
}
