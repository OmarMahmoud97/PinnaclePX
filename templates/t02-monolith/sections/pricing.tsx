import { Check } from 'lucide-react'
import type { MonolithContent } from '../copy-slots'
import {
  badge,
  button,
  card,
  cardContent,
  cardDescription,
  cardFooter,
  cardHeader,
  cardTitle,
  container,
} from '../styles'
import { Emphasis } from './emphasis'

type Props = { pricing: NonNullable<MonolithContent['pricing']> }

// The source's Pricing: a centred heading and lead over three cards, the popular one lifted on
// a shadow with its badge, each with the price, a description, a button, a rule and the list of
// ticked benefits.
export function MonolithPricing({ pricing }: Props) {
  return (
    <section id="pricing" className={`${container} py-24 sm:py-32`}>
      <h2 className="text-center text-3xl font-bold md:text-4xl">
        <Emphasis heading={pricing.heading} />
      </h2>
      <h3 className="pt-4 pb-8 text-center text-xl text-on-surface-muted">{pricing.lead}</h3>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {pricing.plans.map((plan) => (
          <div key={plan.title} className={`${card} ${plan.popular ? 'drop-shadow-xl' : ''}`}>
            <div className={cardHeader}>
              <h3 className={`${cardTitle} flex items-center justify-between`}>
                {plan.title}
                {plan.popular && <span className={badge.secondaryBrand}>Most popular</span>}
              </h3>
              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-on-surface-muted"> {plan.period}</span>
              </div>

              <p className={cardDescription}>{plan.body}</p>
            </div>

            <div className={cardContent}>
              <a href={plan.button.href} className={`w-full ${button.default}`}>
                {plan.button.label}
              </a>
            </div>

            <hr className="m-auto mb-4 w-4/5 border-border" />

            <div className={`${cardFooter} flex`}>
              <div className="[&>*+*]:mt-4">
                {plan.benefits.map((benefit) => (
                  <span key={benefit} className="flex">
                    <Check className="text-brand-deeper" /> <span className="ml-2">{benefit}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
