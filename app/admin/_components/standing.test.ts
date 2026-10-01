import {
  buildLine,
  callLine,
  isKept,
  keptUntil,
  lastOpened,
  needsYou,
  newestBriefOfPerson,
  standingOf,
  sweepLine,
} from '@/app/admin/_components/standing'
import { daysAfter, formatLondonRelative, formatLondonDay } from '@/lib/brief/time'
import { CONFIG } from '@/lib/config'
import type { BriefOverviewRow } from '@/lib/db/briefs'

// Friday 2 October 2026, 14:00 in London (BST): the one clock every rule reads here.
const NOW = new Date('2026-10-02T13:00:00Z')
const CREATED = new Date('2026-09-30T13:05:00Z') // Wed 30 Sept, 14:05
const SENT = new Date('2026-09-30T13:09:00Z') // Wed 30 Sept, 14:09
const START = new Date('2026-10-02T14:00:00Z') // Fri 2 Oct, 15:00, an hour ahead of NOW
const MARKED = new Date('2026-10-01T17:20:00Z') // Thu 1 Oct, 18:20
const SLUG = 'k7m2p9x4w3hd'
const PERSON = 'a'.repeat(64)
const DAY_MS = 86_400_000

const minutesAfter = (moment: Date, minutes: number) =>
  new Date(moment.getTime() + minutes * 60_000)
const daysBefore = (moment: Date, days: number) => new Date(moment.getTime() - days * DAY_MS)
const rel = (moment: Date) => formatLondonRelative(moment, NOW)

// One row of brief_overview with every column: a sent brief of an open enquiry with no call,
// overridden per test.
function rowOf(over: Partial<BriefOverviewRow> = {}): BriefOverviewRow {
  return {
    createdAt: CREATED,
    slug: SLUG,
    identityHash: PERSON,
    name: 'Sam Carter',
    email: 'sam@ashgrove.example',
    company: 'Ashgrove Physio',
    description: 'A physiotherapy clinic in Sheffield for runners and lifters.',
    logoFile: 'ashgrove.svg',
    logoUrl: 'https://blob.example/ashgrove.svg',
    look: 'warm',
    photoUrls: ['https://blob.example/one.jpg'],
    colour: 'forest',
    templateIds: ['t01-aurora', 't05-ember', 't07-summit'],
    designPaths: [
      `/preview/${SLUG}/t01-aurora`,
      `/preview/${SLUG}/t05-ember`,
      `/preview/${SLUG}/t07-summit`,
    ],
    emailSentAt: SENT,
    settledAt: SENT,
    conceptCount: 3,
    deadlineAt: new Date('2026-09-30T13:10:00Z'),
    stageSelect: 'done',
    stageTokens: 'done',
    stageBrief: 'done',
    stageCopy: 'done',
    stageImagery: 'done',
    ownerOpenedAt: null,
    enquiryStage: 'open',
    quotePounds: null,
    stageAt: null,
    note: '',
    noteAt: null,
    callState: null,
    callSource: null,
    callStartsAt: null,
    callEndsAt: null,
    callAt: null,
    ...over,
  }
}

// A Cal.com booking recorded Thu 1 Oct, 18:20 for Fri 2 Oct, 15:00.
const booked = (over: Partial<BriefOverviewRow> = {}) =>
  rowOf({
    callState: 'booked',
    callSource: 'cal',
    callStartsAt: START,
    callEndsAt: minutesAfter(START, CONFIG.call.minutes),
    callAt: MARKED,
    ...over,
  })

// A build still running, due Fri 2 Oct, 14:37; a build with nothing new to show; a failed one.
const BUILDING: Partial<BriefOverviewRow> = {
  emailSentAt: null,
  settledAt: null,
  templateIds: null,
  designPaths: null,
  stageCopy: 'running',
  stageImagery: 'pending',
  deadlineAt: new Date('2026-10-02T13:37:00Z'),
}
const EXHAUSTED: Partial<BriefOverviewRow> = { emailSentAt: null, templateIds: [], designPaths: [] }
const FAILED: Partial<BriefOverviewRow> = {
  emailSentAt: null,
  templateIds: null,
  designPaths: null,
  stageSelect: 'failed',
}

