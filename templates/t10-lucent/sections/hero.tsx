import { Mail } from 'lucide-react'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { LucentContent } from '../copy-slots'
import frame from './phone-frame.webp'
import { Picture } from './ui'

type Props = { hero: LucentContent['hero'] }

// The source's hero: the headline, its lead and two buttons, beside a phone whose screen played
// a recording of the app. Here the screen holds the hero picture under the source's own frame
// (its PNG, scaled to 900 by 1840), tinted to the brand by the stylesheet. The headline's lines
// slide up out of a mask once the splash has gone, the lead and the buttons rise out of a blur
// after them and the phone fades in (sections/hero-entrance.ts). The source's QR card is not
// ported (ADR 0043): it led to the App Store, and a business's page has no code to scan. The
// first button's icon was Apple's logo before "Download on iOS"; here the page's ask is a mail
// message, so it is an envelope, at the same size and place.
export function LucentHero({ hero }: Props) {
  const mask = { '--lc-frame-mask': `url(${frame.src})` } as CSSProperties
  return (
    <section className="lc-hero" data-hero="">
      <div className="lc-hero__inner">
        <h1 className="lc-hero__title">
          <span className="lc-mask-text">
            <span className="lc-line">
              <span>{hero.headline}</span>
            </span>
          </span>
        </h1>
        <p className="lc-hero__lead">{hero.lead}</p>
        <div className="lc-hero__cta">
          <a className="lc-btn lc-btn--solid lc-btn--lg" data-magnetic="" href={hero.cta.href}>
            <Mail className="lc-btn__icon" aria-hidden="true" focusable="false" />
            <span>{hero.cta.label}</span>
          </a>
          <a
            className="lc-btn lc-btn--ghost lc-btn--lg"
            data-magnetic=""
            href={hero.secondary.href}
          >
            <span>{hero.secondary.label}</span>
          </a>
        </div>
      </div>

      <div className="lc-hero__stage">
        <div className="lc-hero__device">
          <div className="lc-hero__frame" style={mask}>
            <Picture
              image={hero.image}
              className="lc-hero__screen"
              sizes="(max-width: 560px) 92vw, (max-width: 900px) 470px, 430px"
              eager
            />
            <Image
              className="lc-hero__bezel"
              src={frame}
              alt=""
              aria-hidden="true"
              sizes="(max-width: 560px) 92vw, (max-width: 900px) 470px, 430px"
              loading="eager"
              fetchPriority="high"
            />
            <span className="lc-hero__tint" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
