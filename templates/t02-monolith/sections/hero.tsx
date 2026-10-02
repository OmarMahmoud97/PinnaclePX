import type { MonolithContent } from '../copy-slots'
import { fitWord } from '../fit'
import { button, container } from '../styles'
import { LitHeadline } from './emphasis'
import { HeroCards } from './hero-cards'

type Props = Pick<MonolithContent, 'brand' | 'hero'>

// The source's Hero: a two-column grid on wide screens with the words at the left, centred
// below that, and the four cards at the right, the glow sliding behind them (monolith.css).
//
// The cards sit in a fixed 700 by 500 box, which the source set beside the words from lg, where
// it ran up to 102px past the screen and cut words off until about 1420. Here the two columns
// start at 1440, where the box fits beside the words; from lg to there the words are centred
// over the cards. The headline is never larger than lets its longest word fit its column
// (fit.ts), so a long word is not cut off on a phone.
export function MonolithHero({ brand, hero }: Props) {
  return (
    <section
      className={`${container} @container grid place-items-center gap-10 py-20 min-[1440px]:grid-cols-2 md:py-32`}
    >
      <div className="text-center min-[1440px]:text-start [&>*+*]:mt-6">
        <h1
          className="text-[length:min(3rem,97cqi/var(--monolith-word,1))] leading-none font-bold min-[1440px]:text-[length:min(3.75rem,(50cqi_-_1.25rem)*0.97/var(--monolith-word,1))] md:max-[1440px]:text-[length:min(3.75rem,97cqi/var(--monolith-word,1))]"
          style={fitWord([hero.headline.text])}
        >
          <LitHeadline headline={hero.headline} />
        </h1>

        <p className="mx-auto text-xl text-on-surface-muted min-[1440px]:mx-0 md:w-10/12">
          {hero.subhead}
        </p>

        <div className="[&>*+*]:mt-4 md:[&>*+*]:mt-0 md:[&>*+*]:ml-4">
          <a href={hero.primary.href} className={`w-full md:w-1/3 ${button.default}`}>
            {hero.primary.label}
          </a>
          <a href={hero.secondary.href} className={`w-full md:w-1/3 ${button.outline}`}>
            {hero.secondary.label}
          </a>
        </div>
      </div>

      <HeroCards brand={brand} cards={hero.cards} />
    </section>
  )
}
