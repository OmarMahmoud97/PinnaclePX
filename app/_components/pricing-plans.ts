import type { Route } from 'next'

export type BillingPeriod = 'monthly' | 'annually'

export const BILLING_PERIODS: readonly Readonly<{ id: BillingPeriod; label: string }>[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'annually', label: 'Annually' },
]

export type Plan = Readonly<{
  name: string
  description: string
  // Per-month price for each billing period.
  price: Readonly<Record<BillingPeriod, number>>
  cta: Readonly<{ label: string; href: Route }>
  featuresIntro: string
  features: readonly string[]
}>

// Placeholder tiers until pricing is decided.
export const PLANS = {
  free: {
    name: 'Free',
    description: 'Try a brief and see the result',
    price: { monthly: 0, annually: 0 },
    cta: { label: 'Start free', href: '/#demo' },
    featuresIntro: 'Get started today:',
    features: [
      'One brief a month',
      'Three template concepts',
      'Shareable preview link',
      'PinnaclePX watermark',
    ],
  },
  studio: {
    name: 'Studio',
    description: 'For founders and freelancers who ship often',
    price: { monthly: 19, annually: 15 },
    cta: { label: 'Upgrade to Studio', href: '/#demo' },
    featuresIntro: 'Everything in Free +',
    features: [
      'Unlimited briefs',
      'No watermark',
      'Custom domain',
      'Brand kit upload',
      'Export to HTML',
      'Priority generation',
      'Email support',
    ],
  },
  agency: {
    name: 'Agency',
    description: 'For teams producing pages for many clients',
    price: { monthly: 49, annually: 39 },
    cta: { label: 'Contact sales', href: '/#faq' },
    featuresIntro: 'Everything in Studio +',
    features: [
      'Client workspaces',
      'White-label previews',
      'Five team seats',
      'API access',
      'Shared brand library',
    ],
  },
} as const satisfies Record<string, Plan>
