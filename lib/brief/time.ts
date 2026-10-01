// "4:58": whole minutes, then seconds padded to two digits. Rounds up so the clock shows the
// full budget at the start and never goes below zero.
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`
}

// A moment as the studio reads it, "4 Sept 2026, 14:05", in London time: the owner's notice and
// the briefs page both stamp a brief with it.
const london = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/London',
})

export function formatLondon(moment: Date): string {
  return london.format(moment)
}

// A day alone, "Thu, 8 Oct 2026", for what happens on a night rather than at a minute.
const londonDay = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/London',
})

export function formatLondonDay(moment: Date): string {
  return londonDay.format(moment)
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// London's clock field by field, for the arithmetic below: which calendar day an instant falls on
// in London, and how far the wall clock stands from UTC at that instant.
const clock = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Europe/London',
})

// The UTC instant with these calendar fields. Date.UTC reads a year under 100 as 19xx, so the
// fields are set on a date instead.
function utcOf(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): number {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, 0)
  return date.getTime()
}

// What London's wall clock shows at `moment`, as the UTC time with the same digits: 14:00 BST
// comes back as 14:00Z, to the second. Arithmetic on it is arithmetic on the wall clock, and
// taking `moment` away from it gives London's offset.
function londonWall(moment: number): number {
  const parts = clock.formatToParts(moment)
  const field = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value)
  return utcOf(
    field('year'),
    field('month'),
    field('day'),
    field('hour'),
    field('minute'),
    field('second'),
  )
}

// London's offset from UTC at `moment`, in ms: an hour in summer, nothing in winter.
function londonOffset(moment: number): number {
  return londonWall(moment) - moment
}

const timeOfDay = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Europe/London',
})

const thisYear = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Europe/London',
})

// A moment against the owner's clock, by London calendar days: "Today 14:05", "Yesterday 09:12"
// and "Tomorrow 15:00" for the days around now, "Thu 8 Oct, 15:00" for the rest of this year, and
// the full stamp, "28 Sept 2025, 10:40", once the year has to be said.
export function formatLondonRelative(moment: Date, now: Date): string {
  const wall = londonWall(moment.getTime())
  const today = londonWall(now.getTime())
  const days = Math.floor(wall / DAY) - Math.floor(today / DAY)
  if (days === 0) return `Today ${timeOfDay.format(moment)}`
  if (days === -1) return `Yesterday ${timeOfDay.format(moment)}`
  if (days === 1) return `Tomorrow ${timeOfDay.format(moment)}`
  const sameYear = new Date(wall).getUTCFullYear() === new Date(today).getUTCFullYear()
  return sameYear ? thisYear.format(moment) : formatLondon(moment)
}

// A datetime-local value, "2026-10-08T15:00", with the seconds optional.
const LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/

// The instant at which London's wall clock shows `value`, a datetime-local input's
// "YYYY-MM-DDTHH:mm" (seconds optional), or null for anything malformed or off the calendar. It
// never throws: the value comes from a form.
export function fromLondonLocal(value: string): Date | null {
  if (!LOCAL.test(value)) return null
  const full = value.length === 16 ? `${value}:00` : value
  const reading = utcOf(
    Number(full.slice(0, 4)),
    Number(full.slice(5, 7)),
    Number(full.slice(8, 10)),
    Number(full.slice(11, 13)),
    Number(full.slice(14, 16)),
    Number(full.slice(17, 19)),
  )
  // A day or time that is not on the calendar (30 February, 24:00) rolls over instead of failing,
  // so the digits are read back and must come out as they went in.
  if (new Date(reading).toISOString().slice(0, 19) !== full) return null
  // London keeps GMT or BST, so the instant lies within the hour before the wall clock read as
  // UTC, and the offset London kept at the start of that hour is the one to take off. Away from a
  // clock change it is the offset of the whole hour. When a change falls inside the hour the
  // earlier offset wins: in October's repeated hour that is BST, the first of the two instants,
  // and in March's skipped hour it is GMT, the clock as if it had not jumped.
  return new Date(reading - londonOffset(reading - HOUR))
}

// The inverse, to prefill a datetime-local input: "YYYY-MM-DDTHH:mm" in London time.
export function toLondonLocal(moment: Date): string {
  return new Date(londonWall(moment.getTime())).toISOString().slice(0, 16)
}

// The whole hour after `now`, and the one after that when `now` is on the hour: the first time a
// datetime-local input offers for a call. London's offset is a whole number of hours, so a whole
// UTC hour is a whole London hour.
export function nextWholeHour(now: Date): Date {
  return new Date(Math.floor(now.getTime() / HOUR) * HOUR + HOUR)
}

export function addMinutes(moment: Date, minutes: number): Date {
  return new Date(moment.getTime() + minutes * MINUTE)
}

// Elapsed days of 86,400,000 ms, not London calendar days: the retention and quiet-link
// thresholds measure how long something has stood, so a clock change must not move them.
export function daysAfter(moment: Date, days: number): Date {
  return new Date(moment.getTime() + days * DAY)
}
