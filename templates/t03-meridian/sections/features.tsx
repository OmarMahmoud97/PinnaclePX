import { Check } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import { fitWord } from '../fit'
import {
  cardContent,
  cardHeader,
  cardTitle,
  container,
  eyebrow,
  sectionLead,
  sectionTitle,
} from '../styles'

type Props = Pick<MeridianContent, 'features'>

// The source's FeaturesSection: centred words, then a grid of borderless cards on the page
// surface, three across, each with a mark in a tinted disc with a wide soft ring, its title and
// a centred description. The source drew an app's icons in the discs, taken by position (a
// tablet and phone beside a trade's work); the features are in no order, so one tick, the mark
// Meridian's pricing lists use, now stands in every disc (decision 1).
export function MeridianFeatures({ features }: Props) {
  return (
    <section id="features" className={`${container} py-24 sm:py-32`}>
      <h2 className={`${eyebrow} text-center`}>{features.eyebrow}</h2>

      <h2 className={`@container ${sectionTitle} text-center`}>
        <span className="meridian-fit" style={fitWord(features.heading)}>
          {features.heading}
        </span>
      </h2>

      <h3 className={`${sectionLead} text-center`}>{features.lead}</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.items.map((item) => (
          <div key={item.title}>
            <div className="h-full rounded-lg border-0 bg-surface text-on-surface shadow-none">
              <div className={`${cardHeader} items-center justify-center`}>
                <div className="mb-4 rounded-full bg-brand-deeper/20 p-2 ring-8 ring-brand-deeper/10">
                  <Check size={24} className="text-brand-deeper" />
                </div>

                <h3 className={cardTitle}>{item.title}</h3>
              </div>

              <div className={`${cardContent} text-center text-on-surface-muted`}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
