import Image from 'next/image'
import type { EmberContent } from '../copy-slots'
import { fitWord } from '../fit'
import { anchored, delay, eyebrow, heading, pad } from '../styles'

type Props = Pick<EmberContent, 'features'>

// The source's Features: an eyebrow and heading, then three rows of a mark beside a title and
// a paragraph at the left, rising in turn from further down, and a tall rounded portrait at the
// right sliding in from the right. Without a picture a block of the quieter surface holds its
// place at the picture's size, where an empty block once had no width and showed nothing
// (decision 15). The source marked its rows with a chef's hat, a leaf and a heart; here each
// row has one small dot of the brand colour in the icon's place, since the rows are in no order
// and the points above already number theirs (decision 1, docs/template-fit-decisions.md).
export function EmberFeatures({ features }: Props) {
  const { image } = features
  return (
    <section id="features" className={`${pad} ${anchored} mt-44`}>
      <div className="mb-16 text-center">
        <div data-fade style={delay(0.2)}>
          <p className={`${eyebrow} mb-3.5`}>{features.eyebrow}</p>
        </div>
        <div data-fade style={delay(0.2)}>
          <h2 className={`${heading} @container mx-auto max-w-xl text-balance`}>
            <span className="ember-fit" style={fitWord(features.heading, 'body')}>
              {features.heading}
            </span>
          </h2>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-14 md:flex-row">
        <div className="max-w-md space-y-10">
          {features.items.map((item, index) => (
            <div
              key={item.title}
              data-fade="up-lg"
              style={delay(0.15 * index)}
              className="flex items-start gap-4 text-left"
            >
              <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-content-center">
                <span className="size-2 rounded-full bg-brand-deeper" />
              </span>
              <div>
                <h3 className="mb-2 text-xl">{item.title}</h3>
                <p className="max-w-sm text-on-surface-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div data-fade="right" className="max-w-full min-w-0">
          {image === null ? (
            <div className="h-111 w-96 max-w-full rounded-3xl bg-surface-muted" />
          ) : (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 384px, 100vw"
              className="h-111 w-full max-w-sm rounded-3xl object-cover"
            />
          )}
        </div>
      </div>
    </section>
  )
}
