import type { MeridianContent } from '../copy-slots'
import {
  badge,
  card,
  cardDescription,
  cardHeader,
  cardTitle,
  container,
  eyebrow,
  sectionLead,
  sectionTitle,
} from '../styles'

type Props = Pick<MeridianContent, 'services'>

// The source's ServicesSection: centred words, then two columns of cards on the card surface
// held to sixty percent of the width, each a title and a line, with a PRO badge pinned outside
// the top right corner of the ones so marked.
export function MeridianServices({ services }: Props) {
  return (
    <section id="services" className={`${container} py-24 sm:py-32`}>
      <h2 className={`${eyebrow} text-center`}>{services.eyebrow}</h2>

      <h2 className={`${sectionTitle} text-center`}>{services.heading}</h2>
      <h3 className={`${sectionLead} text-center`}>{services.lead}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>

      <div className="mx-auto grid w-full gap-4 sm:grid-cols-2 lg:w-[60%] lg:grid-cols-2">
        {services.items.map((item) => (
          <div key={item.title} className={`${card} relative h-full bg-accent`}>
            <div className={cardHeader}>
              <h3 className={cardTitle}>{item.title}</h3>
              <p className={cardDescription}>{item.body}</p>
            </div>
            {item.pro && <span className={`${badge.secondary} absolute -top-2 -right-3`}>PRO</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
