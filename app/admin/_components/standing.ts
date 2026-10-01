import { addMinutes, daysAfter, formatLondon, formatLondonRelative } from '@/lib/brief/time'
import { CONFIG } from '@/lib/config'
import type { BriefOverviewRow } from '@/lib/db/briefs'
import type { EnquiryStage } from '@/lib/db/schema'
import { statusOf } from '@/lib/preview/status'

// The standing rules of the owner's desk (ADR 0047): what the list says about a brief at a glance,
// what the brief page says about its build and its call, what the sweep will do with it, and what
// the top of the page asks the owner to do. Every word records what the visitor or the system did
// (booked, cancelled, no-show, quoted, won, lost), never anything the studio did to reach them.
// Pure: every rule takes `now`, so the page and its tests read one clock.

type Mark = 'success' | 'warning' | 'danger' | null

// The phrase the list prints, the colour it carries, and a fact about the person recorded before
// this brief was sent, set aside so it is not read as this brief's.
export type Standing = Readonly<{ word: string; mark: Mark; earlier: string | null }>

// The one control the call panel offers beside its line.
export type CallControl = 'book' | 'unbook' | 'not_happening' | 'no_show'

export type NeedsYouItem = Readonly<{
  text: string
  links: readonly Readonly<{ label: string; slug: string }>[]
}>

type Row = BriefOverviewRow
type Call = Pick<Row, 'callState' | 'callSource' | 'callStartsAt' | 'callAt'>
type Worded = Readonly<{ word: string; mark: Mark }>

// Whole pounds with en-GB grouping, "£1,429": the owner types whole pounds and reads them back.
const pounds = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const DAY_MS = 86_400_000
const EARLIER = 'earlier: '
const NOTHING_WAITING = 'Nothing waiting for you.'

// Rules 1 to 3: what the owner recorded about the enquiry. Lost keeps the quote as a fact. Null
// while the enquiry stands open.
function stageWord(stage: EnquiryStage, quotePounds: number | null): string | null {
  const quote = quotePounds === null ? null : pounds.format(quotePounds)
  switch (stage) {
    case 'won':
      return quote === null ? 'Won' : `Won ${quote}`
    case 'lost':
      return quote === null ? 'Lost' : `Lost, quoted ${quote}`
    case 'quoted':
      return quote === null ? 'Quoted' : `Quoted ${quote}`
    case 'open':
      return null
  }
}

// Where a booked call stands against the clock. A call with a time is ahead until its minutes are
// over, so its word holds through the call itself, then it has passed. A mark with no time asks
// for an outcome once it is untimedCallDays old; with no stamp either there is nothing to count
// from, so it stays booked.
type Phase =
  | Readonly<{ kind: 'ahead'; start: Date }>
  | Readonly<{ kind: 'passed'; start: Date }>
  | Readonly<{ kind: 'untimed' }>
  | Readonly<{ kind: 'overdue'; marked: Date }>

function phaseOf(call: Call, now: Date): Phase {
  if (call.callStartsAt !== null) {
    const over = addMinutes(call.callStartsAt, CONFIG.call.minutes) <= now
    return over
      ? { kind: 'passed', start: call.callStartsAt }
      : { kind: 'ahead', start: call.callStartsAt }
  }
  if (call.callAt !== null && daysAfter(call.callAt, CONFIG.admin.untimedCallDays) <= now) {
    return { kind: 'overdue', marked: call.callAt }
  }
  return { kind: 'untimed' }
}

const needsOutcome = (phase: Phase) => phase.kind === 'passed' || phase.kind === 'overdue'

// Rules 4 to 8: what the visitor did about the call, or what became of it. Null with no call.
function callWord(call: Call, now: Date): Worded | null {
  switch (call.callState) {
    case null:
      return null
    case 'no_show':
      return { word: 'No-show', mark: 'danger' }
    case 'cancelled':
      return { word: 'Cancelled', mark: null }
    case 'booked': {
      const phase = phaseOf(call, now)
      if (phase.kind === 'ahead') {
        return { word: `Booked ${formatLondonRelative(phase.start, now)}`, mark: 'success' }
      }
      if (needsOutcome(phase)) return { word: 'Needs outcome', mark: 'warning' }
      return { word: 'Booked, time not set', mark: 'success' }
    }
  }
}

// Rules 9 and 10: the build's own words, once nothing about the person applies. A link sent more
// than quietDays ago says its age in whole days, so a brief nobody followed up stands out.
function buildWord(row: Row, now: Date): Worded {
  if (row.emailSentAt !== null) {
    if (daysAfter(row.emailSentAt, CONFIG.admin.quietDays) > now)
      return { word: 'Link sent', mark: null }
    const days = Math.floor((now.getTime() - row.emailSentAt.getTime()) / DAY_MS)
    return { word: `Link sent ${String(days)} ${days === 1 ? 'day' : 'days'} ago`, mark: null }
  }
  return { word: statusOf(row).status === 'building' ? 'Building' : 'No link', mark: null }
}