// A second person, whose brief is newer than Ashgrove's and has been opened.
const FERN: Partial<BriefOverviewRow> = {
  slug: 'fernbrook',
  identityHash: 'b'.repeat(64),
  company: 'Fernbrook Gardens',
  createdAt: new Date('2026-10-01T09:00:00Z'),
  ownerOpenedAt: MARKED,
}

describe('standingOf', () => {
  it('rules 1 to 3: the stage the owner recorded, with the quote in whole pounds', () => {
    const at = { stageAt: MARKED }
    expect(standingOf(rowOf({ enquiryStage: 'won', quotePounds: 1429, ...at }), NOW)).toEqual({
      word: 'Won £1,429',
      mark: 'success',
      earlier: null,
    })
    expect(standingOf(rowOf({ enquiryStage: 'won', ...at }), NOW)).toEqual({
      word: 'Won',
      mark: 'success',
      earlier: null,
    })
    expect(standingOf(rowOf({ enquiryStage: 'lost', quotePounds: 679, ...at }), NOW)).toEqual({
      word: 'Lost, quoted £679',
      mark: null,
      earlier: null,
    })
    expect(standingOf(rowOf({ enquiryStage: 'lost', ...at }), NOW)).toMatchObject({
      word: 'Lost',
      mark: null,
    })
    expect(
      standingOf(rowOf({ enquiryStage: 'quoted', quotePounds: 1429, ...at }), NOW),
    ).toMatchObject({ word: 'Quoted £1,429', mark: null })
    expect(standingOf(rowOf({ enquiryStage: 'quoted', ...at }), NOW)).toMatchObject({
      word: 'Quoted',
      mark: null,
    })
  })

  it('reads the stage before the call', () => {
    const won = booked({ enquiryStage: 'won', quotePounds: 100_000, stageAt: MARKED })
    expect(standingOf(won, NOW).word).toBe('Won £100,000')
  })

  it('rule 4: a booked call with a time ahead, held through the call itself', () => {
    expect(standingOf(booked(), NOW)).toEqual({
      word: 'Booked Today 15:00',
      mark: 'success',
      earlier: null,
    })
    const lastMinute = minutesAfter(START, CONFIG.call.minutes - 1)
    expect(standingOf(booked(), lastMinute).word).toBe('Booked Today 15:00')
    const nextWeek = booked({ callStartsAt: new Date('2026-10-08T14:00:00Z') })
    expect(standingOf(nextWeek, NOW).word).toBe('Booked Thu 8 Oct, 15:00')
  })

  it('rule 5: a call whose minutes are over, or an untimed mark past the days, needs an outcome', () => {
    const over = minutesAfter(START, CONFIG.call.minutes)
    expect(standingOf(booked(), over)).toEqual({
      word: 'Needs outcome',
      mark: 'warning',
      earlier: null,
    })
    const untimed = booked({
      createdAt: daysBefore(NOW, CONFIG.admin.untimedCallDays + 3),
      callSource: 'owner',
      callStartsAt: null,
      callEndsAt: null,
      callAt: daysBefore(NOW, CONFIG.admin.untimedCallDays),
    })
    expect(standingOf(untimed, NOW)).toMatchObject({ word: 'Needs outcome', mark: 'warning' })
  })

  it('rule 6: an untimed mark within the days is booked, as is one with no stamp to count from', () => {
    const marked = booked({ callSource: 'owner', callStartsAt: null, callEndsAt: null })
    expect(standingOf(marked, NOW)).toEqual({
      word: 'Booked, time not set',
      mark: 'success',
      earlier: null,
    })
    const justWithin = booked({
      createdAt: daysBefore(NOW, CONFIG.admin.untimedCallDays + 3),
      callSource: 'owner',
      callStartsAt: null,
      callEndsAt: null,
      callAt: minutesAfter(daysBefore(NOW, CONFIG.admin.untimedCallDays), 1),
    })
    expect(standingOf(justWithin, NOW).word).toBe('Booked, time not set')
    const unstamped = booked({
      callSource: 'owner',
      callStartsAt: null,
      callEndsAt: null,
      callAt: null,
    })
    expect(standingOf(unstamped, NOW).word).toBe('Booked, time not set')
  })

  it('rules 7 and 8: a no-show and a cancellation', () => {
    expect(standingOf(booked({ callState: 'no_show' }), NOW)).toEqual({
      word: 'No-show',
      mark: 'danger',
      earlier: null,
    })
    expect(standingOf(booked({ callState: 'cancelled' }), NOW)).toEqual({
      word: 'Cancelled',
      mark: null,
      earlier: null,
    })
  })

  it('rule 9: a link sent, and its age in whole days once it has gone quiet', () => {
    expect(standingOf(rowOf(), NOW)).toEqual({ word: 'Link sent', mark: null, earlier: null })
    const quiet = daysBefore(NOW, CONFIG.admin.quietDays)
    expect(standingOf(rowOf({ createdAt: quiet, emailSentAt: quiet }), NOW).word).toBe(
      'Link sent 7 days ago',
    )
    const twelve = daysBefore(NOW, 12)
    expect(standingOf(rowOf({ createdAt: twelve, emailSentAt: twelve }), NOW).word).toBe(
      'Link sent 12 days ago',
    )
    const twelveAndAHalf = daysBefore(NOW, 12.5)
    expect(
      standingOf(rowOf({ createdAt: twelveAndAHalf, emailSentAt: twelveAndAHalf }), NOW).word,
    ).toBe('Link sent 12 days ago')
    const almost = minutesAfter(quiet, 1)
    expect(standingOf(rowOf({ createdAt: almost, emailSentAt: almost }), NOW).word).toBe(
      'Link sent',
    )
  })

  it('rule 10: the build, when no link has gone', () => {
    expect(standingOf(rowOf(BUILDING), NOW)).toEqual({
      word: 'Building',
      mark: null,
      earlier: null,
    })
    expect(standingOf(rowOf({ emailSentAt: null }), NOW).word).toBe('No link')
    expect(standingOf(rowOf(EXHAUSTED), NOW).word).toBe('No link')
    expect(standingOf(rowOf(FAILED), NOW).word).toBe('No link')
  })

  it('sets a fact stamped before the brief aside as earlier and falls through to the build', () => {
    const before = daysBefore(CREATED, 1)
    expect(
      standingOf(rowOf({ enquiryStage: 'quoted', quotePounds: 679, stageAt: before }), NOW),
    ).toEqual({ word: 'Link sent', mark: null, earlier: 'earlier: Quoted £679' })
    expect(standingOf(booked({ callAt: before }), NOW)).toEqual({
      word: 'Link sent',
      mark: null,
      earlier: 'earlier: Booked Today 15:00',
    })
    const earlierOf = (over: Partial<BriefOverviewRow>) => standingOf(rowOf(over), NOW).earlier
    expect(earlierOf({ enquiryStage: 'won', quotePounds: 1429, stageAt: before })).toBe(
      'earlier: Won £1,429',
    )
    expect(earlierOf({ enquiryStage: 'lost', stageAt: before })).toBe('earlier: Lost')
    expect(standingOf(booked({ callState: 'no_show', callAt: before }), NOW).earlier).toBe(
      'earlier: No-show',
    )
    expect(standingOf(booked({ callState: 'cancelled', callAt: before }), NOW).earlier).toBe(
      'earlier: Cancelled',
    )
    expect(standingOf(booked(BUILDING), minutesAfter(START, CONFIG.call.minutes)).word).toBe(
      'Needs outcome',
    )
    expect(
      standingOf(booked({ ...BUILDING, callAt: before }), minutesAfter(START, CONFIG.call.minutes)),
    ).toEqual({ word: 'Building', mark: null, earlier: 'earlier: Needs outcome' })
  })

  it('lets a fact stamped at or after the brief stand, and one with no stamp, which cannot be dated', () => {
    expect(standingOf(rowOf({ enquiryStage: 'won', stageAt: CREATED }), NOW)).toMatchObject({
      word: 'Won',
      earlier: null,
    })
    expect(standingOf(rowOf({ enquiryStage: 'won', stageAt: null }), NOW)).toMatchObject({
      word: 'Won',
      earlier: null,
    })
    expect(standingOf(booked({ callAt: null }), NOW)).toMatchObject({
      word: 'Booked Today 15:00',
      earlier: null,
    })
  })

  it('shows the fact that stands and sets the other aside; with both aside the stage is kept', () => {
    const before = daysBefore(CREATED, 1)
    const stageEarlier = booked({ enquiryStage: 'quoted', quotePounds: 679, stageAt: before })
    expect(standingOf(stageEarlier, NOW)).toEqual({
      word: 'Booked Today 15:00',
      mark: 'success',
      earlier: 'earlier: Quoted £679',
    })
    const callEarlier = booked({
      enquiryStage: 'won',
      quotePounds: 1429,
      stageAt: MARKED,
      callAt: before,
    })
    expect(standingOf(callEarlier, NOW)).toEqual({
      word: 'Won £1,429',
      mark: 'success',
      earlier: 'earlier: Booked Today 15:00',
    })
    const both = booked({ enquiryStage: 'lost', stageAt: before, callAt: before })
    expect(standingOf(both, NOW)).toEqual({
      word: 'Link sent',
      mark: null,
      earlier: 'earlier: Lost',
    })
  })
})

