import type { StageState } from '@/lib/db/schema'
import type { Stage } from '@/lib/db/submissions'

// What the done page and a preview opened early learn about a submission each time they ask,
// from GET /api/status/{slug} (app/api/status/[slug]/route.ts). Derived from the submission row
// (lib/preview/status.ts), never stored.

type ConceptStatus = Readonly<{
  // Null until the select stage has chosen the templates.
  templateId: string | null
  // The template's code name, for the owner's notice. A visitor meets a design by its place and
  // descriptor instead (lib/preview/descriptors.ts).
  name: string | null
  ready: boolean
  href: string | null
}>

export type FoundStatus = Readonly<{
  // building: stages still open. ready: every stage finished and every concept can be opened.
  // partial: a stage settled with its fallback (the pipeline's own after its attempts, or the
  // sweeper's at the deadline), so the page opens with that part set simply, and the email goes
  // and says so. exhausted: this identity has seen every template, so there is nothing new to
  // show and the call is the next step. failed: a stage with no fallback did not complete; the
  // visitor is told plainly.
  status: 'building' | 'ready' | 'partial' | 'exhausted' | 'failed'
  slug: string
  deadlineAt: string
  conceptCount: number
  concepts: readonly ConceptStatus[]
}>

export type SubmissionStatus = Readonly<{ status: 'missing' }> | FoundStatus

// A stage as the poll reports it: where it stands, and when it settled, in whole seconds from the
// brief's arrival. Null while it is open, and for a build older than the stage times.
type StageView = Readonly<{ state: StageState; atS: number | null }>

// The picture a design's poster shows: the first image slot of its template. The credit is null
// for a photograph of the visitor's own.
type PhotoView = Readonly<{
  src: string
  credit: Readonly<{ photographer: string; url: string }> | null
}>

type ConceptView = ConceptStatus &
  Readonly<{
    // The template's headline, once the copy stage has settled.
    headline: string | null
    // Once the imagery stage has settled; null where the slot was left plain.
    photo: PhotoView | null
  }>

// The poll's answer (docs/start-page-journey-plan.md, 8.2): the status, and what the wait and the
// hub draw as the build goes. It carries no more than the designs show whoever holds the link,
// only sooner, and a part only once the stage that makes it has settled, so nothing half-made is
// ever drawn. Every count follows conceptCount.
export type FoundView = Omit<FoundStatus, 'concepts'> &
  Readonly<{
    concepts: readonly ConceptView[]
    stages: Readonly<Record<Stage, StageView>>
    // Whole seconds from the brief's arrival to the last stage settling; null until then.
    settledS: number | null
    // The colour the designs carry, once the tokens stage has derived it: the palette's name, or
    // null for a colour of the visitor's own, and the fill every design's buttons are painted in.
    palette: Readonly<{ label: string | null; hex: string }> | null
  }>

export type StatusView = Readonly<{ status: 'missing' }> | FoundView
