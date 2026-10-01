import Image from 'next/image'
import { Fragment } from 'react'
import type { LucentContent, LucentImage } from '../copy-slots'
import { CopyEmail } from './copy-email'
import { SocialLink } from './icons'
import { BrandLockup, graphemes, isMark } from './ui'

type Credit = NonNullable<LucentImage['credit']>

type Props = Pick<LucentContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's footer: a dark slab, rounded at its top, with the big ask in the brand's colour
// whose two lines slide up out of a mask (sections/mask.ts), the white pill under it with a
// small line, and a row of the brand, its networks and the small links. The source's pill was
// the App Store badge; here it is the ask in the brand's words. Its theme switch and cookie links
// are not ported (ADR 0043). When pictures came from Pexels, their photographers' credit closes
// the footer, as the licence asks.
export function LucentFooter({ brand, footer, credits }: Props) {
  const { logo, name } = brand
  const mark = logo.kind === 'image' && isMark(logo) ? logo : null
  const letters = graphemes(name)
  // The source set its app icon in place of its name's first letter; a page whose mark is that
  // letter asks for the same, any other sets its mark before the whole name.
  const initial = mark !== null && footer.markAsInitial
  const rest = initial ? letters.slice(1).join('') : name
  return (
    <footer className="lc-footer" id="contact">
      <a className="lc-footer__cta" href={footer.href} data-cta="">
        <span className="lc-footer__cta-line">
          <span>
            <span className="lc-footer__cta-w">{footer.lead}</span>{' '}
            <span
              className={initial ? 'lc-footer__cta-s' : 'lc-footer__cta-s lc-footer__cta-s--before'}
            >
              {mark !== null && (
                <Image
                  src={mark.src}
                  alt={initial ? (letters[0] ?? '') : ''}
                  width={mark.width}
                  height={mark.height}
                  sizes="120px"
                />
              )}
              <span className="lc-footer__cta-w">{rest}</span>
            </span>
          </span>
        </span>
        <span className="lc-footer__cta-line">
          <span>{footer.tail}</span>
        </span>
      </a>
      <div className="lc-footer__store">
        <a className="lc-footer__badge" data-magnetic="" href={footer.button.href}>
          {footer.button.label}
        </a>
        <span className="lc-footer__fine">{footer.fine}</span>
      </div>
      <div className="lc-footer__row">
        <a className="lc-footer__brand" href="#top" aria-label={`${name} home`}>
          <BrandLockup brand={brand} sizes="140px" />
        </a>
        {footer.social !== null && (
          <div className="lc-footer__social">
            {footer.social.map((social) => (
              <SocialLink key={social.href} social={social} />
            ))}
          </div>
        )}
        <nav className="lc-footer__links" aria-label="Footer">
          {footer.links.map((link) => (
            <a key={`${link.label}${link.href}`} href={link.href}>
              {link.label}
            </a>
          ))}
          {footer.contact !== null && (
            <CopyEmail label={footer.contact.label} email={footer.contact.email} />
          )}
          <span>
            © {YEAR} {brand.legalName}. All rights reserved.
          </span>
        </nav>
      </div>
      {credits.length > 0 && (
        <p className="lc-footer__credits">
          Photographs by{' '}
          {credits.map((credit, index) => (
            <Fragment key={credit.url}>
              {index > 0 && (index === credits.length - 1 ? ' and ' : ', ')}
              <a href={credit.url}>{credit.photographer}</a>
            </Fragment>
          ))}{' '}
          on <a href="https://www.pexels.com">Pexels</a>.
        </p>
      )}
    </footer>
  )
}

// The source's round button back to the top, shown once the page has scrolled a screen
// (sections/scroll.ts).
export function LucentToTop() {
  return (
    <button className="lc-to-top" type="button" aria-label="Scroll to top" data-to-top="">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
