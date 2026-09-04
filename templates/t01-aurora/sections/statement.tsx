import Image from 'next/image'
import type { AuroraContent } from '../copy-slots'
import { container } from '../styles'
import { AuroraField } from './aurora-field'

type Props = Pick<AuroraContent, 'statement'>

// One sentence from the company, set large at the foot of a full-bleed photograph that settles
// as it scrolls past (aurora.css). The scrim is solid under the words and thins upward, so the
// text always sits on the scrim token. Without a photograph the sentence sits on a pool of light.
export function AuroraStatement({ statement }: Props) {
  const { image, text } = statement
  return (
    <section id="why" className="relative isolate overflow-hidden border-t border-border">
      {image === null ? (
        <AuroraField variant="glow" />
      ) : (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            data-settle
            className="-z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-scrim via-scrim/75 to-scrim/30"
          />
        </>
      )}
      <div className={`${container} flex min-h-[70svh] items-end py-section`}>
        <h2
          className={`max-w-4xl font-display text-title font-semibold tracking-tight text-balance md:text-display ${image === null ? 'text-on-surface' : 'text-on-scrim'}`}
        >
          {text}
        </h2>
      </div>
    </section>
  )
}
