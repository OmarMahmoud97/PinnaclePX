import Image from 'next/image'
import type { EmberContent } from '../copy-slots'
import { anchored, delay, eyebrow, heading, pad } from '../styles'
import { Stars } from './stars'

type Props = Pick<EmberContent, 'booking'>

// The source's Booking process: two columns from md. At the left the eyebrow, the heading and
// a guest's word with five stars, the quote and their portrait and name, centred below md; at
// the right the three steps, each a bracketed ordinal beside a title and a paragraph, rising in
// turn from further down.
export function EmberBooking({ booking }: Props) {
  const { testimonial } = booking
  return (
    <section id="booking-process" className={`${pad} ${anchored} mt-44`}>
      <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:gap-25">
        <div className="flex flex-col text-center md:text-left">
          <div data-fade style={delay(0.2)}>
            <p className={`${eyebrow} mb-4`}>{booking.eyebrow}</p>
          </div>
          <div data-fade style={delay(0.2)}>
            <h2 className={`${heading} mb-16`}>{booking.heading}</h2>
          </div>
          {testimonial !== null && (
            <>
              <div data-fade className="mb-6 flex justify-center gap-0.5 md:justify-start">
                <Stars size="size-4" />
              </div>
              <div data-fade style={delay(0.2)}>
                <p className="mb-4 max-w-xs text-on-surface-muted max-md:mx-auto">
                  &quot;{testimonial.quote}&quot;
                </p>
              </div>
              <div data-fade className="flex items-center justify-center gap-3 md:justify-start">
                {testimonial.image === null ? (
                  <span className="size-12 rounded-full bg-surface-muted" />
                ) : (
                  <Image
                    src={testimonial.image.src}
                    alt={testimonial.image.alt}
                    width={testimonial.image.width}
                    height={testimonial.image.height}
                    sizes="48px"
                    className="size-12 rounded-full object-cover"
                  />
                )}
                <span className="text-lg">{testimonial.name}</span>
              </div>
            </>
          )}
        </div>
        <div className="space-y-14 text-left">
          {booking.steps.map((step, index) => (
            <div
              key={step.title}
              data-fade="up-lg"
              style={delay(0.15 * index)}
              className="flex items-start gap-9"
            >
              <span className="shrink-0 text-lg font-medium text-brand-deeper">
                ({String(index + 1).padStart(2, '0')})
              </span>
              <div className="flex flex-col">
                <h3 className="mb-5 text-xl">{step.title}</h3>
                <p className="text-on-surface-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
