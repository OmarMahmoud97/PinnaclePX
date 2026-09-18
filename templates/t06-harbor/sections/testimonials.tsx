import { Star } from 'lucide-react'
import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = { testimonials: NonNullable<HarborContent['testimonials']> }

// The source's Testimonials: the eyebrow and heading centred, then cards in columns, one, two
// from md and three from lg, each a row of small filled stars, the quote and a portrait in a
// ringed circle beside a name and a role. The cards rise in turn as they arrive.
export function HarborTestimonials({ testimonials }: Props) {
  return (
    <section id="testimonials" className={`${section} bg-surface`}>
      <div className={container}>
        <div className="mb-16 text-center">
          <div data-fade data-margin="-80px">
            <span className={`${eyebrow} mb-4`}>{testimonials.eyebrow}</span>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.1)}>
            <h2 className={heading}>
              <HeadingLines heading={testimonials.heading} />
            </h2>
          </div>
        </div>
        <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
          {testimonials.items.map((item, index) => (
            <div
              key={item.name}
              data-fade
              data-margin="-40px"
              style={motion(0.08 * index, '30px', 0.5, 'out')}
              className="group break-inside-avoid rounded-2xl border border-border bg-accent p-6 hover:border-brand-deeper/20"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: item.rating }, (_, star) => (
                  <Star
                    key={star}
                    size={12}
                    aria-hidden="true"
                    className="fill-brand-deeper text-brand-deeper"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-on-surface/70">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-deeper/20">
                  {item.image === null ? (
                    <div className="h-full w-full bg-brand-deeper/20" />
                  ) : (
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      width={item.image.width}
                      height={item.image.height}
                      sizes="40px"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-on-surface">{item.name}</p>
                  <p className="text-xs text-on-surface/40">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
