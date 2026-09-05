import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { MeridianContent } from '../copy-slots'
import { badge, button, container } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MeridianContent, 'hero'>

// The source's HeroSection: a badge inside an outline badge, a centred headline with one
// gradient word, a lead, two buttons, then a wide picture with a pool of the brand colour
// blurred behind its top edge and a fade to the surface over its foot. The source chose a light
// or dark screenshot by theme; here the one picture the imagery stage supplied.
export function MeridianHero({ hero }: Props) {
  return (
    <section className={`${container} w-full`}>
      <div className="mx-auto grid place-items-center gap-8 py-20 md:py-32 lg:max-w-(--breakpoint-xl)">
        <div className="text-center [&>*+*]:mt-8">
          <div className={badge.outlineLg}>
            <span className="mr-2 text-brand-deeper">
              <span className={badge.default}>{hero.badge.label}</span>
            </span>
            <span> {hero.badge.text} </span>
          </div>

          <div className="mx-auto max-w-(--breakpoint-md) text-center text-4xl font-bold md:text-6xl">
            <h1>
              <Emphasis heading={hero.headline} padding="px-2" />
            </h1>
          </div>

          <p className="mx-auto max-w-(--breakpoint-sm) text-xl text-on-surface-muted">
            {hero.subhead}
          </p>

          <div className="[&>*+*]:mt-4 md:[&>*+*]:mt-0 md:[&>*+*]:ml-4">
            <a
              href={hero.primary.href}
              className={`${button.default} group/arrow w-5/6 font-bold md:w-1/4`}
            >
              {hero.primary.label}
              <ArrowRight className="ml-2 size-5 transition-transform group-hover/arrow:translate-x-1" />
            </a>

            <a
              href={hero.secondary.href}
              className={`${button.secondary} w-5/6 font-bold md:w-1/4`}
            >
              {hero.secondary.label}
            </a>
          </div>
        </div>

        <div className="group relative mt-14">
          <div className="absolute top-2 left-1/2 mx-auto h-24 w-[90%] -translate-x-1/2 transform rounded-full bg-brand-deeper/50 blur-3xl lg:-top-8 lg:h-80" />
          {hero.image !== null && (
            <Image
              width={1200}
              height={1200}
              className="relative mx-auto flex w-full items-center rounded-lg border border-t-2 border-surface-muted border-t-brand-deeper/30 leading-none md:w-[1200px]"
              src={hero.image.src}
              alt={hero.image.alt}
              priority
            />
          )}

          <div className="absolute bottom-0 left-0 h-20 w-full rounded-lg bg-linear-to-b from-surface/0 via-surface/50 to-surface md:h-28" />
        </div>
      </div>
    </section>
  )
}
