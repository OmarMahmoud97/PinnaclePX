import Image from 'next/image'
import type { InegroCard } from '../copy-slots'
import { RoundArrow } from './icons'
import { Letters } from './letters'

type Props = {
  id: string
  card: InegroCard
  // Which of the source's three buttons: its purple one with the round mark, its blue one, or
  // its green one (inegro.css sets the last two from the palette).
  tone: 1 | 2 | 3
}

// One of the source's three glass cards: a photograph under the whole block, and on it the
// frosted card with the small label, the long paragraph that lights up letter by letter as the
// page scrolls, and a coloured button. The block slides over the one before it (motion-stack).
export function InegroGlass({ id, card, tone }: Props) {
  const { label, text, cta, image } = card
  return (
    <section
      id={id}
      className="inegro-glass-band inegro-stack-prev"
      data-stack="prev"
      aria-labelledby={`${id}-label`}
    >
      <div className="inegro-inner">
        <div className="inegro-glass">
          <h2 id={`${id}-label`} className="inegro-label">
            {label}
          </h2>
          <p className="inegro-h3 inegro-lit" data-lit="">
            <Letters text={text} />
          </p>
          <div className="inegro-glass-actions">
            <a
              className={`inegro-btn ${tone === 1 ? 'inegro-btn-brand inegro-btn-mark' : `inegro-btn-${String(tone)}`}`}
              href={cta.href}
            >
              {cta.label}
              {tone === 1 && <RoundArrow />}
            </a>
          </div>
        </div>
      </div>
      <figure className="inegro-glass-photo">
        {image !== null && (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="100vw"
          />
        )}
      </figure>
    </section>
  )
}
