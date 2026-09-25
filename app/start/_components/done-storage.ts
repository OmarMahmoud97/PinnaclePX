import 'client-only'
import * as z from 'zod'
import type { Submitted } from '@/app/start/_components/brief-reducer'
import { firstNameFrom } from '@/lib/brief/names'
import { paletteFor } from '@/lib/brief/palettes'
import type { Answers } from '@/lib/brief/schema'
import { styleFor } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'
import { windowKey } from '@/lib/rate-limit/window'

// The keys a send and its done view leave in the browser (docs/start-page-journey-plan.md, 7.3),
// read and written only here. Each record carries a version, so a later shape drops an older one
// rather than misreading it. Every read and write is guarded: a private window or a full disk
// throws, and the page still works for the visit, it just cannot come back after a refresh. A
// value that is unreadable or out of date is removed as it is read. None of them ever reaches
// analytics.

// This tab's own send, in the visitor's words: what the done view says to the person who sent
// it. Per tab, so it goes when the tab closes; "Start a new brief" clears it sooner.
export const DONE_KEY = 'pinnaclepx.done'
// The submission this browser sent last: enough to reopen its done view after a refresh, a
// pasted link or a return by the header's ask, and nothing personal. It lapses a day after the
// designs' deadline (CONFIG.start.done.restoreHours).
export const SUBMITTED_KEY = 'pinnaclepx.submitted'
// A send in flight, and when it started. A reload during the send finds it and says the brief
// may already be on its way.
export const PENDING_KEY = 'pinnaclepx.pending'
// The day's sends, counted in the server's own window, so the done view can say when the day's
// last brief has gone. Neither "Start a new brief" nor a missing poll clears it, or the count
// would start again; it lapses with its window.
export const SENDS_KEY = 'pinnaclepx.sends'
// The submissions whose done view this tab has reported (done_view, once per slug per tab, plan
// 8.5), so a refresh during the wait is not a second view. Per tab, so it goes when the tab
// closes.
export const VIEWED_KEY = 'pinnaclepx.viewed'

const HOUR_MS = 3_600_000
const { windowSeconds: SENDS_WINDOW_SECONDS } = CONFIG.rateLimit.submissionsPerIdentity

const detailsSchema = z.object({
  v: z.literal(1),
  slug: z.string(),
  first: z.string(),
  company: z.string(),
  email: z.string(),
  // Null for a colour of the visitor's own, which has no name.
  paletteLabel: z.string().nullable(),
  styleLabel: z.string(),
  // How many photos of their own went with the brief, so the wait can say it is placing them.
  // Missing from a record a tab kept before the wait said so, which reads as not known.
  photos: z.number().int().min(0).optional(),
})

const submittedSchema = z.object({
  v: z.literal(1),
  slug: z.string(),
  deadlineAt: z.string(),
  conceptCount: z.number().int().min(1),
  savedAt: z.number(),
  expiresAt: z.number(),
})

const pendingSchema = z.object({ v: z.literal(1), startedAt: z.number() })

// The distinct slugs sent in the window, so a send that returns a slug already counted (the same
// answers sent again after a reload) never counts twice.
const sendsSchema = z.object({ v: z.literal(1), window: z.string(), slugs: z.array(z.string()) })

const viewedSchema = z.object({ v: z.literal(1), slugs: z.array(z.string()) })

export type DoneDetails = Readonly<Omit<z.infer<typeof detailsSchema>, 'v'>>

type Store = 'local' | 'session'

function storage(store: Store): Storage {
  return store === 'local' ? window.localStorage : window.sessionStorage
}

function read<T>(store: Store, key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = storage(store).getItem(key)
    if (raw === null) return null
    const parsed = schema.safeParse(JSON.parse(raw))
    if (parsed.success) return parsed.data
  } catch {
    // Unreadable: dropped below.
  }
  remove(store, key)
  return null
}

function write(store: Store, key: string, value: unknown): void {
  try {
    storage(store).setItem(key, JSON.stringify(value))
  } catch {
    // Storage is unavailable; the done view still has this visit's memory.
  }
}

function remove(store: Store, key: string): void {
  try {
    storage(store).removeItem(key)
  } catch {
    // Nothing to remove.
  }
}

