import { Star } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import {
  card,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitleLg,
  container,
  eyebrow,
  sectionTitle,
} from '../styles'
import { Avatar } from './avatar'
import { Carousel } from './carousel'

type Props = { testimonials: NonNullable<MeridianContent['testimonials']> }

// The source's TestimonialSection: centred words over a carousel of cards on the card surface,
// each with five filled stars, the comment in quotes, and the avatar beside a name and a role.
export function MeridianTestimonials({ testimonials }: Props) {
  return (
    <section id="testimonials" className={`${container} py-24 sm:py-32`}>
      <div className="mb-8 text-center">
        <h2 className={`${eyebrow} text-center`}>{testimonials.eyebrow}</h2>

        <h2 className={`${sectionTitle} text-center`}>{testimonials.heading}</h2>
      </div>

      <Carousel>
        {testimonials.items.map((review) => (
          <div
            key={review.name}
            role="group"
            aria-roledescription="slide"
            className="min-w-0 shrink-0 grow-0 basis-full snap-start pl-4 md:basis-1/2 lg:basis-1/3"
          >
            <div className={`${card} bg-accent`}>
              <div className={`${cardContent} pt-6 pb-0`}>
                <div className="flex gap-1 pb-6">
                  {Array.from(
                    { length: Math.min(5, Math.max(0, Math.round(review.rating))) },
                    (_, i) => (
                      <Star key={i} className="size-4 fill-brand-deeper text-brand-deeper" />
                    ),
                  )}
                </div>
                {`"${review.comment}"`}
              </div>

              <div className={cardHeader}>
                <div className="flex flex-row items-center gap-4">
                  <Avatar image={review.image} name={review.name} />

                  <div className="flex flex-col">
                    <h3 className={cardTitleLg}>{review.name}</h3>
                    <p className={cardDescription}>{review.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  )
}
