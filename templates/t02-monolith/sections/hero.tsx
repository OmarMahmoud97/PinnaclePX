import type { MonolithContent } from '../copy-slots'
import { button, container } from '../styles'
import { LitHeadline } from './emphasis'
import { HeroCards } from './hero-cards'

type Props = Pick<MonolithContent, 'brand' | 'hero'>

// The source's Hero: a two-column grid on wide screens with the words at the left, centred
// below lg, and the four cards at the right, the glow sliding behind them (monolith.css).
export function MonolithHero({ brand, hero }: Props) {
  return (
    <section
      className={`${container} grid place-items-center gap-10 py-20 md:py-32 lg:grid-cols-2`}
    >
      <div className="text-center lg:text-start [&>*+*]:mt-6">
        <h1 className="text-5xl font-bold md:text-6xl">
          <LitHeadline headline={hero.headline} />
        </h1>

        <p className="mx-auto text-xl text-on-surface-muted md:w-10/12 lg:mx-0">{hero.subhead}</p>

        <div className="[&>*+*]:mt-4 md:[&>*+*]:mt-0 md:[&>*+*]:ml-4">
          <a href={hero.primary.href} className={`w-full md:w-1/3 ${button.default}`}>
            {hero.primary.label}
          </a>
          <a href={hero.secondary.href} className={`w-full md:w-1/3 ${button.outline}`}>
            {hero.secondary.label}
          </a>
        </div>
      </div>

      <div className="z-10">
        <HeroCards brand={brand} cards={hero.cards} />
      </div>

      <div aria-hidden="true" className="monolith-glow" />
    </section>
  )
}
