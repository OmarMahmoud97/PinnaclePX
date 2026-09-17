import { Mail, MapPin, Phone } from 'lucide-react'
import { Fragment } from 'react'
import type { SummitContent, SummitImage } from '../copy-slots'
import { delay, gap, pad } from '../styles'
import { SummitLogo } from './logo'

type Credit = NonNullable<SummitImage['credit']>

type Props = Pick<SummitContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

const COLUMN = 'flex flex-col items-center text-center md:items-start md:text-left'
const LINK = 'text-on-surface/55 hover:text-on-surface/37'

// The source's Footer: the logo and a line, then columns of links and a Get in touch column of
// a mail link, a phone link and an address behind small icons, all centred below md; a rule;
// the legal line beside the small links (here with the photographers' credit the Pexels
// licence asks for); and behind it all the name drawn huge as an outline, its foot below the
// page's edge. The logo, the line and every link rise as they arrive.
export function SummitFooter({ brand, footer, credits }: Props) {
  const { contact } = footer
  const rows = [
    contact.email === null
      ? null
      : { Icon: Mail, href: `mailto:${contact.email}`, label: contact.email },
    contact.phone === null
      ? null
      : { Icon: Phone, href: `tel:${contact.phone}`, label: contact.phone },
    contact.address === null ? null : { Icon: MapPin, href: '#top', label: contact.address },
  ].flatMap((row) => (row === null ? [] : [row]))
  return (
    <footer className={`relative w-full overflow-hidden pb-4 ${gap}`}>
      <div className={`relative z-10 mx-auto w-full max-w-360 ${pad}`}>
        <div className="flex flex-col flex-wrap items-center justify-between gap-12 pb-16 md:flex-row md:items-start">
          <div className={COLUMN}>
            <a href="#top" data-fade aria-label={`${brand.name} home`}>
              <SummitLogo brand={brand} />
            </a>
            <p
              data-fade
              style={delay(0.2)}
              className="mt-3 max-w-84 text-sm/5.5 text-on-surface/55"
            >
              {footer.description}
            </p>
          </div>
          {footer.columns.map((column) => (
            <div key={column.heading} className={COLUMN}>
              <span className="mb-5 font-medium text-on-surface/85">{column.heading}</span>
              <div className="flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    data-fade
                    style={delay(0.2)}
                    className={LINK}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          {rows.length > 0 && (
            <div className={COLUMN}>
              <span className="mb-5 font-medium text-on-surface/85">{contact.heading}</span>
              <div className="flex flex-col gap-2.5 text-sm">
                {rows.map(({ Icon, href, label }) => (
                  <div
                    key={label}
                    data-fade
                    style={delay(0.2)}
                    className={`flex items-center justify-center gap-2.5 md:justify-start ${LINK}`}
                  >
                    <Icon size={16} aria-hidden="true" className="shrink-0" />
                    <a href={href}>{label}</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-4.5 text-sm text-on-surface/37 md:flex-row">
          <p>
            &copy; {YEAR} {brand.legalName}. All rights reserved.
            {credits.length > 0 && (
              <>
                {' '}
                Photos by{' '}
                {credits.map((credit, index) => (
                  <Fragment key={credit.url}>
                    {index > 0 && (index === credits.length - 1 ? ' and ' : ', ')}
                    <a href={credit.url}>{credit.photographer}</a>
                  </Fragment>
                ))}{' '}
                on <a href="https://www.pexels.com">Pexels</a>.
              </>
            )}
          </p>
          {footer.smallLinks.length > 0 && (
            <div className="flex gap-9">
              {footer.smallLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-on-surface/17"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 text-center select-none"
      >
        <span className="summit-watermark block translate-y-[15%] text-[80px] leading-none font-medium sm:text-[140px] md:text-[220px]">
          {brand.name}
        </span>
      </div>
    </footer>
  )
}
