import 'client-only'
import { track } from '@vercel/analytics'
import type { QuestionId } from '@/lib/brief/question-ids'
import type { SubmissionStatus } from '@/lib/brief/status'
import type { Stage } from '@/lib/db/submissions'

// Vercel accepts only flat string, number, boolean or null values.
export type EventData = Readonly<Record<string, string | number | boolean | null>>

// Every custom analytics event the browser sends, in one place, with what each carries.
// Server-side events go through @vercel/analytics/server in their own module when the pipeline
// lands. The questionnaire's journey events (docs/start-page-journey-plan.md, section 8.5) name
// their properties, at most two, so the funnel reads by question id and never by a slug; the
// slug is also stripped from every address (lib/analytics/without-slug.ts). The older events keep
// free-form properties.
type EventProperties = {
  cta_click: EventData
  call_click: EventData
  contact_click: EventData
  client_site_open: EventData
  share_click: EventData
  faq_open: EventData
  section_view: EventData
  brief_focus: EventData
  // A valid Next, by the question it left (plan 8.5, where it was a step number).
  brief_step: { question: QuestionId }
  // A Next that did not go on: a question that failed its check, or a send the server refused.
  brief_error: { question: QuestionId; reason: 'invalid' | 'server' }
  brief_complete: EventData
  // A question shows, once per question per page load, and how the visitor got to it.
  brief_view: { question: QuestionId; entry: 'hero' | 'ask' | 'direct' | 'resume' }
  // The hero's sentence lands on /start, long enough or not.
  sentence_carried: { valid: boolean }
  // A draft is restored from storage, at this question.
  draft_resumed: { question: QuestionId }
  upload_failed: { kind: 'logo' | 'photo' }
  // A send that did not go through, and why (plan 4.8): the server or the network failed, no
  // answer came in time, the day's limit was reached, the answers were refused, or a field failed.
  send_outcome: { outcome: 'retry' | 'timeout' | 'too_many' | 'rejected' | 'validation' }
  // The done view mounts, once per slug per tab, in this state of the build (plan 4.9), or past
  // its deadline and still building.
  done_view: { state: SubmissionStatus['status'] | 'time-up' }
  // The tab is hidden while the designs build, at this stage of the pipeline.
  wait_leave: { stage: Stage }
  design_open: { template: string; from: 'done' | 'hub' | 'email' }
  // "Start a new brief".
  new_brief: Record<string, never>
}

export type AnalyticsEvent = keyof EventProperties

export function trackEvent<TName extends AnalyticsEvent>(
  event: TName,
  data: EventProperties[TName],
): void {
  track(event, data)
}
