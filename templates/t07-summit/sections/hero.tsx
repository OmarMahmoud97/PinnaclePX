import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { SummitContent } from '../copy-slots'
import { arrow, delay, pad } from '../styles'
import { Stars } from './stars'

type Props = Pick<SummitContent, 'hero'>

// The source's Hero: a full-screen block over a soft photograph, brightening from two fifths
// as it loads, holding at the left a ringed pill (a small ringed word beside a line), the
// headline, the paragraph, a dark button with an arrow beside a bordered one, and a row of
// patients' portraits beside five stars and a rating line. The pill drops in and the rest
// rises, at the source's waits and springs, on load.
export function SummitHero({ hero }: Props) {
  const background: CSSProperties | undefined =
    hero.background === null ? undefined : { backgroundImage: `url(${hero.background.src})` }
  return (
    <section
      id="home"
      data-rise="brighten"
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={background}
    >
      <div className={`mt-32 flex w-full max-w-360 flex-col ${pad}`}>
        <div
          data-rise="down"
          style={delay(0.2)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-on-surface/11 px-1.5 py-1 text-on-surface-muted"
        >
          <span className="rounded-full border border-on-surface/11 px-2 py-0.5 text-xs tracking-tight text-on-surface-muted">
            {hero.badge.tag}
          </span>
          <span className="pr-2 text-sm tracking-tight">{hero.badge.text}</span>
        </div>
        <h1
          data-rise
          data-spring="soft"
          className="mt-6 max-w-160 text-left font-display text-5xl leading-tight font-medium tracking-tight text-on-surface/85 md:text-6xl"
        >
          {hero.headline}
        </h1>
        <p
          data-rise
          style={delay(0.2)}
          className="mt-4 max-w-lg text-left text-sm leading-6.5 text-on-surface-muted md:text-base"
        >
          {hero.subhead}
        </p>
        <div data-rise className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={hero.primary.href}
            className="group inline-flex items-center gap-2 rounded-sm bg-brand-deeper px-4 py-3 text-sm font-medium text-on-brand transition hover:bg-brand-deepest"
          >
            {hero.primary.label}
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" className={arrow} />
          </a>
          <a
            href={hero.secondary.href}
            className="inline-flex items-center rounded-sm border border-on-surface/11 bg-surface px-4 py-3 text-sm text-on-surface/85 transition"
          >
            {hero.secondary.label}
          </a>
        </div>
        {hero.proof !== null && (
          <div data-rise data-spring="soft" className="mt-8 flex items-center">
            <div className="flex -space-x-3 pr-4">
              {hero.proof.avatars.map((avatar) => (
                <Image
                  key={avatar.src}
                  src={avatar.src}
                  alt={avatar.alt}
                  width={36}
                  height={36}
                  sizes="36px"
                  className="rounded-full border-2 border-surface-muted object-cover transition hover:-translate-y-px"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-px">
                <Stars />
              </div>
              <p className="mt-1 text-sm text-on-surface-muted">{hero.proof.line}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
