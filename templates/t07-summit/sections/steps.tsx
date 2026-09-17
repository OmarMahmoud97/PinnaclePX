import { Calendar, ClipboardCheck, HeartHandshake, Search } from 'lucide-react'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, gap, pad, title } from '../styles'

type Props = Pick<SummitContent, 'steps'>

// The source's four icons, in its order.
const ICONS = [Search, Calendar, ClipboardCheck, HeartHandshake] as const

// The source's How it works: two columns from lg. At the left the eyebrow, the heading and a
// line, centred below lg; at the right the steps, each an icon in a dashed ring beside a title
// and a line, down a hairline that shows from lg. The left parts rise one by one and the
// column of steps rises as one.
export function SummitSteps({ steps }: Props) {
  return (
    <section
      id="booking-process"
      className={`mx-auto flex w-full max-w-7xl flex-col justify-between gap-12 lg:flex-row ${pad} ${anchored} ${gap}`}
    >
      <div className="flex shrink-0 flex-col items-center lg:items-start">
        <p data-fade style={delay(0.2)} className={eyebrow}>
          {steps.eyebrow}
        </p>
        <h2
          data-fade
          data-spring="soft"
          className={`${title} mt-6 max-w-lg text-center text-4xl md:text-5xl lg:text-left`}
        >
          {steps.heading}
        </h2>
        <p
          data-fade
          style={delay(0.2)}
          className="mt-4 max-w-108 text-center text-sm/5.5 text-on-surface-muted lg:text-left"
        >
          {steps.body}
        </p>
      </div>
      <div
        data-fade
        style={delay(0.2)}
        className="relative flex flex-col items-center gap-10 lg:items-start"
      >
        <div className="absolute top-7 bottom-7 left-7 hidden w-px bg-border lg:block" />
        {steps.items.map((item, index) => {
          const Icon = ICONS[index] ?? ClipboardCheck
          return (
            <div key={item.title} className="group relative flex items-start gap-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-surface ring-6 ring-surface">
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className="text-on-surface/55"
                />
              </div>
              <div className="pt-2.5">
                <h3 className="text-lg text-on-surface/75 md:text-xl">{item.title}</h3>
                <p className="mt-2 max-w-84 text-sm text-on-surface/55">{item.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
