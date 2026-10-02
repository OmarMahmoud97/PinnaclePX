import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { EmberContent } from '../copy-slots'
import { delay, headerVeil, pill, veil } from '../styles'
import { Stars } from './stars'

type Props = Pick<EmberContent, 'hero'>

// The words' colours on the page surface, the source's own, and over a photograph, where each is
// on-surface on the veil (styles.ts): the eyebrow's deeper shade and the paragraph's muted grey
// would need the veil at the 80 percent decision 7 allows, or more, to meet WCAG AA over any
// picture.
const INK = {
  surface: {
    eyebrow: 'text-brand-deepest',
    subhead: 'text-on-surface-muted',
    proof: 'text-on-surface/85',
  },
  picture: {
    eyebrow: 'text-on-surface',
    subhead: 'text-on-surface',
    proof: 'text-on-surface',
  },
} as const

// The source's Hero: a full-screen section over a photograph, the eyebrow in the deeper
// shade, the headline in the display face, the paragraph, the round button, and a row of
// guests' portraits beside five stars and a rating line. The eyebrow drops in from above and
// the rest rises, at the source's delays, on load.
//
// The source set its words straight on its own light photograph. Over a visitor's picture a pool
// of the page surface lies behind the words and a band of it under the header's words at the top,
// each solid where its words are and fading out beyond them. So every word, the header's included,
// keeps a page colour and meets WCAG AA over any picture, a logo of either polarity stays visible,
// and most of the photograph stays clear (decision 7, docs/template-fit-decisions.md). Without a
// photograph the hero is the page surface and the words keep the source's colours.
export function EmberHero({ hero }: Props) {
  const { background } = hero
  const style: CSSProperties | undefined =
    background === null ? undefined : { backgroundImage: `url(${background.src})` }
  const ink = background === null ? INK.surface : INK.picture
  return (
    <section
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 pt-20"
      style={style}
    >
      {background !== null && (
        <div
          aria-hidden="true"
          className={`${headerVeil} pointer-events-none absolute -inset-x-15 -top-15 -z-10 h-46`}
        />
      )}
      <div className="relative flex flex-col items-center">
        {background !== null && (
          <div
            aria-hidden="true"
            className={`${veil} pointer-events-none absolute -inset-15 -z-10 rounded-[3rem]`}
          />
        )}
        <div data-rise="down" style={delay(0.2)}>
          <p className={`${ink.eyebrow} uppercase`}>{hero.eyebrow}</p>
        </div>
        <div data-rise>
          <h1 className="mt-5 max-w-3xl text-center font-display text-5xl font-medium text-balance md:text-6xl">
            {hero.headline}
          </h1>
        </div>
        <div data-rise style={delay(0.2)}>
          <p className={`mt-3 max-w-md text-center ${ink.subhead}`}>{hero.subhead}</p>
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
              <p className={ink.proof}>{hero.proof.line}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
