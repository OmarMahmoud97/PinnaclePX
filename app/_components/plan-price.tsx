import type { BillingPeriod } from '@/app/_components/pricing-plans'

type Props = { amount: number; period: BillingPeriod; description: string }

export function PlanPrice({ amount, period, description }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-medium md:text-4xl">${amount}</span>
        <span className="text-on-surface-muted">
          /month{period === 'annually' && ', billed yearly'}
        </span>
      </p>
      <p className="text-sm text-on-surface-muted">{description}</p>
    </div>
  )
}
