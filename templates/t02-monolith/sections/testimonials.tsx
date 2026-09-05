import type { MonolithContent } from '../copy-slots'
import { card, cardContent, cardDescription, cardHeader, cardTitleLg, container } from '../styles'
import { Avatar } from './avatar'
import { Emphasis } from './emphasis'

type Props = { testimonials: NonNullable<MonolithContent['testimonials']> }

// The source's Testimonials: heading and lead, then the cards in columns, two on small screens
// and three from lg, each with an avatar, a name, a handle and the comment.
export function MonolithTestimonials({ testimonials }: Props) {
  return (
    <section id="testimonials" className={`${container} py-24 sm:py-32`}>
      <h2 className="text-3xl font-bold md:text-4xl">
        <Emphasis heading={testimonials.heading} />
      </h2>

      <p className="pt-4 pb-8 text-xl text-on-surface-muted">{testimonials.lead}</p>

      <div className="mx-auto columns-2 sm:block md:grid-cols-2 lg:columns-3 lg:gap-6 [&>*+*]:mt-4 lg:[&>*+*]:mt-6">
        {testimonials.items.map((item) => (
          <div
            key={item.handle}
            className={`${card} max-w-md overflow-hidden md:break-inside-avoid`}
          >
            <div className={`${cardHeader} flex-row items-center gap-4 pb-2`}>
              <Avatar image={item.image} name={item.name} />
              <div className="flex flex-col">
                <h3 className={cardTitleLg}>{item.name}</h3>
                <p className={cardDescription}>{item.handle}</p>
              </div>
            </div>
            <div className={cardContent}>{item.comment}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
