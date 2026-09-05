import {
  BadgeCheck,
  Goal,
  MousePointerClick,
  Newspaper,
  PictureInPicture,
  TabletSmartphone,
} from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
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

// The source's six feature icons, in its order.
const ICONS = [
  TabletSmartphone,
  BadgeCheck,
  Goal,
  PictureInPicture,
  MousePointerClick,
  Newspaper,
] as const

// The source's FeaturesSection: centred words, then a grid of borderless cards on the page
// surface, three across, each with its icon in a tinted disc with a wide soft ring, its title
// and a centred description.
export function MeridianFeatures({ features }: Props) {
  return (
    <section id="features" className={`${container} py-24 sm:py-32`}>
      <h2 className={`${eyebrow} text-center`}>{features.eyebrow}</h2>

      <h2 className={`${sectionTitle} text-center`}>{features.heading}</h2>

      <h3 className={`${sectionLead} text-center`}>{features.lead}</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length] ?? TabletSmartphone
          return (
            <div key={item.title}>
              <div className="h-full rounded-lg border-0 bg-surface text-on-surface shadow-none">
                <div className={`${cardHeader} items-center justify-center`}>
                  <div className="mb-4 rounded-full bg-brand-deeper/20 p-2 ring-8 ring-brand-deeper/10">
                    <Icon size={24} className="text-brand-deeper" />
                  </div>

                  <h3 className={cardTitle}>{item.title}</h3>
                </div>

                <div className={`${cardContent} text-center text-on-surface-muted`}>
                  {item.body}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
