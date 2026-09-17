import Image from 'next/image'
import type { EmberContent } from '../copy-slots'
import { anchored, delay, eyebrow, heading, pad } from '../styles'
import { Stars } from './stars'

type Props = { testimonials: NonNullable<EmberContent['testimonials']> }

// The source's Testimonials: an eyebrow and heading, then bordered cards in one column, two
// from md and three from lg, each five stars over the quote and, at the foot, a portrait beside
// a name and a place. The cards rise in turn as they arrive and take the quieter surface under
// the pointer.
export function EmberTestimonials({ testimonials }: Props) {
  return (
    <section id="testimonials" className={`${pad} ${anchored} mt-44`}>
      <div className="mb-14 text-center">
        <div data-fade style={delay(0.2)}>
          <p className={`${eyebrow} mb-4`}>{testimonials.eyebrow}</p>
        </div>
        <div data-fade style={delay(0.2)}>
          <h2 className={`${heading} mx-auto max-w-lg text-balance`}>{testimonials.heading}</h2>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.items.map((item, index) => (
          <div
            key={`${item.name} ${item.place}`}
            data-fade="up-md"
            style={delay(0.1 * index)}
            className="flex flex-col justify-between rounded-2xl border border-border p-6 text-left hover:bg-surface-muted/50"
          >
            <div>
              <div className="mb-4 flex gap-0.5">
                <Stars size="size-4" />
              </div>
              <p className="mb-6 leading-relaxed text-on-surface-muted">&quot;{item.quote}&quot;</p>
            </div>
            <div className="mt-auto flex items-center gap-3">
              {item.image === null ? (
                <span className="size-11 shrink-0 rounded-full bg-surface-muted" />
              ) : (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="44px"
                  className="size-11 shrink-0 rounded-full object-cover"
                />
              )}
              <div>
                <p className="mb-0.5 leading-tight font-medium">{item.name}</p>
                <p className="text-on-surface-muted">{item.place}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
