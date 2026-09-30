import { Fragment } from 'react'
import type { InegroContent, InegroImage } from '../copy-slots'
import { InegroLogo } from './logo'

type Credit = NonNullable<InegroImage['credit']>

type Props = Pick<InegroContent, 'brand' | 'footer'> & { credits: readonly Credit[] }

// Read once at load, outside render, so the line never differs between two renders.
const YEAR = new Date().getFullYear()

// The source's footer: white, rounded at its top, the brand's mark at the left and at the right
// the small links, a paragraph of small print and the copyright line. The small print was the
// source's note on its pictures; here it is the photographers' credit the Pexels licence asks
// for, and it is left out when no picture needs one.
export function InegroFooter({ brand, footer, credits }: Props) {
  return (
    <footer className="inegro-footer">
      <div className="inegro-footer-inner">
        <div className="inegro-footer-row">
          <div>
            <a className="inegro-footer-logo" href="#top">
              <InegroLogo brand={brand} sizes="200px" />
            </a>
          </div>
          <div className="inegro-footer-info">
            {footer.links.length > 0 && (
              <ul className="inegro-footer-links">
                {footer.links.map((link) => (
                  <li key={`${link.label}${link.href}`}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            )}
            {credits.length > 0 && (
              <p className="inegro-footer-small">
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
            <div className="inegro-footer-copy">
              <span>&copy;</span> {brand.legalName} {YEAR}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
