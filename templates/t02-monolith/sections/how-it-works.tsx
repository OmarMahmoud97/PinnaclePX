import type { MonolithContent } from '../copy-slots'
import { fitWord } from '../fit'
import { card, cardContent, cardHeader, cardTitleFit, container, heading } from '../styles'
import { Emphasis } from './emphasis'
import { MapIcon, MedalIcon, PlaneIcon } from './icons'

type Props = Pick<MonolithContent, 'steps'>

const ICONS = [MedalIcon, MapIcon, PlaneIcon] as const

// The source's HowItWorks: a centred heading and lead over four muted cards, each with its
// illustration and title stacked in the centre and its description beneath.
//
// A brief always has three steps, and the first three the copy writes are the brief's own, in
// order (16 of 16 stored answers), so the first three are drawn: one column, three from md
// (decision 15). The copy keeps its four, so what the copy model writes and is checked against
// is unchanged (contract.ts). The titles share one size, never larger than lets the longest
// word fit its card (fit.ts).
export function MonolithHowItWorks({ steps }: Props) {
  const drawn = steps.items.slice(0, 3)
  return (
    <section id="how-it-works" className={`${container} @container py-24 text-center sm:py-32`}>
      <h2 className={heading} style={fitWord([steps.heading.text])}>
        <Emphasis heading={steps.heading} />
      </h2>
      <p className="mx-auto mt-4 mb-8 text-xl text-on-surface-muted md:w-3/4">{steps.lead}</p>

      <div
        className="grid grid-cols-1 gap-8 md:grid-cols-3"
        style={fitWord(drawn.map((step) => step.title))}
      >
        {drawn.map((step, index) => {
          const Icon = ICONS[index] ?? MedalIcon
          return (
            <div key={step.title} className={`${card} @container bg-surface-muted/50`}>
              <div className={cardHeader}>
                <h3 className={`${cardTitleFit} grid place-items-center gap-4`}>
                  <Icon />
                  {step.title}
                </h3>
              </div>
              <div className={cardContent}>{step.body}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