describe('buildLine', () => {
  it('says when the link went', () => {
    expect(buildLine(rowOf(), NOW)).toBe('Link sent Wed 30 Sept, 14:09')
  })

  it('gives a build under way its deadline: the time alone today, the date on any other day', () => {
    expect(buildLine(rowOf(BUILDING), NOW)).toBe('Building, due 14:37')
    const yesterday = rowOf({ ...BUILDING, deadlineAt: new Date('2026-10-01T13:37:00Z') })
    expect(buildLine(yesterday, NOW)).toBe('Building, due Yesterday 14:37')
    // Half past midnight in London is still 2 October in UTC: the day is London's.
    const pastMidnight = rowOf({ ...BUILDING, deadlineAt: new Date('2026-10-02T23:30:00Z') })
    expect(buildLine(pastMidnight, NOW)).toBe('Building, due Tomorrow 00:30')
  })

  it('says why nothing went, or that the link is on its way', () => {
    expect(buildLine(rowOf(EXHAUSTED), NOW)).toBe(
      'Finished, no link sent: every design already seen',
    )
    expect(buildLine(rowOf(FAILED), NOW)).toBe('Finished, no link sent: the build failed')
    expect(buildLine(rowOf({ emailSentAt: null }), NOW)).toBe('Built, link on its way')
    const partial = rowOf({ emailSentAt: null, stageImagery: 'fallback' })
    expect(buildLine(partial, NOW)).toBe('Built, link on its way')
  })
})

