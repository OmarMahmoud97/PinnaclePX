import type { HarborContent } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HarborCount } from './count'
import { HeadingLines } from './lines'

type Props = Pick<HarborContent, 'metrics'>

// The source's Stats: a quieter band between hairlines with one word set huge and almost
// invisible behind it, the eyebrow and heading centred, then a hairline grid of cells, two
// columns and three from md, each a large figure in the accent over a label and a line. A
// figure counts up from zero once in view, as the source's did (count.tsx); a phrase, which is
// what a visitor's page carries, stands. The cells rise in turn as they arrive.
export function HarborMetrics({ metrics }: Props) {
  return (
    <section
      id="metrics"
      className={`${section} relative overflow-hidden border-y border-border bg-surface-muted`}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
        aria-hidden="true"
      >
        <span className="font-display text-[18vw] leading-none font-black tracking-tighter text-on-surface/2 uppercase">
          {metrics.watermark}
        </span>
      </div>
      <div className={`${container} relative z-10`}>
        <div className="mb-16 text-center">
          <div data-fade data-margin="-80px">
            <span className={`${eyebrow} mb-4`}>{metrics.eyebrow}</span>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.1)}>
            <h2 className={heading}>
              <HeadingLines heading={metrics.heading} />
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {metrics.items.map((item, index) => (
            <div
              key={item.label}
              data-fade
              data-margin="-40px"
              style={motion(0.1 * index, '20px', 0.5, 'out')}
              className="group bg-surface p-8 transition-colors duration-300 hover:bg-accent md:p-12"
            >
              <HarborCount
                value={item.value}
                className="mb-2 block origin-left text-5xl leading-none font-black text-brand-deeper transition-transform duration-300 group-hover:scale-105"
              />
              <p className="mb-1 font-display text-base font-bold tracking-wide text-on-surface uppercase">
                {item.label}
              </p>
              <p className="text-xs text-on-surface/40">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
