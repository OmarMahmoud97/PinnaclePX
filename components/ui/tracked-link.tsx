'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { type AnalyticsEvent, type EventData, trackEvent } from '@/lib/analytics/events'

type Props = ComponentProps<typeof Link> & {
  event: Extract<AnalyticsEvent, 'cta_click' | 'call_click'>
  location: string
  // Further flat properties for the event, beside the location.
  data?: EventData | undefined
}

// A link that records which call to action was clicked and where on the page it sat.
export function TrackedLink({ event, location, data, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(event, { location, ...data })
        onClick?.(e)
      }}
    />
  )
}

type AnchorProps = ComponentProps<'a'> & {
  event: Extract<AnalyticsEvent, 'contact_click' | 'client_site_open'>
  location: string
  data?: EventData | undefined
}

// The same for a plain anchor, which a mailto: address or a link to another site has to be.
export function TrackedAnchor({ event, location, data, onClick, ...rest }: AnchorProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent(event, { location, ...data })
        onClick?.(e)
      }}
    />
  )
}
