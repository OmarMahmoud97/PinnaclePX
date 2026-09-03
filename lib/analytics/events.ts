import 'client-only'
import { track } from '@vercel/analytics'

// Every custom analytics event the browser sends, in one place. Server-side events go through
// @vercel/analytics/server in their own module when the pipeline lands.
export type AnalyticsEvent =
  | 'cta_click'
  | 'call_click'
  | 'contact_click'
  | 'faq_open'
  | 'section_view'
  | 'brief_focus'
  | 'brief_step'
  | 'brief_error'
  | 'brief_complete'

// Vercel accepts only flat string, number, boolean or null values.
type EventData = Readonly<Record<string, string | number | boolean | null>>

export function trackEvent(event: AnalyticsEvent, data: EventData): void {
  track(event, data)
}
