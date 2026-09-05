import { Check } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import {
  button,
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
  container,
  eyebrow,
  sectionTitle,
} from '../styles'

type Props = { pricing: NonNullable<MeridianContent['pricing']> }

// The source's PricingSection: centred words over three cards, the popular one scaled up a
// tenth with a brand border and a shadow, each with a title, a description, the price, the
// ticked benefits and a button, filled for the popular plan and secondary for the rest.
export function MeridianPricing({ pricing }: Props) {
  return (
    <section id="pricing" className={`${container} py-24 sm:py-32`}>
      <h2 className={`${eyebrow} text-center`}>{pricing.eyebrow}</h2>

      <h2 className={`${sectionTitle} text-center`}>{pricing.heading}</h2>

      <h3 className="mx-auto pb-14 text-center text-xl text-on-surface-muted md:w-1/2">
        {pricing.lead}
      </h3>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {pricing.plans.map((plan) => (
          <div
            key={plan.title}
            className={`${card} ${plan.popular ? 'border-[1.5px] border-brand-deeper drop-shadow-xl lg:scale-[1.1]' : ''}`}
          >
            <div className={cardHeader}>
              <h3 className={`${cardTitle} pb-2`}>{plan.title}</h3>

              <p className={`${cardDescription} pb-4`}>{plan.body}</p>

              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-on-surface-muted"> {plan.period}</span>
              </div>
            </div>

            <div className={`${cardContent} flex`}>
              <div className="[&>*+*]:mt-4">
                {plan.benefits.map((benefit) => (
                  <span key={benefit} className="flex">
                    <Check className="mr-2 text-brand-deeper" />
                    <span>{benefit}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className={cardFooter}>
              <a
                href={plan.button.href}
                className={`${plan.popular ? button.default : button.secondary} w-full`}
              >
                {plan.button.label}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
