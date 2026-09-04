import type { AuroraContent } from '../copy-slots'
import { button, container, enter } from '../styles'
import { AuroraField } from './aurora-field'
import { ProductFrame } from './product-frame'

type Props = Pick<AuroraContent, 'brand' | 'hero' | 'features'>

// Centred words over a horizon of light, and the product rising out of it. The headline is the
// LCP element, so it rises first and with no delay; the frame is clipped at the section's edge,
// which keeps the first screen short and reads as the product coming up from below.
export function AuroraHero({ brand, hero, features }: Props) {
  return (
    <section className="relative isolate overflow-hidden pt-16 md:pt-24">
      <div className={`${container} text-center`}>
        <h1
          data-rise
          style={enter(0)}
          className="mx-auto max-w-4xl font-display text-display font-semibold tracking-tight text-balance"
        >
          {hero.headline}
        </h1>
        <p
          data-rise
          style={enter(1)}
          className="mx-auto mt-6 max-w-2xl text-lead text-pretty text-on-surface-muted"
        >
          {hero.subhead}
        </p>
        <div
          data-rise
          style={enter(2)}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <a href={hero.primary.href} className={button.primary}>
            {hero.primary.label}
          </a>
          <a href={hero.secondary.href} className={button.secondary}>
            {hero.secondary.label}
          </a>
        </div>
        <p data-rise style={enter(3)} className="mt-5 text-small text-on-surface-muted">
          {hero.reassurance}
        </p>
      </div>

      <div data-rise style={enter(4)} className={`${container} relative isolate mt-16 md:mt-24`}>
        <AuroraField variant="horizon" />
        <div className="max-h-[22rem] overflow-hidden md:max-h-[20rem]">
          <ProductFrame
            name={brand.name}
            frame={hero.frame}
            rail={features.items.map((item) => item.title)}
            image={hero.image}
          />
        </div>
      </div>
    </section>
  )
}