// What the done key keeps of the answers just sent.
export function doneDetailsFrom(answers: Answers, slug: string): DoneDetails {
  const { colours, imagery } = answers
  return {
    slug,
    first: firstNameFrom(answers.name),
    company: answers.company.trim(),
    email: answers.email.trim(),
    paletteLabel: colours.kind === 'palette' ? paletteFor(colours.paletteId).label : null,
    styleLabel: styleFor(imagery.style).label,
    photos: imagery.photos.length,
  }
}

// A send went through: the tab keeps its words, the browser keeps the submission until a day
// past its deadline, and the day's count takes the slug.
export function rememberSend(details: DoneDetails, submitted: Submitted, now = Date.now()): void {
  write('session', DONE_KEY, { v: 1, ...details })
  write('local', SUBMITTED_KEY, {
    v: 1,
    ...submitted,
    savedAt: now,
    expiresAt: Date.parse(submitted.deadlineAt) + CONFIG.start.done.restoreHours * HOUR_MS,
  })
  const slugs = sendsIn(now)
  if (!slugs.includes(submitted.slug)) {
    write('local', SENDS_KEY, {
      v: 1,
      window: windowKey(new Date(now), SENDS_WINDOW_SECONDS),
      slugs: [...slugs, submitted.slug],
    })
  }
}

// What this browser kept of one submission: this tab's words, if it sent it, and the server's
// answer at send, while the browser can still bring it back. Either may be missing.
export type Kept = Readonly<{ details: DoneDetails | null; submitted: Submitted | null }>

export function keptFor(slug: string, now = Date.now()): Kept {
  const live = liveSubmission(now)
  return { details: doneDetailsFor(slug), submitted: live?.slug === slug ? live : null }
}

// This tab's own words about a send, if it made the one with this slug.
function doneDetailsFor(slug: string): DoneDetails | null {
  const details = read('session', DONE_KEY, detailsSchema)
  if (details?.slug !== slug) return null
  const { v: _version, ...rest } = details
  return rest
}

// The submission this browser sent last, while it can still be brought back.
export function liveSubmission(now = Date.now()): Submitted | null {
  const record = read('local', SUBMITTED_KEY, submittedSchema)
  if (record === null) return null
  if (now > record.expiresAt) {
    remove('local', SUBMITTED_KEY)
    return null
  }
  const { slug, deadlineAt, conceptCount } = record
  return { slug, deadlineAt, conceptCount }
}

// The poll says this submission no longer exists: nothing here should bring it back.
export function forgetSubmission(slug: string): void {
  if (read('session', DONE_KEY, detailsSchema)?.slug === slug) remove('session', DONE_KEY)
  if (read('local', SUBMITTED_KEY, submittedSchema)?.slug === slug) {
    remove('local', SUBMITTED_KEY)
  }
}

// "Start a new brief": every trace of the last send but the day's count.
export function forgetSubmissions(): void {
  remove('session', DONE_KEY)
  remove('local', SUBMITTED_KEY)
  remove('session', PENDING_KEY)
}

export function markPending(now = Date.now()): void {
  write('session', PENDING_KEY, { v: 1, startedAt: now })
}

export function clearPending(): void {
  remove('session', PENDING_KEY)
}

// Whether a send started recently enough that it may still be on its way.
export function sendPending(now = Date.now()): boolean {
  const pending = read('session', PENDING_KEY, pendingSchema)
  if (pending === null) return false
  if (now - pending.startedAt <= CONFIG.start.send.pendingMs) return true
  remove('session', PENDING_KEY)
  return false
}

// How many briefs this browser has sent in the server's current window.
export function sendsToday(now = Date.now()): number {
  return sendsIn(now).length
}

// The done views already asked about in this page load, so each poll after the first reads no
// storage, and a tab whose storage refuses still counts a view once per page load.
const viewedHere = new Set<string>()

// Whether this is the tab's first sight of a submission's done view, noting it if so.
export function firstDoneView(slug: string): boolean {
  if (viewedHere.has(slug)) return false
  viewedHere.add(slug)
  const slugs = read('session', VIEWED_KEY, viewedSchema)?.slugs ?? []
  if (slugs.includes(slug)) return false
  write('session', VIEWED_KEY, { v: 1, slugs: [...slugs, slug] })
  return true
}

function sendsIn(now: number): readonly string[] {
  const sends = read('local', SENDS_KEY, sendsSchema)
  if (sends === null) return []
  if (sends.window === windowKey(new Date(now), SENDS_WINDOW_SECONDS)) return sends.slugs
  remove('local', SENDS_KEY)
  return []
}