// The list's phrase for a brief, first match wins: the enquiry's stage, then the call, then the
// build. The stage and the call belong to the person, so a fact stamped before this brief was sent
// is an earlier brief's: it is set aside as "earlier: ..." and the brief falls through. A fact with
// no stamp cannot be dated, so it stands.
export function standingOf(row: Row, now: Date): Standing {
  const since = row.createdAt.getTime()
  const stands = (stamp: Date | null) => stamp === null || stamp.getTime() >= since
  const stage = stageWord(row.enquiryStage, row.quotePounds)
  const call = callWord(row, now)
  const stageStands = stands(row.stageAt)
  const callStands = stands(row.callAt)
  const setAside = (stageStands ? null : stage) ?? (callStands ? null : (call?.word ?? null))
  const earlier = setAside === null ? null : `${EARLIER}${setAside}`
  if (stage !== null && stageStands) {
    return { word: stage, mark: row.enquiryStage === 'won' ? 'success' : null, earlier }
  }
  if (call !== null && callStands) return { ...call, earlier }
  return { ...buildWord(row, now), earlier }
}

// A deadline today is read as its time alone, "14:37"; any other day carries its date. The London
// day and time are the two halves of formatLondon's "2 Oct 2026, 14:37", so this file never
// formats a moment on its own.
function dueAt(deadline: Date, now: Date): string {
  const [day, time] = formatLondon(deadline).split(', ')
  const [today] = formatLondon(now).split(', ')
  return day === today && time !== undefined ? time : formatLondonRelative(deadline, now)
}

// The brief page's line about the build: when the link went, or why it has not.
export function buildLine(row: Row, now: Date): string {
  if (row.emailSentAt !== null) return `Link sent ${formatLondonRelative(row.emailSentAt, now)}`
  switch (statusOf(row).status) {
    case 'building':
      return `Building, due ${dueAt(row.deadlineAt, now)}`
    case 'exhausted':
      return 'Finished, no link sent: every design already seen'
    case 'failed':
      return 'Finished, no link sent: the build failed'
    case 'ready':
    case 'partial':
      return 'Built, link on its way'
  }
}

function bookedLine(row: Row, now: Date): Readonly<{ text: string; control: CallControl }> {
  const phase = phaseOf(row, now)
  const rel = (moment: Date) => formatLondonRelative(moment, now)
  switch (phase.kind) {
    case 'passed':
      return { text: `Call was ${rel(phase.start)}. How did it go?`, control: 'no_show' }
    case 'overdue':
      return { text: `Call marked ${rel(phase.marked)}. How did it go?`, control: 'no_show' }
    case 'ahead':
    case 'untimed': {
      // Cal.com's booking is only ever not happening from here; the owner's own mark they can take
      // back. The owner's mark says when they made it, Cal.com's where it came from.
      const cal = row.callSource === 'cal'
      const by = cal
        ? ', via Cal.com'
        : row.callAt === null
          ? ''
          : `, marked by you ${rel(row.callAt)}`
      const booked = phase.kind === 'ahead' ? `Booked ${rel(phase.start)}` : 'Booked, time not set'
      return { text: `${booked}${by}.`, control: cal ? 'not_happening' : 'unbook' }
    }
  }
}

// The call panel's line and the one control beside it. The panel is the person's, so a booking
// stamped before this brief counts here whatever standingOf set aside.
export function callLine(row: Row, now: Date): Readonly<{ text: string; control: CallControl }> {
  const rel = (moment: Date) => formatLondonRelative(moment, now)
  switch (row.callState) {
    case null:
      return { text: '', control: 'book' }
    case 'cancelled': {
      const at = row.callAt === null ? '' : ` ${rel(row.callAt)}`
      const via = row.callSource === 'cal' ? ', via Cal.com' : ''
      return { text: `Cancelled${at}${via}.`, control: 'book' }
    }
    case 'no_show':
      return {
        text: row.callStartsAt === null ? 'No-show.' : `No-show, ${rel(row.callStartsAt)}.`,
        control: 'book',
      }
    case 'booked':
      return bookedLine(row, now)
  }
}

// The sweep's keep (the owner, 2 October 2026): a brief outlives CONFIG.retention.days while its
// person stands at won, or has a call booked, for keptDays after that standing was last set. The
// standing is the person's, so every brief of theirs stays; with both, the later date holds. A
// standing with no stamp gives no date, so it keeps nothing.
type Keep = Readonly<{ until: Date; reason: 'won' | 'booked' }>

function keepOf(row: Row): Keep | null {
  const { keptDays } = CONFIG.retention
  const won =
    row.enquiryStage === 'won' && row.stageAt !== null ? daysAfter(row.stageAt, keptDays) : null
  const booked =
    row.callState === 'booked' && row.callAt !== null ? daysAfter(row.callAt, keptDays) : null
  if (won !== null && (booked === null || won >= booked)) return { until: won, reason: 'won' }
  if (booked !== null) return { until: booked, reason: 'booked' }
  return null
}

