import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { SummitContent } from '../copy-slots'
import { arrow, delay, pad } from '../styles'
import { Stars } from './stars'

type Props = Pick<SummitContent, 'hero'>

// The words' colours, the rating line under the portraits included: on the plain page the
// source's greys; over a photograph, on the veil of the page surface behind them (summit.css),
// on-surface, since the muted grey would need more of the veil than the 80 percent decision 7
// allows to meet WCAG AA over any picture. The headline keeps its shade, which holds there as
// large text.
const PLAIN = {
  ring: 'text-on-surface-muted',
  line: 'text-on-surface-muted',
  proof: 'text-on-surface-muted',
} as const
const PICTURED = {
  ring: 'text-on-surface',
  line: 'text-on-surface',
  proof: 'text-on-surface',
} as const

// The source's Hero: a full-screen block over a soft photograph, brightening from two fifths
// as it loads, holding at the left a ringed pill (a small ringed word beside a line), the
// headline, the paragraph, a dark button with an arrow beside a bordered one, and a row of
// patients' portraits beside five stars and a rating line. The pill drops in and the rest
// rises, at the source's waits and springs, on load. Over a photograph a veil of the page
// surface lies behind the words and under the bar (summit.css), which the source's soft pale
// picture did not need.
// The portraits keep their size on the narrowest phones, where the row would squeeze them
// until the last ran under the rating line.
export function SummitHero({ hero }: Props) {
  const background: CSSProperties | undefined =
    hero.background === null ? undefined : { backgroundImage: `url(${hero.background.src})` }
  const ink = hero.background === null ? PLAIN : PICTURED
  return (
    <section
      id="home"
      data-rise="brighten"
      className="relative isolate flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat"
      style={background}
    >
      {hero.background !== null && (
        <div aria-hidden="true" className="summit-veil pointer-events-none absolute inset-0" />
      )}
      <div className={`relative mt-32 flex w-full max-w-360 flex-col ${pad}`}>
        {hero.background !== null && (
          <div
            aria-hidden="true"
            className="summit-pool pointer-events-none absolute inset-x-0 -top-[100vh] -bottom-24 -z-10 lg:hidden"
          />
        )}
        <div
          data-rise="down"
          style={delay(0.2)}
          className={`inline-flex w-fit items-center gap-2 rounded-full border border-on-surface/11 px-1.5 py-1 ${ink.ring}`}
        >
          <span
            className={`rounded-full border border-on-surface/11 px-2 py-0.5 text-xs tracking-tight ${ink.ring}`}
          >
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
          className={`mt-4 max-w-lg text-left text-sm leading-6.5 md:text-base ${ink.line}`}
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
            <div className="flex shrink-0 -space-x-3 pr-4">
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
              <p className={`mt-1 text-sm ${ink.proof}`}>{hero.proof.line}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
