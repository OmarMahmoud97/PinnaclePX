import type { ComponentType } from 'react'
import { CashAppLogo } from '@/components/logos/cash-app'
import { LinearLogo } from '@/components/logos/linear'
import { LoomLogo } from '@/components/logos/loom'
import { MediumLogo } from '@/components/logos/medium'
import { OpenAiLogo } from '@/components/logos/openai'
import { RetoolLogo } from '@/components/logos/retool'
import { StripeLogo } from '@/components/logos/stripe'
import { WiseLogo } from '@/components/logos/wise'

export type Partner = Readonly<{ name: string; Logo: ComponentType<{ className?: string }> }>

// Placeholder marks from the template. Swap for real customers before launch.
export const PARTNERS: readonly Partner[] = [
  { name: 'OpenAI', Logo: OpenAiLogo },
  { name: 'Retool', Logo: RetoolLogo },
  { name: 'Stripe', Logo: StripeLogo },
  { name: 'Wise', Logo: WiseLogo },
  { name: 'Loom', Logo: LoomLogo },
  { name: 'Medium', Logo: MediumLogo },
  { name: 'Cash App', Logo: CashAppLogo },
  { name: 'Linear', Logo: LinearLogo },
]
