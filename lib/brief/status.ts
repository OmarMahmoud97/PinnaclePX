// What the done page and a preview opened early learn about a submission each time they ask.
// Derived from the submission row (lib/preview/status.ts), never stored.

type ConceptStatus = Readonly<{
  // Null until the select stage has chosen the templates.
  templateId: string | null
  name: string | null
  ready: boolean
  href: string | null
}>

export type SubmissionStatus =
  | Readonly<{ status: 'missing' }>
  | Readonly<{
      // building: stages still open. ready: every stage finished and every concept can be
      // opened. partial: the sweeper had to settle a stage with its fallback at the deadline, so
      // the page can be opened but the email is withheld. exhausted: this identity has seen every
      // template, so there is nothing new to show and the call is the next step. failed: a stage
      // with no fallback did not complete; the visitor is told plainly.
      status: 'building' | 'ready' | 'partial' | 'exhausted' | 'failed'
      slug: string
      deadlineAt: string
      conceptCount: number
      concepts: readonly ConceptStatus[]
    }>
