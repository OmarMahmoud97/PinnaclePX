import { Check } from 'lucide-react'
import type { HarborContent } from '../copy-slots'
import { fitWord } from '../fit'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'services'>

// The source's Services: the eyebrow and heading at the left of a row with a short paragraph
// at its right, then a hairline grid of cards, one column, two from md and three from lg,
// each a tag, an icon in a square, a title and a paragraph, with a link that appears under
// the pointer. The third card is lit: a hairline of the accent along its top, its tag and its
// square filled with the accent. The cards rise in turn as they arrive.
//
// The source's six icons, a dumbbell first, belonged to its gym's classes by position; here
// every square holds the same check, since a visitor's offerings are not in order and Harbor's
// arrows mean a link. The source's line under the pointer was not a link and never showed on a
// touch screen, so it is not drawn; its words stay in the copy. The heading and the card titles
// are sized so their longest word fits (fit.ts); from md the heading shares its row with the
// paragraph, which narrows as far as its own longest word, so the heading fits the row less
// 10rem.
export function HarborServices({ services }: Props) {
  return (
    <section id="services" className={`${section} bg-surface`}>
      <div className={`${container} @container`}>
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div data-fade data-margin="-80px">
              <span className={`${eyebrow} mb-4`}>{services.eyebrow}</span>
            </div>
            <div data-fade data-margin="-80px" style={motion(0.1)}>
              <h2
                className={`${heading} md:text-[length:min(3rem,(100cqi_-_10rem)*0.97/var(--harbor-word,1))]`}
                style={fitWord(services.heading.lines)}
              >
                <HeadingLines heading={services.heading} />
              </h2>
            </div>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.2)} className="max-w-xs">
            <p className="text-sm leading-relaxed text-on-surface-muted">{services.lead}</p>
          </div>
        </div>
        <div
          className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3"
          style={fitWord(services.items.map((item) => item.title))}
        >
          {services.items.map((item, index) => {
            const hot = index === 2
            return (
              <div
                key={item.title}
                data-fade
                data-margin="-50px"
                style={motion(0.08 * index, '30px', 0.5, 'out')}
                className={`group @container relative cursor-default p-8 transition-colors duration-300 ${hot ? 'harbor-hot bg-accent' : 'bg-surface hover:bg-accent'}`}
              >
                {hot && <div className="absolute top-0 right-0 left-0 h-px bg-brand-deeper" />}
                <span
                  className={`mb-6 inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase ${hot ? 'bg-brand-deeper text-on-brand' : 'bg-border text-on-surface-muted'}`}
                >
                  {item.tag}
                </span>
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${hot ? 'bg-brand-deeper group-hover:scale-110' : 'bg-border group-hover:bg-brand-deeper/10'}`}
                >
                  <Check
                    size={22}
                    aria-hidden="true"
                    className={hot ? 'text-on-brand' : 'text-brand-deeper'}
                  />
                </div>
                <h3 className="mb-3 font-display text-[length:min(1.25rem,97cqi/var(--harbor-word,1))] leading-[1.4] font-black tracking-tight text-on-surface uppercase transition-colors duration-300 group-hover:text-brand-deeper">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-muted">{item.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
