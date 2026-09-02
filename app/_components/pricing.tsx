'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FeatureList } from '@/app/_components/feature-list'
import { PlanCard } from '@/app/_components/plan-card'
import { PlanPrice } from '@/app/_components/plan-price'
import { BILLING_PERIODS, PLANS, type BillingPeriod } from '@/app/_components/pricing-plans'
import { buttonStyles } from '@/components/ui/button'
import { cn } from '@/lib/cn'

// Thin decorative band above and below the plan grid.
const BAND = 'h-14 bg-linear-to-r from-surface-muted/10 via-surface-muted/25 to-surface-muted/10'

export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')

  return (
    <section id="pricing" className="w-full">
      <div className="grid divide-border md:grid-cols-6 md:divide-x">
        <div className="flex flex-col gap-4 p-8 md:col-span-2 md:p-14">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            Start free. Pay when it earns its keep.
          </h2>
          <p className="text-balance text-on-surface-muted">
            Run a brief on the free tier. Upgrade when you want the watermark gone and a domain of
            your own.
          </p>
          <div
            role="group"
            aria-label="Billing period"
            className="mt-4 flex h-11 w-fit items-center rounded-xl border border-border bg-surface-muted px-px"
          >
            {BILLING_PERIODS.map(({ id, label }) => {
              const active = id === period
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setPeriod(id)
                  }}
                  className={cn(
                    'h-10 cursor-pointer rounded-xl border px-4 text-sm font-medium transition-colors',
                    active
                      ? 'border-border bg-surface-raised text-on-surface'
                      : 'border-transparent text-on-surface-muted',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col md:col-span-4">
          <div aria-hidden="true" className={cn(BAND, 'border-b border-border')} />

          <div className="grid grid-cols-1 border-b border-border md:grid-cols-2">
            <PlanCard
              plan={PLANS.studio}
              period={period}
              popular
              ctaVariant="primary"
              className="border-b border-border bg-surface-raised/50 md:border-r md:border-b-0"
            />
            <PlanCard
              plan={PLANS.agency}
              period={period}
              ctaVariant="contrast"
              className="bg-accent"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 border-t border-border md:grid-cols-5">
            <div className="flex flex-col gap-6 p-6 md:col-span-3 md:p-8">
              <h4 className="text-xl font-medium">{PLANS.free.name}</h4>
              <PlanPrice
                amount={PLANS.free.price[period]}
                period={period}
                description={PLANS.free.description}
              />
              <Link
                href={PLANS.free.cta.href}
                className={buttonStyles({ variant: 'outline', className: 'w-full' })}
              >
                {PLANS.free.cta.label}
              </Link>
            </div>
            <div className="p-6 md:col-span-2 md:p-8">
              <FeatureList intro={PLANS.free.featuresIntro} items={PLANS.free.features} />
            </div>
          </div>

          <div aria-hidden="true" className={cn(BAND, 'border-t border-border')} />
        </div>
      </div>
    </section>
  )
}
