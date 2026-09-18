import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { EmberContent } from '../copy-slots'
import { delay, pill } from '../styles'
import { Stars } from './stars'

type Props = Pick<EmberContent, 'hero'>

// The source's Hero: a full-screen section over a photograph, the eyebrow in the deeper
// shade, the headline in the display face, the paragraph, the round button, and a row of
// guests' portraits beside five stars and a rating line. The eyebrow drops in from above and
// the rest rises, at the source's delays, on load.
export function EmberHero({ hero }: Props) {
  const background: CSSProperties | undefined =
    hero.background === null ? undefined : { backgroundImage: `url(${hero.background.src})` }
  return (
    <section
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 pt-20"
      style={background}
    >
      <div data-rise="down" style={delay(0.2)}>
        <p className="text-brand-deepest uppercase">{hero.eyebrow}</p>
      </div>
      <div data-rise>
        <h1 className="mt-5 max-w-3xl text-center font-display text-5xl font-medium text-balance md:text-6xl">
          {hero.headline}
        </h1>
      </div>
      <div data-rise style={delay(0.2)}>
        <p className="mt-3 max-w-md text-center text-on-surface-muted">{hero.subhead}</p>
      </div>
      <div data-rise>
        <a href={hero.cta.href} className={`${pill} mt-8 block font-medium`}>
          {hero.cta.label}
        </a>
      </div>
      {hero.proof !== null && (
        <div data-rise className="mt-9 flex items-center justify-center md:justify-start">
          <div className="flex -space-x-3.5 pr-3">
            {hero.proof.avatars.map((avatar) => (
              <Image
                key={avatar.src}
                src={avatar.src}
                alt={avatar.alt}
                width={avatar.width}
                height={avatar.height}
                sizes="40px"
                className="size-10 rounded-full border-2 border-surface-muted transition hover:-translate-y-px"
              />
            ))}
          </div>
          <div>
            <div className="flex items-center gap-0.5">
              <Stars size="size-3.5" />
            </div>
            <p className="text-on-surface/85">{hero.proof.line}</p>
          </div>
        </div>
      )}
    </section>
  )
}
