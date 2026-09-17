import { Brain, Dumbbell, Heart, Timer, Trophy, Zap } from 'lucide-react'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'services'>

// The source's six icons, in its order; a seventh card would take the first again.
const ICONS = [Dumbbell, Zap, Brain, Heart, Timer, Trophy] as const

// The source's Services: the eyebrow and heading at the left of a row with a short paragraph
// at its right, then a hairline grid of cards, one column, two from md and three from lg,
// each a tag, an icon in a square, a title and a paragraph, with a link that appears under
// the pointer. The third card is lit: a hairline of the accent along its top, its tag and its
// square filled with the accent. The cards rise in turn as they arrive.
export function HarborServices({ services }: Props) {
  return (
    <section id="services" className={`${section} bg-surface`}>
      <div className={container}>
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div data-fade data-margin="-80px">
              <span className={`${eyebrow} mb-4`}>{services.eyebrow}</span>
            </div>
            <div data-fade data-margin="-80px" style={motion(0.1)}>
              <h2 className={heading}>
                <HeadingLines heading={services.heading} />
              </h2>
            </div>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.2)} className="max-w-xs">
            <p className="text-sm leading-relaxed text-on-surface/50">{services.lead}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {services.items.map((item, index) => {
            const hot = index === 2
            const Icon = ICONS[index % ICONS.length] ?? Dumbbell
            return (
              <div
                key={item.title}
                data-fade
                data-margin="-50px"
                style={motion(0.08 * index, '30px', 0.5, 'out')}
                className={`group relative cursor-default p-8 transition-colors duration-300 ${hot ? 'harbor-hot bg-accent' : 'bg-surface hover:bg-accent'}`}
              >
                {hot && <div className="absolute top-0 right-0 left-0 h-px bg-brand-deeper" />}
                <span
                  className={`mb-6 inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase ${hot ? 'bg-brand-deeper text-on-brand' : 'bg-border text-on-surface/50'}`}
                >
                  {item.tag}
                </span>
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${hot ? 'bg-brand-deeper group-hover:scale-110' : 'bg-border group-hover:bg-brand-deeper/10'}`}
                >
                  <Icon
                    size={22}
                    aria-hidden="true"
                    className={hot ? 'text-on-brand' : 'text-brand-deeper'}
                  />
                </div>
                <h3 className="mb-3 font-display text-xl font-black tracking-tight text-on-surface uppercase transition-colors duration-300 group-hover:text-brand-deeper">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface/50">{item.body}</p>
                <div className="mt-6 flex items-center gap-1 text-brand-deeper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    {services.more}
                  </span>
                  <span className="text-xs">→</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
