import { Mail, Phone } from 'lucide-react'
import { Fragment } from 'react'
import type { EmberContent, EmberImage } from '../copy-slots'
import { delay, footerLink, pad } from '../styles'
import { EmberLogo } from './logo'
import { SocialIcon, socialLabel } from './socials'

type Credit = NonNullable<EmberImage['credit']>

type Props = Pick<EmberContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's Footer: the logo, a line and three ringed social marks at the left, then columns
// of links with the contact column second, as the source had its Quick Links, Get in Touch and
// Sitemap; a rule; the legal line beside the maker's credit, here the photographers' credit the
// Pexels licence asks for; and behind it all the name as a giant faint watermark in the display
// face. Every part rises as it arrives.
export function EmberFooter({ brand, footer, credits }: Props) {
  const [first, ...rest] = footer.groups
  const { contact } = footer
  const hasContact = contact.email !== null || contact.phone !== null
  return (
    <footer className={`${pad} relative mt-44 overflow-hidden`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap justify-between gap-6 pb-8">
          <div className="flex flex-col items-start text-left">
            <div data-fade>
              <EmberLogo brand={brand} />
            </div>
            <div data-fade style={delay(0.2)}>
              <p className="mt-3 max-w-xs text-on-surface-muted">{footer.description}</p>
            </div>
            {footer.socials !== null && (
              <div className="mt-6 flex items-center gap-1.5">
                {footer.socials.map((social, index) => (
                  <div key={social.network} data-fade style={delay(0.05 * index)}>
                    <a
                      href={social.href}
                      aria-label={socialLabel(social.network)}
                      className="grid size-7.5 place-content-center rounded-full border border-on-surface/20"
                    >
                      <SocialIcon network={social.network} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
          {first !== undefined && <LinkColumn group={first} />}
          {hasContact && (
            <div>
              <p className="mb-5 font-medium">{contact.heading}</p>
              <div className="space-y-2">
                {contact.email !== null && (
                  <div data-fade>
                    <a
                      className={`flex items-center gap-1 ${footerLink}`}
                      href={`mailto:${contact.email}`}
                    >
                      <Mail aria-hidden="true" size={16} className="shrink-0" />
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone !== null && (
                  <div data-fade style={delay(0.05)}>
                    <a
                      href={`tel:${contact.phone}`}
                      className={`flex items-center gap-1 ${footerLink}`}
                    >
                      <Phone aria-hidden="true" size={16} className="shrink-0" />
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {rest.map((group) => (
            <LinkColumn key={group.heading} group={group} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border py-4.5 text-on-surface/55">
          <p>
            &copy; {YEAR} {brand.legalName}. All rights reserved.
          </p>
          {credits.length > 0 && (
            <p>
              Photos by{' '}
              {credits.map((credit, index) => (
                <Fragment key={credit.url}>
                  {index > 0 && (index === credits.length - 1 ? ' and ' : ', ')}
                  <a href={credit.url}>{credit.photographer}</a>
                </Fragment>
              ))}{' '}
              on <a href="https://www.pexels.com">Pexels</a>
            </p>
          )}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-1 text-center select-none"
      >
        <span className="font-display text-[300px] font-semibold tracking-wide text-surface-muted/70">
          {brand.name}
        </span>
      </div>
    </footer>
  )
}

type ColumnProps = { group: EmberContent['footer']['groups'][number] }

// A column: its heading over the links, each rising a little after the one before.
function LinkColumn({ group }: ColumnProps) {
  return (
    <div>
      <p className="mb-5 font-medium">{group.heading}</p>
      <div className="flex flex-col gap-2.5">
        {group.links.map((link, index) => (
          <div key={link.label} data-fade style={delay(0.05 * index)}>
            <a href={link.href} className={footerLink}>
              {link.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
