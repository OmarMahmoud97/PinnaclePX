import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'
import { fitWord } from '../fit'
import {
  badge,
  card,
  cardContent,
  cardFooter,
  cardHeader,
  cardTitle,
  container,
  headingLg,
} from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MonolithContent, 'features'>

// The source's Features: a heading, a wrapping row of secondary badges, then three cards each
// with a title, a description and a picture in its footer at 200px, 300px from lg.
export function MonolithFeatures({ features }: Props) {
  return (
    <section id="features" className={`${container} @container py-24 sm:py-32 [&>*+*]:mt-8`}>
      <h2 className={`${headingLg} md:text-center`} style={fitWord([features.heading.text])}>
        <Emphasis heading={features.heading} />
      </h2>

      <div className="flex flex-wrap gap-4 md:justify-center">
        {features.tags.map((tag) => (
          <div key={tag}>
            <span className={badge.secondary}>{tag}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.items.map((item) => (
          <div key={item.title} className={card}>
            <div className={cardHeader}>
              <h3 className={cardTitle}>{item.title}</h3>
            </div>

            <div className={cardContent}>{item.body}</div>

            <div className={cardFooter}>
              {item.image !== null && (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="(min-width: 1024px) 300px, 200px"
                  className="mx-auto w-[200px] lg:w-[300px]"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