export function keptUntil(row: Row): Date | null {
  return keepOf(row)?.until ?? null
}

export function isKept(row: Row, now: Date): boolean {
  const until = keptUntil(row)
  return until !== null && until > now
}

// The brief page's line about the sweep: how long the keep holds, or the day the retention days
// run out, with a word when a booked call falls after it, since Cal.com's booking outlives the
// brief.
export function sweepLine(row: Row, now: Date): string {
  const keep = keepOf(row)
  if (keep !== null && keep.until > now) {
    const why = keep.reason === 'won' ? 'while won' : 'while a call is booked'
    return `Kept until ${formatLondonRelative(keep.until, now)} ${why}`
  }
  const deleted = daysAfter(row.createdAt, CONFIG.retention.days)
  const line = `Deleted ${formatLondonRelative(deleted, now)}`
  const callAfter =
    row.callState === 'booked' && row.callStartsAt !== null && row.callStartsAt > deleted
  return callAfter ? `${line}, the call is after that; Cal.com keeps it` : line
}

// A person's newest brief, by identity: the one the page links and prints the shared note on.
// Equal stamps keep the first seen.
function newestByPerson(rows: readonly Row[]): ReadonlyMap<string, Row> {
  const newest = new Map<string, Row>()
  for (const row of rows) {
    const held = newest.get(row.identityHash)
    if (held === undefined || row.createdAt > held.createdAt) newest.set(row.identityHash, row)
  }
  return newest
}

const byTime = (a: Date, b: Date) => a.getTime() - b.getTime()

// What the top of the page asks of the owner, in the order it matters: the next call, the calls
// owed an outcome, Cal.com bookings nobody's brief claimed, and the briefs not yet opened. People,
// not briefs: the call is the person's, so each person counts once and their newest brief is the
// link. When nothing applies the page says so, rather than nothing.
export function needsYou(
  rows: readonly Row[],
  unmatched: readonly Date[],
  now: Date,
): readonly NeedsYouItem[] {
  const rel = (moment: Date) => formatLondonRelative(moment, now)
  const people = [...newestByPerson(rows).values()].sort((a, b) => byTime(b.createdAt, a.createdAt))
  const items: NeedsYouItem[] = []

  const ahead = people
    .flatMap((row) => {
      if (row.callState !== 'booked') return []
      const phase = phaseOf(row, now)
      return phase.kind === 'ahead' ? [{ row, start: phase.start }] : []
    })
    .sort((a, b) => byTime(a.start, b.start))
  const next = ahead[0]
  if (next !== undefined) {
    items.push({
      text: `Next call: ${next.row.company}, ${rel(next.start)}`,
      links: [{ label: next.row.company, slug: next.row.slug }],
    })
  }

  const owed = people.filter(
    (row) =>
      row.enquiryStage === 'open' && row.callState === 'booked' && needsOutcome(phaseOf(row, now)),
  )
  if (owed.length > 0) {
    const count = owed.length
    const verb = count === 1 ? 'call needs' : 'calls need'
    items.push({
      text: `${String(count)} ${verb} an outcome: ${owed.map((row) => row.company).join(', ')}`,
      links: owed.map((row) => ({ label: row.company, slug: row.slug })),
    })
  }

  const unclaimed = unmatched
    .filter((start) => addMinutes(start, CONFIG.call.minutes) > now)
    .sort(byTime)
  for (const start of unclaimed) {
    items.push({
      text: `A Cal.com booking for ${rel(start)} matched no brief. Open theirs and tap Mark as booked.`,
      links: [],
    })
  }

  const fresh = rows.filter((row) => row.ownerOpenedAt === null)
  if (fresh.length > 0) {
    const building = fresh.filter((row) => statusOf(row).status === 'building').length
    const still = building === 0 ? '' : `, ${String(building)} still building`
    const noun = fresh.length === 1 ? 'brief' : 'briefs'
    items.push({ text: `${String(fresh.length)} new ${noun}${still}`, links: [] })
  }

  return items.length === 0 ? [{ text: NOTHING_WAITING, links: [] }] : items
}

// The brief the owner opened last, for the caption under the heading; null until one has been.
export function lastOpened(
  rows: readonly Row[],
  now: Date,
): Readonly<{ slug: string; company: string; when: string }> | null {
  let last: Readonly<{ row: Row; at: Date }> | null = null
  for (const row of rows) {
    if (row.ownerOpenedAt !== null && (last === null || row.ownerOpenedAt > last.at)) {
      last = { row, at: row.ownerOpenedAt }
    }
  }
  if (last === null) return null
  return {
    slug: last.row.slug,
    company: last.row.company,
    when: formatLondonRelative(last.at, now),
  }
}

// The slugs that are the newest brief of their person, so the list prints the shared note once.
export function newestBriefOfPerson(rows: readonly Row[]): ReadonlySet<string> {
  return new Set([...newestByPerson(rows).values()].map((row) => row.slug))
}
