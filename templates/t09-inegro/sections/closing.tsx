import type { InegroContent } from '../copy-slots'
import { SocialIcon } from './icons'

type Props = { closing: InegroContent['closing'] }

// The source's band before the footer: washed from the light through the brand into the ink,
// with its words at the top, an outlined button, the row of icons (when the owner has given
// their links) and the big outlined button, which is the page's ask.
export function InegroClosing({ closing }: Props) {
  const { social } = closing
  return (
    <section id="contact" className="inegro-closing" aria-label={closing.cta.label}>
      <p>{closing.text}</p>
      <div className="inegro-closing-btn">
        <a className="inegro-btn inegro-btn-ink-line" href={closing.secondary.href}>
          {closing.secondary.label}
        </a>
      </div>
      {social !== null && social.length > 0 && (
        <div className="inegro-social">
          <div>
            {social.map((link) => (
              <a key={link.network} href={link.href} rel="noreferrer">
                <SocialIcon network={link.network} />
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="inegro-closing-btn">
        <a className="inegro-btn inegro-btn-line inegro-btn-big" href={closing.cta.href}>
          {closing.cta.label}
        </a>
      </div>
    </section>
  )
}
