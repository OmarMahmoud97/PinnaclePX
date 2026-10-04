import type { MeridianContent } from '../copy-slots'
import { fitWord } from '../fit'
import { card, cardContent, cardHeader, cardTitle, container } from '../styles'

type Props = Pick<MeridianContent, 'benefits'>

// The source's BenefitsSection: the words at the left, and at the right a two-by-two of cards
// on the card surface, each with a large faint number at the top right that darkens as the card
// turns to the page surface under the pointer. The source also set an icon at the top left,
// taken by position; a chart or a wallet read as a claim about a visitor's benefit, so the
// title leads and the number stays at the right as the decoration it is, hidden from screen
// readers (decision 1). A new design holds three benefits, one for each thing the owner said, and
// a stored one four: from lg an odd last card spans both columns, so three are two over one wide
// card and four the source's two-by-two. The heading and the titles are sized by their longest
// word (fit.ts), the heading against the section, since its column is only as wide as its words.
export function MeridianBenefits({ benefits }: Props) {
  return (
    <section id="benefits" className={`${container} @container py-24 sm:py-32`}>
      <div className="grid place-items-center lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="mb-2 text-lg tracking-wider text-brand-deeper">{benefits.eyebrow}</p>

          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span className="meridian-fit meridian-fit-column" style={fitWord(benefits.heading)}>
              {benefits.heading}
            </span>
          </h2>
          <p className="mb-8 text-xl text-on-surface-muted">{benefits.lead}</p>
        </div>

        <div className="grid w-full gap-4 lg:grid-cols-2">
          {benefits.items.map((item, index) => (
            <div
              key={item.title}
              className={`${card} group/number bg-accent transition-all delay-75 hover:bg-surface lg:odd:last:col-span-2`}
            >
              <div className={cardHeader}>
                <div className="flex justify-end">
                  <span
                    aria-hidden="true"
                    data-number={`0${String(index + 1)}`}
                    className="text-5xl font-medium text-on-surface-muted/15 transition-all delay-75 group-hover/number:text-on-surface-muted/30 before:content-[attr(data-number)]"
                  />
                </div>

                <h3 className={`@container ${cardTitle}`}>
                  <span className="meridian-fit" style={fitWord(item.title)}>
                    {item.title}
                  </span>
                </h3>
              </div>

              <div className={`${cardContent} text-on-surface-muted`}>{item.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
