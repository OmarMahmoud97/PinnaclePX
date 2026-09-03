'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { type AnalyticsEvent, trackEvent } from '@/lib/analytics/events'

type Props = ComponentProps<typeof Link> & {
  event: Extract<AnalyticsEvent, 'cta_click' | 'call_click'>
  location: string
}

// A link that records which call to action was clicked and where on the page it sat.
export function TrackedLink({ event, location, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(event, { location })
        onClick?.(e)
      }}
    />
  )
}