describe('callLine', () => {
  it('offers to book when there is no call, or the last one was cancelled or missed', () => {
    expect(callLine(rowOf(), NOW)).toEqual({ text: '', control: 'book' })
    expect(callLine(booked({ callState: 'cancelled' }), NOW)).toEqual({
      text: 'Cancelled Yesterday 18:20, via Cal.com.',
      control: 'book',
    })
    const byOwner = booked({ callState: 'cancelled', callSource: 'owner' })
    expect(callLine(byOwner, NOW).text).toBe('Cancelled Yesterday 18:20.')
    expect(callLine(booked({ ...byOwner, callAt: null }), NOW).text).toBe('Cancelled.')
    expect(callLine(booked({ callState: 'no_show' }), NOW)).toEqual({
      text: 'No-show, Today 15:00.',
      control: 'book',
    })
    expect(callLine(booked({ callState: 'no_show', callStartsAt: null }), NOW).text).toBe(
      'No-show.',
    )
  })

  it('lets a Cal.com booking ahead only be marked as not happening', () => {
    expect(callLine(booked(), NOW)).toEqual({
      text: 'Booked Today 15:00, via Cal.com.',
      control: 'not_happening',
    })
    expect(callLine(booked({ callStartsAt: null, callEndsAt: null }), NOW)).toEqual({
      text: 'Booked, time not set, via Cal.com.',
      control: 'not_happening',
    })
  })

  it("says when the owner's own mark was made and lets them take it back", () => {
    expect(callLine(booked({ callSource: 'owner' }), NOW)).toEqual({
      text: 'Booked Today 15:00, marked by you Yesterday 18:20.',
      control: 'unbook',
    })
    const untimed = booked({ callSource: 'owner', callStartsAt: null, callEndsAt: null })
    expect(callLine(untimed, NOW)).toEqual({
      text: 'Booked, time not set, marked by you Yesterday 18:20.',
      control: 'unbook',
    })
    expect(callLine(booked({ callSource: 'owner', callAt: null }), NOW).text).toBe(
      'Booked Today 15:00.',
    )
  })

  it('asks how the call went once its minutes are over, or an untimed mark is past the days', () => {
    const over = minutesAfter(START, CONFIG.call.minutes)
    expect(callLine(booked(), over)).toEqual({
      text: 'Call was Today 15:00. How did it go?',
      control: 'no_show',
    })
    expect(callLine(booked({ callSource: 'owner' }), over).control).toBe('no_show')
    expect(callLine(booked(), minutesAfter(START, CONFIG.call.minutes - 1)).control).toBe(
      'not_happening',
    )
    const marked = new Date('2026-09-24T17:20:00Z') // Thu 24 Sept, 18:20, eight days before NOW
    const untimed = booked({
      callSource: 'owner',
      callStartsAt: null,
      callEndsAt: null,
      callAt: marked,
    })
    expect(callLine(untimed, NOW)).toEqual({
      text: 'Call marked Thu 24 Sept, 18:20. How did it go?',
      control: 'no_show',
    })
  })

  it("counts a booking stamped before the brief: the panel is the person's", () => {
    expect(callLine(booked({ callAt: daysBefore(CREATED, 1) }), NOW).text).toBe(
      'Booked Today 15:00, via Cal.com.',
    )
  })
})

