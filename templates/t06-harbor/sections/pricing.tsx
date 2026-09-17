import { Check, Zap } from 'lucide-react'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = { pricing: NonNullable<HarborContent['pricing']> }

// The source's Pricing: a quieter band with the eyebrow, heading and a line centred, then three
// plans, the middle one filled with the accent and glowing, with a small dark pill at its
// corner; each a name, a price beside its period, a line, a list of ticks and a round button.
// The plans rise in turn and lift under the pointer. The buttons lead to the contact form.
export function HarborPricing({ pricing }: Props) {
  return (
    <section id="pricing" className={`${section} bg-surface-muted`}>
      <div className={container}>
        <div className="mb-16 text-center">
          <div data-fade data-margin="-80px">
            <span className={`${eyebrow} mb-4`}>{pricing.eyebrow}</span>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.1)}>
            <h2 className={heading}>
              <HeadingLines heading={pricing.heading} />
            </h2>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.2)}>
            <p className="mx-auto mt-3 max-w-md text-base text-on-surface/50">{pricing.lead}</p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {pricing.plans.map((plan, index) => {
            const hot = plan.highlight
            return (
              <div
                key={plan.name}
                data-fade
                style={motion(0.12 * index, undefined, 0.5, 'out')}
                className={`harbor-lift relative flex flex-col rounded-2xl p-8 ${hot ? 'harbor-glow-card bg-brand-deeper' : 'border border-on-surface/10 bg-accent hover:border-on-surface/16'}`}
              >
                {hot && (
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 rounded-full bg-surface px-4 py-1 text-[10px] font-black tracking-widest text-brand-deeper uppercase">
                      <Zap size={10} aria-hidden="true" className="fill-brand-deeper" />{' '}
                      {pricing.popular}
                    </span>
                  </div>
                )}
                <p
                  className={`mb-4 text-xs font-black tracking-widest uppercase ${hot ? 'text-on-brand/60' : 'text-on-surface/40'}`}
                >
                  {plan.name}
                </p>
                <div className="mb-4 flex items-end gap-1">
                  <span
                    className={`font-display text-5xl leading-none font-black ${hot ? 'text-on-brand' : 'text-on-surface'}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`mb-2 text-sm font-medium ${hot ? 'text-on-brand/60' : 'text-on-surface/40'}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`mb-8 text-sm leading-relaxed ${hot ? 'text-on-brand/70' : 'text-on-surface/50'}`}
                >
                  {plan.description}
                </p>
                <ul className="mb-10 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${hot ? 'bg-surface' : 'bg-brand-deeper/10'}`}
                      >
                        <Check size={10} aria-hidden="true" className="text-brand-deeper" />
                      </div>
                      <span className={`text-sm ${hot ? 'text-on-brand' : 'text-on-surface/70'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`block w-full rounded-full py-3.5 text-center font-display text-sm font-black tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${hot ? 'bg-surface text-brand-deeper hover:bg-accent' : 'harbor-glow-c bg-brand-deeper text-on-brand hover:bg-brand-deepest'}`}
                >
                  {plan.cta}
                </a>
              </div>
            )
          })}
        </div>
        <div data-fade data-margin="-80px" style={motion(0.3)} className="mt-10 text-center">
          <p className="text-xs text-on-surface/30">{pricing.note}</p>
        </div>
      </div>
    </section>
  )
}
