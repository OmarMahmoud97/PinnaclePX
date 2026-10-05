import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { VectorContent } from '../copy-slots'
import { anchored, container, pad, pill } from '../styles'

type Props = Pick<VectorContent, 'about' | 'brand'>

// The source's About: a wide pill-shaped picture that settles from nine tenths as the block
// comes up the screen (from its top at four fifths to at three tenths), a centred statement
// that rises from 60px (from its top at 85% to at 60%) and a round inverted button that rises
// from 40px (from 90% to 70%), all tied to the scroll. Without a picture the pill is the
// quieter surface. The source set the statement as the block's heading, but a statement runs to
// 160 characters, a sentence and no heading (decision 15's outline), so it is a paragraph drawn
// the same, and a screen reader meets the block by a hidden heading, "About" and the name.
export function VectorAbout({ about, brand }: Props) {
  const { image } = about
  return (
    <section id="about" className={`vector-about ${anchored} bg-surface pb-24 lg:pb-32`}>
      <h2 className="sr-only">{`About ${brand.name}`}</h2>
      <div className={`${pad} flex flex-col items-center ${container}`}>
        <div
          data-scrub="about"
          data-trigger="section"
          data-start="80"
          data-end="30"
          data-ease="power2"
          style={
            {
              '--from-scale': '0.9',
              '--start': '20vh',
              '--end': '70vh',
              '--ease': 'var(--vector-power2)',
            } as CSSProperties
          }
          className={`relative mb-16 aspect-21/9 w-full overflow-hidden rounded-full lg:aspect-3/1 ${image === null ? 'bg-surface-muted' : ''}`}
        >
          {image !== null && (
            <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
          )}
        </div>
        <p
          data-scrub
          data-start="85"
          data-end="60"
          style={{ '--from-y': '60px', '--start': '15vh', '--end': '40vh' } as CSSProperties}
          className="mx-auto max-w-4xl text-center text-[clamp(1.75rem,4vw,3rem)] leading-[1.2] font-medium tracking-tight text-on-surface"
        >
          {about.statement}
        </p>
        <a
          data-scrub
          data-start="90"
          data-end="70"
          style={{ '--from-y': '40px', '--start': '10vh', '--end': '30vh' } as CSSProperties}
          className={`${pill} mt-8 px-6 py-3 text-lg tracking-tight`}
          href={about.cta.href}
        >
          {about.cta.label}
        </a>
      </div>
    </section>
  )
}