describe('keptUntil and isKept', () => {
  const { keptDays } = CONFIG.retention

  it('keeps nothing for an open enquiry with no call', () => {
    expect(keptUntil(rowOf())).toBeNull()
    expect(isKept(rowOf(), NOW)).toBe(false)
  })

  it('keeps a won enquiry for keptDays after it was marked', () => {
    const won = rowOf({ enquiryStage: 'won', quotePounds: 1429, stageAt: MARKED })
    expect(keptUntil(won)).toEqual(daysAfter(MARKED, keptDays))
    expect(isKept(won, NOW)).toBe(true)
    const lapsed = rowOf({
      createdAt: daysBefore(NOW, keptDays + 1),
      enquiryStage: 'won',
      stageAt: daysBefore(NOW, keptDays),
    })
    expect(isKept(lapsed, NOW)).toBe(false)
    expect(isKept({ ...lapsed, stageAt: minutesAfter(daysBefore(NOW, keptDays), 1) }, NOW)).toBe(
      true,
    )
  })

  it('keeps a booked call for keptDays after it was recorded, and takes the later of the two', () => {
    expect(keptUntil(booked())).toEqual(daysAfter(MARKED, keptDays))
    expect(isKept(booked(), NOW)).toBe(true)
    const laterCall = booked({ enquiryStage: 'won', stageAt: daysBefore(MARKED, 1) })
    expect(keptUntil(laterCall)).toEqual(daysAfter(MARKED, keptDays))
    const laterWin = booked({ enquiryStage: 'won', stageAt: MARKED, callAt: daysBefore(MARKED, 1) })
    expect(keptUntil(laterWin)).toEqual(daysAfter(MARKED, keptDays))
  })

  it('gives no date to a standing with no stamp, nor to a quote, a loss, a cancellation or a no-show', () => {
    expect(keptUntil(rowOf({ enquiryStage: 'won' }))).toBeNull()
    expect(keptUntil(booked({ callAt: null }))).toBeNull()
    expect(
      keptUntil(rowOf({ enquiryStage: 'quoted', quotePounds: 679, stageAt: MARKED })),
    ).toBeNull()
    expect(keptUntil(rowOf({ enquiryStage: 'lost', stageAt: MARKED }))).toBeNull()
    expect(keptUntil(booked({ callState: 'cancelled' }))).toBeNull()
    expect(keptUntil(booked({ callState: 'no_show' }))).toBeNull()
  })
})

