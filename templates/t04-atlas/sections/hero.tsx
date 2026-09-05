import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { AtlasContent } from '../copy-slots'
import { button, eyebrow, paragraph, section } from '../styles'
import { Emphasis } from './emphasis'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'hero'>

// The wait before a part of the hero arrives, as the source's delays ran.
function delay(ms: number): CSSProperties {
  return { '--delay': `${String(ms)}ms` } as CSSProperties
}

// The source's four ornaments, placed as it placed them: three small discs and a star, in the
// brand hues, hidden on phones. The source drew them as pictures; these are the same shapes.
const DOTS = [
  { className: 'bottom-12 left-4 xl:bottom-16 xl:left-0', hue: 'bg-glow' },
  { className: 'top-4 right-64 sm:top-10 sm:right-96 xl:right-[32rem]', hue: 'bg-brand-deeper' },
  { className: 'right-24 bottom-56', hue: 'bg-glow-secondary' },
] as const

// The source's hero: the words at the left with an uppercase eyebrow in the gradient, a
// capitalised headline with a lit phrase, a paragraph shown from sm up and two round buttons;
// the picture at the right from sm up; the ornaments over both. The eyebrow and headline slide
// in from the left, the paragraph from above and the buttons from below, at the source's delays.
export function AtlasHero({ hero }: Props) {
  return (
    <section id="hero" className="w-full pb-24">
      <div className={section}>
        <div className="col-span-12 mt-12 px-6 text-center sm:text-left lg:col-span-6 xl:mt-10 [&>*+*]:mt-4 sm:[&>*+*]:mt-6">
          <span data-rise className={`block ${eyebrow}`}>
            {hero.eyebrow}
          </span>
          <h1
            data-rise
            className="text-[2.5rem] leading-tight font-bold capitalize sm:pr-8 sm:text-5xl xl:pr-10 xl:text-6xl"
          >
            <Emphasis heading={hero.headline} />
          </h1>
          <p data-rise="down" style={delay(300)} className={`${paragraph} hidden sm:block`}>
            {hero.subhead}
          </p>
          <div
            data-rise="up"
            style={delay(700)}
            className="mt-2 flex flex-col sm:flex-row [&>*+*]:mt-4 sm:[&>*+*]:mt-0 sm:[&>*+*]:ml-4"
          >
            <a href={hero.primary.href} className={`${button.gradient} max-w-full px-8 py-4`}>
              {hero.primary.label}
            </a>
            <a href={hero.secondary.href} className={`${button.outline} max-w-full px-6 py-4`}>
              <span>{hero.secondary.label}</span>
              <Mdi name="chevronDown" size={20} className="mt-1 text-brand-deeper" />
            </a>
          </div>
        </div>
        <div className="col-span-12 hidden sm:block lg:col-span-6">
          <div className="w-full">
            {hero.image !== null && (
              <Image
                data-rise="up"
                src={hero.image.src}
                alt={hero.image.alt}
                width={hero.image.width}
                height={hero.image.height}
                sizes="(min-width: 1024px) 620px, 100vw"
                priority
                className="-mt-4"
              />
            )}
          </div>
        </div>
        {DOTS.map((dot) => (
          <span
            key={dot.className}
            aria-hidden="true"
            data-rise="up"
            style={delay(300)}
            className={`absolute hidden w-6 rounded-full sm:block ${dot.hue} ${dot.className} aspect-square`}
          />
        ))}
        <svg
          aria-hidden="true"
          data-rise="up"
          style={delay(300)}
          viewBox="0 0 24 24"
          className="absolute top-20 right-16 hidden w-8 sm:top-28 sm:block lg:right-0 lg:left-[30rem]"
        >
          <defs>
            <linearGradient id="atlas-star" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--glow)" />
              <stop offset="1" stopColor="var(--brand-deeper)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#atlas-star)"
            d="M12 0c.6 7 5 11.4 12 12-7 .6-11.4 5-12 12-.6-7-5-11.4-12-12 7-.6 11.4-5 12-12z"
          />
        </svg>
      </div>
    </section>
  )
}
