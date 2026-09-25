import {
  BRIEF_LINE,
  buildSaid,
  headlinesLine,
  layoutsLine,
  photosLine,
  receivedLine,
  stageSaid,
  tonesLine,
} from '@/app/start/_components/done-copy'
import type { DoneDetails } from '@/app/start/_components/done-storage'
import type { Line } from '@/app/start/_components/start-copy'
import type { FoundView } from '@/lib/brief/status'
import { formatCountdown } from '@/lib/brief/time'
import { CONFIG } from '@/lib/config'
import type { Stage } from '@/lib/db/submissions'
import { SITE } from '@/lib/site'

// What the done view draws from the build as the status poll reports it
// (docs/start-page-journey-plan.md, 4.6, 4.9 and 9.2): the log of what has landed, how many of the
// stages that is, what the status line says as each lands, the times, and the call. Pure, so each
// rule is tested without a browser (done-progress.test.ts).

// The pipeline's stages in the order it runs them (lib/db/submissions.ts, STAGES, which the
// browser may not import), and how many the ring counts.
const STAGES: readonly Stage[] = ['select', 'tokens', 'brief', 'copy', 'imagery']

export const STAGE_COUNT = STAGES.length

type StageView = FoundView['stages'][Stage]

const settled = ({ state }: StageView) => state === 'done' || state === 'fallback'

// A build whose designs open: finished, or finished with a part set simply (plan D19).
export function isLit(status: FoundView['status']): boolean {
  return status === 'ready' || status === 'partial'
}

// How many of the five stages have landed, for the ring.
export function landedOf(view: FoundView): number {
  return STAGES.filter((stage) => settled(view.stages[stage])).length
}

export type LogLine = Readonly<{
  id: 'received' | Stage
  words: Line | string
  // A stage still being made, which has no time yet.
  running: boolean
  // Whole seconds from the brief's arrival to the line's stage settling; null while it runs, and
  // for a build older than the stage times, which shows no time at all (plan 8.2).
  atS: number | null
}>

// How many of the designs' pictures are the visitor's own, when the tab no longer knows: a photo
// the pipeline found is credited, one of theirs is not.
function ownPhotosIn(view: FoundView): number {
  return view.concepts.filter((concept) => concept.photo !== null && concept.photo.credit === null)
    .length
}

// The build's log (plan 4.6): the brief's arrival, then a line for each stage once it has landed,
// with its time, and for the headlines and the photos a line while they are made. A line that names
// the business, or the photos the visitor sent, says less when the tab no longer knows them.
export function logOf(view: FoundView, details: DoneDetails | null): readonly LogLine[] {
  const { stages, conceptCount: count } = view
  const company = details?.company ?? ''
  const timed = STAGES.every((stage) => !settled(stages[stage]) || stages[stage].atS !== null)
  const lines: LogLine[] = [
    { id: 'received', words: receivedLine(company), running: false, atS: timed ? 0 : null },
  ]
  const landed = (id: Stage, words: Line | string) => {
    lines.push({ id, words, running: false, atS: stages[id].atS })
  }
  const running = (id: Stage, words: string) => {
    lines.push({ id, words, running: true, atS: null })
  }
  if (settled(stages.select)) landed('select', layoutsLine(count, company))
  if (settled(stages.tokens)) landed('tokens', tonesLine(view.palette?.label ?? null))
  if (settled(stages.brief)) landed('brief', BRIEF_LINE)

  const { copy, imagery } = stages
  if (copy.state === 'running') {
    running('copy', headlinesLine(count, 'running'))
  } else if (settled(copy)) {
    landed('copy', headlinesLine(count, copy.state === 'done' ? 'done' : 'fallback'))
  }

  const photos = details?.photos
  if (imagery.state === 'running' && details !== null && photos !== undefined) {
    running('imagery', photosLine({ state: 'running', photos, style: details.styleLabel }))
  } else if (imagery.state === 'fallback') {
    landed('imagery', photosLine({ state: 'fallback' }))
  } else if (imagery.state === 'done') {
    landed('imagery', photosLine({ state: 'done', photos: photos ?? ownPhotosIn(view) }))
  }
  return lines
}

