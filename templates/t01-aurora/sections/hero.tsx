import type { AuroraContent } from '../copy-slots'
import { fitWord } from '../fit'
import { button, container, enter } from '../styles'
import { AuroraField } from './aurora-field'
import { ProductFrame } from './product-frame'

type Props = Pick<AuroraContent, 'brand' | 'hero' | 'features'>

// Centred words over a horizon of light, and a drawn panel rising out of it. The headline is the
// LCP element, so it rises first and with no delay; it is set smaller where its longest word
// would not fit its width (fit.ts), so no word runs past a phone's edge.
//
// From lg the panel is clipped at the section's edge, which reads as the panel coming up from
// below. Below lg, where its picture sits under its lines, a clip would hide most of the picture
// (a phone saw 11% to 31% of it, a tablet 6% to 15%), so the panel shows whole and meets the
// section's edge with no foot, running on below it.
export function AuroraHero({ brand, hero, features }: Props) {
  return (
    <section className="relative isolate overflow-hidden pt-16 md:pt-24">
      <div className={`${container} text-center`}>
        <h1
          data-rise
          style={enter(0)}
          className="@container mx-auto max-w-4xl font-display text-display font-semibold tracking-tight text-balance"
        >
          <span className="aurora-fit" style={fitWord(hero.headline)}>
            {hero.headline}
          </span>
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
        <div className="overflow-hidden lg:max-h-[20rem]">
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
