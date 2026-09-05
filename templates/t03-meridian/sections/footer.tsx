import { Fragment } from 'react'
import type { MeridianContent, MeridianImage } from '../copy-slots'
import { container, separator } from '../styles'
import { MeridianLogo } from './logo'

type Credit = NonNullable<MeridianImage['credit']>

type Props = Pick<MeridianContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's FooterSection: one bordered, rounded panel on the card surface holding the logo
// across the first columns, up to four columns of links, a rule, and the legal line, here
// followed by the photographers' credit the Pexels licence asks for.
export function MeridianFooter({ brand, footer, credits }: Props) {
  return (
    <footer id="footer" className={`${container} py-24 sm:py-32`}>
      <div className="rounded-2xl border border-surface-muted bg-accent p-10">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4 xl:grid-cols-6">
          <div className="col-span-full xl:col-span-2">
            <a href="#top" className="flex items-center font-bold">
              <MeridianLogo brand={brand} size="footer" />
            </a>
          </div>

          {footer.groups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-2">
              <h3 className="text-lg font-bold">{group.heading}</h3>
              {group.links.map((link) => (
                <div key={link.label}>
                  <a href={link.href} className="opacity-60 hover:opacity-100">
                    {link.label}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>

        <hr className={`${separator} my-6 border-0`} />
        <section>
          <h3>
            &copy; {YEAR} {brand.legalName}
          </h3>
          {credits.length > 0 && (
            <p className="mt-2 text-sm text-on-surface-muted">
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
        </section>
      </div>
    </footer>
  )
}