// A stage's time as the log stamps it, "0:58".
export function stampOf(atS: number): string {
  return formatCountdown(atS * 1000)
}

// How long the whole build took, "1:52", once the server has its end; null before, and for a
// build older than the stage times.
export function tookOf(view: FoundView): string | null {
  return view.settledS === null ? null : stampOf(view.settledS)
}

// Whether the designs came in well inside the five minutes, which ready says (plan 4.6).
export function isEarly(view: FoundView): boolean {
  return view.settledS !== null && view.settledS * 1000 < CONFIG.start.wait.earlyFinishMs
}

// When the brief arrived, from the deadline the server set five minutes after it.
function arrivedAt(view: FoundView): number {
  return Date.parse(view.deadlineAt) - CONFIG.deadline.totalMs
}

// When the wait offers the call (plan 4.9): a minute after the brief arrived, or at once when the
// poll says the headlines have landed.
export function intermissionAt(view: FoundView): number {
  const arrived = arrivedAt(view)
  return settled(view.stages.copy) ? arrived : arrived + CONFIG.start.wait.intermissionMs
}

// The stage the build is at, for wait_leave: the first still to land.
export function stageNow(view: FoundView): Stage {
  return STAGES.find((stage) => !settled(view.stages[stage])) ?? 'imagery'
}

// What the build has done so far that the status line says (plan 9.2): each stage landed, the
// time running out, and how the build ended.
type News = keyof ReturnType<typeof stageSaid> | keyof ReturnType<typeof buildSaid>

const SAID_FOR: Readonly<Record<Stage, keyof ReturnType<typeof stageSaid> | null>> = {
  select: 'layouts',
  tokens: 'colours',
  brief: null,
  copy: 'headlines',
  imagery: 'photos',
}

export function newsOf(view: FoundView, late: boolean): readonly News[] {
  if (view.status === 'failed' || view.status === 'exhausted') return [view.status]
  const news: News[] = []
  for (const stage of STAGES) {
    const said = SAID_FOR[stage]
    if (said !== null && settled(view.stages[stage])) news.push(said)
  }
  if (isLit(view.status)) news.push('ready')
  else if (late) news.push('late')
  return news
}

// What the status line has heard: every item of news it knows, and the one that arrived last since
// the view opened, if any. Kept in the order the polls brought the news rather than read from one
// poll's list, so a stage that lands after the time has run out is still said.
export type Heard = Readonly<{ known: readonly News[]; newest: News | null }>

// Opening the view says only its heading, which takes the focus: what is already so is known.
export function heardAtOpen(news: readonly News[]): Heard {
  return { known: news, newest: null }
}

// What the line has heard once a poll brings `news`: the same record when nothing is new, else the
// newest arrival, the last of the poll's own order when several land together.
export function heardAfter(heard: Heard, news: readonly News[]): Heard {
  const fresh = news.filter((item) => !heard.known.includes(item))
  const newest = fresh.at(-1)
  return newest === undefined ? heard : { known: [...heard.known, ...fresh], newest }
}

// The line for the newest news, or nothing: each change is said once.
export function saidOf({ newest }: Heard, count: number): string {
  if (newest === null) return ''
  const words = { ...stageSaid(count), ...buildSaid(count) }
  return words[newest]
}

// The booking page, filled in with the visitor's first name and email while this tab has them,
// and plain otherwise (plan 8.4). Typed as the booking page's own address, so a link can take it.
type BookingHref = typeof SITE.bookingUrl | `${typeof SITE.bookingUrl}?${string}`

export function bookingHref(details: DoneDetails | null): BookingHref {
  if (details === null) return SITE.bookingUrl
  const query = new URLSearchParams(
    details.first === '' ? { email: details.email } : { name: details.first, email: details.email },
  )
  return `${SITE.bookingUrl}?${query.toString()}`
}
