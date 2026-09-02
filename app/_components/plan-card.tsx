import Link from 'next/link'
import { FeatureList } from '@/app/_components/feature-list'
import { PlanPrice } from '@/app/_components/plan-price'
import type { BillingPeriod, Plan } from '@/app/_components/pricing-plans'
import { buttonStyles } from '@/components/ui/button'
import { cn } from '@/lib/cn'

type Props = {
  plan: Plan
  period: BillingPeriod
  popular?: boolean | undefined
  ctaVariant: 'primary' | 'contrast'
  className?: string | undefined
}

export function PlanCard({ plan, period, popular = false, ctaVariant, className }: Props) {
  return (
    <div className={cn('grid h-full gap-8 p-6', className)}>
      <div className="grid gap-8">
        <div className="flex flex-col gap-8">
          <h4 className="flex items-center gap-2 text-xl font-medium">
            {plan.name}
            {popular && (
              <span className="rounded-md border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                Popular
              </span>
            )}
          </h4>
          <PlanPrice amount={plan.price[period]} period={period} description={plan.description} />
        </div>
        <Link
          href={plan.cta.href}
          className={buttonStyles({ variant: ctaVariant, size: 'lg', className: 'h-10 w-full' })}
        >
          {plan.cta.label}
        </Link>
      </div>
      <hr className="border-dashed border-border" />
      <FeatureList intro={plan.featuresIntro} items={plan.features} />
    </div>
  )
}
