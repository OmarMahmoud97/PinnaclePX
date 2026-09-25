'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { withoutSlug } from '@/lib/analytics/without-slug'

// Vercel's page views, custom events and web vitals, each sent without the submission's slug.
// The root layout is a Server Component, which cannot hand a function to these Client
// Components, so the hook is passed here.
export function Telemetry() {
  return (
    <>
      <Analytics beforeSend={withoutSlug} />
      <SpeedInsights beforeSend={withoutSlug} />
    </>
  )
}
