'use client'

import type { ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics/events'

type Props = Readonly<{
  href: string
  // The link's name: which design, how it looks, and that it opens in a new tab.
  label: string
  template: string
  // How the visitor reached the designs page: by the email's link, or any other way.
  from: 'hub' | 'email'
  children: ReactNode
}>

// A design on the designs page, opening in a new tab so the page is still there to come back to,
// and counted as it opens (docs/start-page-journey-plan.md, 8.5).
export function DesignLink({ href, label, template, from, children }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onClick={() => {
        trackEvent('design_open', { template, from })
      }}
      className="hub-design"
    >
      {children}
    </a>
  )
}