describe('sweepLine', () => {
  const { keptDays, days } = CONFIG.retention
  const night = (moment: Date) => formatLondonDay(moment)

  it('says how long the keep holds and why, by the night it ends', () => {
    const until = night(daysAfter(MARKED, keptDays))
    expect(sweepLine(rowOf({ enquiryStage: 'won', stageAt: MARKED }), NOW)).toBe(
      `Kept until the night of ${until}, six months after the win`,
    )
    expect(sweepLine(booked(), NOW)).toBe(
      `Kept until the night of ${until}, six months after the booking`,
    )
  })

  it('names the night the retention days run out, once no keep holds', () => {
    expect(sweepLine(rowOf(), NOW)).toBe(`Goes on the night of ${night(daysAfter(CREATED, days))}`)
    const created = daysBefore(NOW, keptDays + 1)
    const lapsed = rowOf({
      createdAt: created,
      enquiryStage: 'won',
      stageAt: daysBefore(NOW, keptDays),
    })
    expect(sweepLine(lapsed, NOW)).toBe(`Goes on the night of ${night(daysAfter(created, days))}`)
  })

  it('adds that a booked call falls after the deletion, since Cal.com keeps it', () => {
    // Recorded keptDays ago, so the keep has run out, for a start still ahead of NOW.
    const created = daysBefore(NOW, keptDays + 10)
    const deleted = night(daysAfter(created, days))
    const stale = booked({ createdAt: created, callAt: daysBefore(NOW, keptDays) })
    expect(sweepLine(stale, NOW)).toBe(
      `Goes on the night of ${deleted}, the call is after that; Cal.com keeps it`,
    )
    const early = booked({ ...stale, callStartsAt: minutesAfter(created, 60) })
    expect(sweepLine(early, NOW)).toBe(`Goes on the night of ${deleted}`)
  })
})

describe('needsYou', () => {
  const NOTHING = [{ text: 'Nothing waiting for you.', links: [] }]

  it('says so when nothing applies', () => {
    expect(needsYou([], [], NOW)).toEqual(NOTHING)
    expect(needsYou([rowOf({ ownerOpenedAt: MARKED })], [], NOW)).toEqual(NOTHING)
  })

  it("names the soonest call still ahead, linking that person's newest brief", () => {
    const soon = new Date('2026-10-02T13:30:00Z') // Fri 2 Oct, 14:30
    const rows = [
      booked({ ownerOpenedAt: MARKED }),
      booked({ slug: 'ashgrove-old', createdAt: daysBefore(CREATED, 10), ownerOpenedAt: MARKED }),
      booked({ ...FERN, callStartsAt: soon, callEndsAt: minutesAfter(soon, CONFIG.call.minutes) }),
    ]
    expect(needsYou(rows, [], NOW)).toEqual([
      {
        text: 'Next call: Fernbrook Gardens, Today 14:30',
        links: [{ label: 'Fernbrook Gardens', slug: 'fernbrook' }],
      },
    ])
    // Fernbrook's call over, Ashgrove's under way: a call counts until its minutes are up.
    const during = minutesAfter(START, 5)
    expect(needsYou(rows, [], during)[0]).toEqual({
      text: 'Next call: Ashgrove Physio, Today 15:00',
      links: [{ label: 'Ashgrove Physio', slug: SLUG }],
    })
    const [older, newer] = [rows[1], rows[0]]
    expect(needsYou([older ?? rowOf(), newer ?? rowOf()], [], NOW)[0]?.links).toEqual([
      { label: 'Ashgrove Physio', slug: SLUG },
    ])
  })

  it('counts the calls owed an outcome, one per person, for open enquiries only', () => {
    const over = minutesAfter(START, CONFIG.call.minutes)
    const rows = [
      booked({ ownerOpenedAt: MARKED }),
      booked({ slug: 'ashgrove-old', createdAt: daysBefore(CREATED, 10), ownerOpenedAt: MARKED }),
      booked(FERN),
      booked({
        slug: 'hired',
        identityHash: 'c'.repeat(64),
        company: 'Hired Co',
        enquiryStage: 'won',
        stageAt: MARKED,
        ownerOpenedAt: MARKED,
      }),
    ]
    expect(needsYou(rows, [], over)).toEqual([
      {
        text: '2 calls need an outcome: Fernbrook Gardens, Ashgrove Physio',
        links: [
          { label: 'Fernbrook Gardens', slug: 'fernbrook' },
          { label: 'Ashgrove Physio', slug: SLUG },
        ],
      },
    ])
    expect(needsYou([booked({ ownerOpenedAt: MARKED })], [], over)[0]?.text).toBe(
      '1 call needs an outcome: Ashgrove Physio',
    )
    const untimed = booked({
      ownerOpenedAt: MARKED,
      callSource: 'owner',
      callStartsAt: null,
      callEndsAt: null,
      callAt: daysBefore(NOW, CONFIG.admin.untimedCallDays),
    })
    expect(needsYou([untimed], [], NOW)[0]?.text).toBe('1 call needs an outcome: Ashgrove Physio')
  })

  it('reports each Cal.com booking that matched no brief while it is still ahead, soonest first', () => {
    const later = new Date('2026-10-03T09:00:00Z') // Sat 3 Oct, 10:00
    const underWay = minutesAfter(NOW, 1 - CONFIG.call.minutes)
    const over = minutesAfter(NOW, -CONFIG.call.minutes)
    const items = needsYou([rowOf({ ownerOpenedAt: MARKED })], [later, START, over, underWay], NOW)
    expect(items.map((item) => item.text)).toEqual([
      `A Cal.com booking for ${rel(underWay)} matched no brief. Open theirs and tap Mark as booked.`,
      'A Cal.com booking for Today 15:00 matched no brief. Open theirs and tap Mark as booked.',
      'A Cal.com booking for Tomorrow 10:00 matched no brief. Open theirs and tap Mark as booked.',
    ])
    expect(items.every((item) => item.links.length === 0)).toBe(true)
  })

  it('counts the briefs not yet opened, and those still building', () => {
    const rows = [
      rowOf(),
      rowOf({ ...BUILDING, slug: 'building', identityHash: 'b'.repeat(64) }),
      rowOf({ slug: 'unopened', identityHash: 'c'.repeat(64) }),
      rowOf({ slug: 'opened', identityHash: 'd'.repeat(64), ownerOpenedAt: MARKED }),
    ]
    expect(needsYou(rows, [], NOW)).toEqual([{ text: '3 new briefs, 1 still building', links: [] }])
    expect(needsYou([rowOf()], [], NOW)).toEqual([{ text: '1 new brief', links: [] }])
    expect(needsYou([rowOf(BUILDING)], [], NOW)).toEqual([
      { text: '1 new brief, 1 still building', links: [] },
    ])
  })

  it('orders the items: the next call, outcomes owed, unclaimed bookings, new briefs', () => {
    const over = minutesAfter(START, CONFIG.call.minutes) // Ashgrove's call is over
    const soon = minutesAfter(over, 60)
    const unclaimed = minutesAfter(over, 120)
    const rows = [
      booked(),
      booked({
        ...FERN,
        ownerOpenedAt: null,
        callStartsAt: soon,
        callEndsAt: minutesAfter(soon, CONFIG.call.minutes),
      }),
    ]
    expect(needsYou(rows, [unclaimed], over).map((item) => item.text)).toEqual([
      `Next call: Fernbrook Gardens, ${formatLondonRelative(soon, over)}`,
      '1 call needs an outcome: Ashgrove Physio',
      `A Cal.com booking for ${formatLondonRelative(unclaimed, over)} matched no brief. Open theirs and tap Mark as booked.`,
      '2 new briefs',
    ])
  })
})

