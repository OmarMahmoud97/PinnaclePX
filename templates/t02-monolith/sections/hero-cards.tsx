import { Check } from 'lucide-react'
import type { MonolithContent } from '../copy-slots'
import {
  badge,
  button,
  card,
  cardContent,
  cardDescription,
  cardDescriptionBase,
  cardDescriptionBrand,
  cardFooter,
  cardHeader,
  cardHeaderTight,
  cardTitle,
  cardTitleLg,
} from '../styles'
import { Avatar } from './avatar'

type Props = { brand: MonolithContent['brand']; cards: MonolithContent['hero']['cards'] }

// The source's HeroCards: four cards placed absolutely in a 700 by 500 box, hidden below lg. A
// testimonial at the top left, a team member at the top right, a price plan at the lower left
// and a service at the lower right; here the quote and the profile carry the brand's own words
// and pictures, and the plan's price shows only when there is one. The glow slides behind the
// cards inside their box (monolith.css), so it lights them wherever they show and never sits
// behind the words. The visitor's name may wrap anywhere rather than run out of its card. The
// service card's tinted square holds the plan's own Check, where the source drew a light bulb
// (decision 1, t02-L2). The cards' titles were headings in the source, four of them before the
// page's first section heading; they are text here with the same look.
export function HeroCards({ brand, cards }: Props) {
  const { quote, profile, plan, service } = cards
  return (
    <div className="relative hidden h-[500px] w-[700px] flex-row flex-wrap gap-8 lg:flex lg:max-[1440px]:mt-10">
      <div aria-hidden="true" className="monolith-glow" />

      <div className={`${card} absolute -top-[15px] w-[340px] drop-shadow-xl`}>
        <div className={`${cardHeader} flex-row items-center gap-4 pb-2`}>
          <Avatar image={quote.image} name={brand.name} />
          <div className="flex min-w-0 flex-col">
            <p className={`${cardTitleLg} wrap-anywhere`}>{brand.name}</p>
            <p className={cardDescription}>{quote.role}</p>
          </div>
        </div>
        <div className={cardContent}>{quote.text}</div>
      </div>

      <div
        className={`${card} absolute top-4 right-[20px] flex w-80 flex-col items-center justify-center drop-shadow-xl`}
      >
        <div className={`${cardHeader} mt-8 flex items-center justify-center pb-2`}>
          <Avatar
            image={profile.image}
            name={brand.name}
            className="absolute -top-12 aspect-square h-24 w-24 grayscale-[0%]"
            textClass="text-3xl"
          />
          <p className={`${cardTitle} text-center wrap-anywhere`}>{brand.name}</p>
          <p className={`${cardDescriptionBrand} font-normal`}>{profile.role}</p>
        </div>
        <div className={`${cardContent} pb-2 text-center`}>
          <p>{profile.body}</p>
        </div>
        <div className={cardFooter} />
      </div>

      <div className={`${card} absolute top-[150px] left-[50px] w-72 drop-shadow-xl`}>
        <div className={cardHeader}>
          <p className={`${cardTitle} flex items-center justify-between`}>
            {plan.title}
            <span className={badge.secondaryBrand}>{plan.badge}</span>
          </p>
          {plan.price !== null && (
            <div>
              <span className="text-3xl font-bold">{plan.price.amount}</span>
              <span className="text-on-surface-muted"> {plan.price.period}</span>
            </div>
          )}
          <p className={cardDescription}>{plan.body}</p>
        </div>

        <div className={cardContent}>
          <a href={plan.action.href} className={`w-full ${button.default}`}>
            {plan.action.label}
          </a>
        </div>

        <hr className="m-auto mb-4 w-4/5 border-border" />

        <div className={`${cardFooter} flex`}>
          <div className="[&>*+*]:mt-4">
            {plan.points.map((point) => (
              <span key={point} className="flex">
                <Check className="text-brand-deeper" /> <span className="ml-2">{point}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`${card} absolute -right-[10px] bottom-[35px] w-[350px] drop-shadow-xl`}>
        <div className={`${cardHeaderTight} items-start justify-start gap-4 md:flex-row`}>
          <div className="mt-1 rounded-2xl bg-brand-deeper/20 p-4">
            <Check className="h-8 w-8 text-brand-deeper" />
          </div>
          <div>
            <p className={cardTitle}>{service.title}</p>
            <p className={`${cardDescriptionBase} mt-2`}>{service.body}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
