import Image from 'next/image'
import type { EmberContent } from '../copy-slots'
import { anchored, delay, eyebrow, heading, pad } from '../styles'
import { EmberDish } from './dish'

type Props = Pick<EmberContent, 'dishes'>

// The source's signature dishes: an eyebrow and heading, then a grid of two columns, four from
// md, each cell a picture over a name and a line. The cells rise in turn as they arrive, and a
// picture turns half a turn on a spring each time the pointer reaches its cell (dish.tsx).
// Without a picture a disc of the quieter surface holds its place.
export function EmberDishes({ dishes }: Props) {
  return (
    <section id="dishes" className={`${pad} ${anchored} mt-44`}>
      <div className="mb-16 text-center">
        <div data-fade style={delay(0.2)}>
          <p className={`${eyebrow} mb-3.5`}>{dishes.eyebrow}</p>
        </div>
        <div data-fade>
          <h2 className={`${heading} mx-auto max-w-lg text-balance`}>{dishes.heading}</h2>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-12 md:grid-cols-4 md:gap-18">
        {dishes.items.map((item, index) => (
          <EmberDish
            key={item.title}
            style={delay(0.1 * index)}
            picture={
              item.image === null ? (
                <div className="size-30 rounded-full bg-surface-muted md:size-35" />
              ) : (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="140px"
                  className="size-30 object-cover md:size-35"
                />
              )
            }
          >
            <h3 className="mt-5">{item.title}</h3>
            <p className="mt-2 text-on-surface-muted">{item.note}</p>
          </EmberDish>
        ))}
      </div>
    </section>
  )
}
