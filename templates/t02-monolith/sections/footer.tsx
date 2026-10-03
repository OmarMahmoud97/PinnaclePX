import { Fragment } from 'react'
import type { MonolithContent, MonolithImage } from '../copy-slots'
import { fitWord, longestWord } from '../fit'
import { container } from '../styles'
import { MonolithLogo } from './logo'

type Credit = NonNullable<MonolithImage['credit']>

type Props = Pick<MonolithContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// A link column's width on the narrowest phone, 320px: the screen less 24px each side and the
// 48px between two columns, halved; and the links' own size.
const PHONE_COLUMN = 112
const LINK_SIZE = 16

// The source's Footer: a rule, a grid with the logo across the first columns and up to four
// columns of links, then a centred legal line, here followed by the photographers' credit the
// Pexels licence asks for. The source set the legal line as a heading; it is text here, and the
// legal name may break anywhere when one word is wider than the screen.
//
// The source set the columns' headings and links at fixed sizes, so a long word ran past its
// column, and on a phone past the screen. Here each column is a container, and the headings
// share one size and the links another, never larger than lets their longest word (fit.ts) fit
// the column; a hyphenated word may break after its hyphen, as a link such as "End-of-tenancy"
// did in the source. On a phone the columns stand two to a row while every word fits a 320px
// phone's column at the links' size, and one to a row below sm when one does not, so no word
// there is set smaller than the links.
export function MonolithFooter({ brand, footer, credits }: Props) {
  const headings = footer.groups.map((group) => group.heading)
  const labels = footer.groups.flatMap((group) => group.links.map((link) => link.label))
  const stacked = LINK_SIZE * longestWord([...headings, ...labels], true) > 0.97 * PHONE_COLUMN
  const headingWord = fitWord(headings, true)
  return (
    <footer id="footer">
      <hr className="mx-auto w-11/12 border-border" />

      <section
        className={`${container} grid ${stacked ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} gap-x-12 gap-y-8 py-20 md:grid-cols-4 xl:grid-cols-6`}
        style={fitWord(labels, true)}
      >
        <div className="col-span-full xl:col-span-2">
          <a href="#top" className="flex text-xl font-bold">
            <MonolithLogo brand={brand} />
          </a>
        </div>

        {footer.groups.map((group) => (
          <div key={group.heading} className="@container flex flex-col gap-2">
            <h3
              className="text-[length:min(1.125rem,97cqi/var(--monolith-word,1))] leading-[1.56] font-bold"
              style={headingWord}
            >
              {group.heading}
            </h3>
            {group.links.map((link) => (
              <div key={link.label}>
                <a
                  href={link.href}
                  className="text-[length:min(1rem,97cqi/var(--monolith-word,1))] opacity-60 hover:opacity-100"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className={`${container} pb-14 text-center`}>
        <p className="wrap-anywhere">
          &copy; {YEAR} {brand.legalName}
        </p>
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
