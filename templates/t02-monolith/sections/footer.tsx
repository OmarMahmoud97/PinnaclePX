import { Fragment } from 'react'
import type { MonolithContent, MonolithImage } from '../copy-slots'
import { container } from '../styles'
import { MonolithLogo } from './logo'

type Credit = NonNullable<MonolithImage['credit']>

type Props = Pick<MonolithContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's Footer: a rule, a grid with the logo across the first columns and up to four
// columns of links, then a centred legal line, here followed by the photographers' credit the
// Pexels licence asks for.
export function MonolithFooter({ brand, footer, credits }: Props) {
  return (
    <footer id="footer">
      <hr className="mx-auto w-11/12 border-border" />

      <section
        className={`${container} grid grid-cols-2 gap-x-12 gap-y-8 py-20 md:grid-cols-4 xl:grid-cols-6`}
      >
        <div className="col-span-full xl:col-span-2">
          <a href="#top" className="flex text-xl font-bold">
            <MonolithLogo brand={brand} />
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
      </section>

      <section className={`${container} pb-14 text-center`}>
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
    </footer>
  )
}