describe('lastOpened', () => {
  it('is null until a brief has been opened', () => {
    expect(lastOpened([], NOW)).toBeNull()
    expect(lastOpened([rowOf()], NOW)).toBeNull()
  })

  it('names the brief opened last', () => {
    const rows = [
      rowOf({ ownerOpenedAt: daysBefore(NOW, 1) }),
      rowOf(FERN),
      rowOf({ slug: 'never', identityHash: 'c'.repeat(64) }),
    ]
    expect(lastOpened(rows, NOW)).toEqual({
      slug: 'fernbrook',
      company: 'Fernbrook Gardens',
      when: 'Yesterday 18:20',
    })
    expect(lastOpened([...rows].reverse(), NOW)?.slug).toBe('fernbrook')
  })
})

describe('newestBriefOfPerson', () => {
  it('picks the newest brief of each person whatever the order', () => {
    const rows = [rowOf({ slug: 'old', createdAt: daysBefore(CREATED, 10) }), rowOf(), rowOf(FERN)]
    expect(newestBriefOfPerson(rows)).toEqual(new Set([SLUG, 'fernbrook']))
    expect(newestBriefOfPerson([...rows].reverse())).toEqual(new Set([SLUG, 'fernbrook']))
    expect(newestBriefOfPerson([])).toEqual(new Set())
  })
})
