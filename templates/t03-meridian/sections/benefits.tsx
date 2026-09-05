import { Blocks, ChartLine, Sparkle, Wallet } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import { card, cardContent, cardHeader, cardTitle, container } from '../styles'

type Props = Pick<MeridianContent, 'benefits'>

// The source's four benefit icons, in its order.
const ICONS = [Blocks, ChartLine, Wallet, Sparkle] as const

// The source's BenefitsSection: the words at the left, and at the right a two-by-two of cards
// on the card surface, each with an icon in the brand colour at the top left and a large faint
// number at the top right that darkens as the card turns to the page surface under the pointer.
export function MeridianBenefits({ benefits }: Props) {
  return (
    <section id="benefits" className={`${container} py-24 sm:py-32`}>
      <div className="grid place-items-center lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 className="mb-2 text-lg tracking-wider text-brand-deeper">{benefits.eyebrow}</h2>

          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{benefits.heading}</h2>
          <p className="mb-8 text-xl text-on-surface-muted">{benefits.lead}</p>
        </div>

        <div className="grid w-full gap-4 lg:grid-cols-2">
          {benefits.items.map((item, index) => {
            const Icon = ICONS[index] ?? Blocks
            return (
              <div
                key={item.title}
                className={`${card} group/number bg-accent transition-all delay-75 hover:bg-surface`}
              >
                <div className={cardHeader}>
                  <div className="flex justify-between">
                    <Icon size={32} className="mb-6 text-brand-deeper" />
                    <span
                      aria-hidden="true"
                      data-number={`0${String(index + 1)}`}
                      className="text-5xl font-medium text-on-surface-muted/15 transition-all delay-75 group-hover/number:text-on-surface-muted/30 before:content-[attr(data-number)]"
                    />
                  </div>

                  <h3 className={cardTitle}>{item.title}</h3>
                </div>

                <div className={`${cardContent} text-on-surface-muted`}>{item.body}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
