import type { MonolithContent } from '../copy-slots'
import { card, cardContent, cardHeader, cardTitle, container } from '../styles'
import { Emphasis } from './emphasis'
import { GiftIcon, MapIcon, MedalIcon, PlaneIcon } from './icons'

type Props = Pick<MonolithContent, 'steps'>

const ICONS = [MedalIcon, MapIcon, PlaneIcon, GiftIcon] as const

// The source's HowItWorks: a centred heading and lead over four muted cards, each with its
// illustration and title stacked in the centre and its description beneath.
export function MonolithHowItWorks({ steps }: Props) {
  return (
    <section id="how-it-works" className={`${container} py-24 text-center sm:py-32`}>
      <h2 className="text-3xl font-bold md:text-4xl">
        <Emphasis heading={steps.heading} />
      </h2>
      <p className="mx-auto mt-4 mb-8 text-xl text-on-surface-muted md:w-3/4">{steps.lead}</p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.items.map((step, index) => {
          const Icon = ICONS[index] ?? MedalIcon
          return (
            <div key={step.title} className={`${card} bg-surface-muted/50`}>
              <div className={cardHeader}>
                <h3 className={`${cardTitle} grid place-items-center gap-4`}>
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
