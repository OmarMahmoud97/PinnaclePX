import { describe, expect, it } from 'vitest'
import {
  addMinutes,
  daysAfter,
  formatCountdown,
  formatLondon,
  formatLondonDay,
  formatLondonRelative,
  fromLondonLocal,
  nextWholeHour,
  toLondonLocal,
} from '@/lib/brief/time'

describe('formatCountdown', () => {
  it('shows the full budget at the start', () => {
    expect(formatCountdown(300_000)).toBe('5:00')
  })

  it('rounds part seconds up so the clock never skips ahead', () => {
    expect(formatCountdown(299_001)).toBe('5:00')
    expect(formatCountdown(298_500)).toBe('4:59')
  })

  it('pads the seconds', () => {
    expect(formatCountdown(65_000)).toBe('1:05')
  })

  it('stops at zero', () => {
    expect(formatCountdown(0)).toBe('0:00')
    expect(formatCountdown(-5_000)).toBe('0:00')
  })
})

describe('formatLondon', () => {
  it('writes the date and the time as London reads them, in summer and in winter', () => {
    expect(formatLondon(new Date('2026-09-04T13:05:00Z'))).toBe('4 Sept 2026, 14:05')
    expect(formatLondon(new Date('2026-12-04T13:05:00Z'))).toBe('4 Dec 2026, 13:05')
  })
})

// The clocks in 2026 go forward at 01:00Z on 29 March and back at 01:00Z on 25 October.
const SUMMER = new Date('2026-07-01T13:00:00Z') // 14:00 BST
const WINTER = new Date('2026-12-01T14:00:00Z') // 14:00 GMT

// The instant a wall clock reads, for tests that know it is one.
function instantOf(value: string): Date {
  const instant = fromLondonLocal(value)
  if (instant === null) throw new Error(`${value} did not parse`)
  return instant
}

describe('formatLondonRelative', () => {
  // A Friday morning in October, still on BST.
  const now = new Date('2026-10-02T09:00:00Z')

  it('names the London day when it is within a day of now', () => {
    expect(formatLondonRelative(new Date('2026-10-02T13:05:00Z'), now)).toBe('Today 14:05')
    expect(formatLondonRelative(new Date('2026-10-01T08:12:00Z'), now)).toBe('Yesterday 09:12')
    expect(formatLondonRelative(new Date('2026-10-03T14:00:00Z'), now)).toBe('Tomorrow 15:00')
  })

  it('gives the weekday and the date within the year, and the full stamp beyond it', () => {
    expect(formatLondonRelative(new Date('2026-10-08T14:00:00Z'), now)).toBe('Thu 8 Oct, 15:00')
    expect(formatLondonRelative(new Date('2026-09-30T08:12:00Z'), now)).toBe('Wed 30 Sept, 09:12')
    expect(formatLondonRelative(new Date('2026-12-31T23:30:00Z'), now)).toBe('Thu 31 Dec, 23:30')
    expect(formatLondonRelative(new Date('2025-09-28T09:40:00Z'), now)).toBe('28 Sept 2025, 10:40')
    expect(formatLondonRelative(new Date('2027-01-02T10:00:00Z'), now)).toBe('2 Jan 2027, 10:00')
  })

  it('writes the full stamp the way formatLondon does', () => {
    const moment = new Date('2025-09-28T09:40:00Z')
    expect(formatLondonRelative(moment, now)).toBe(formatLondon(moment))
  })

  it('counts London days, not UTC days, across a summer midnight', () => {
    const noon = new Date('2026-07-01T12:00:00Z')
    expect(formatLondonRelative(new Date('2026-07-01T23:30:00Z'), noon)).toBe('Tomorrow 00:30')
    expect(formatLondonRelative(new Date('2026-07-01T22:59:00Z'), noon)).toBe('Today 23:59')
    // Half past midnight in London on 2 July is still 1 July in UTC.
    const smallHours = new Date('2026-07-01T23:30:00Z')
    expect(formatLondonRelative(new Date('2026-07-01T22:00:00Z'), smallHours)).toBe(
      'Yesterday 23:00',
    )
    expect(formatLondonRelative(new Date('2026-07-02T08:00:00Z'), smallHours)).toBe('Today 09:00')
  })

  it('keeps the winter midnight where UTC has it', () => {
    const noon = new Date('2026-12-01T12:00:00Z')
    expect(formatLondonRelative(new Date('2026-12-01T23:30:00Z'), noon)).toBe('Today 23:30')
    expect(formatLondonRelative(new Date('2026-12-02T00:05:00Z'), noon)).toBe('Tomorrow 00:05')
  })

  it('keeps its footing either side of the clocks going back', () => {
    const noon = new Date('2026-10-25T12:00:00Z')
    expect(formatLondonRelative(new Date('2026-10-24T22:30:00Z'), noon)).toBe('Yesterday 23:30')
    expect(formatLondonRelative(new Date('2026-10-24T23:30:00Z'), noon)).toBe('Today 00:30')
    // The repeated hour reads the same twice.
    expect(formatLondonRelative(new Date('2026-10-25T00:30:00Z'), noon)).toBe('Today 01:30')
    expect(formatLondonRelative(new Date('2026-10-25T01:30:00Z'), noon)).toBe('Today 01:30')
    expect(formatLondonRelative(new Date('2026-10-26T09:00:00Z'), noon)).toBe('Tomorrow 09:00')
  })

  it('keeps its footing either side of the clocks going forward', () => {
    const noon = new Date('2026-03-29T12:00:00Z')
    expect(formatLondonRelative(new Date('2026-03-28T23:30:00Z'), noon)).toBe('Yesterday 23:30')
    expect(formatLondonRelative(new Date('2026-03-29T00:30:00Z'), noon)).toBe('Today 00:30')
    expect(formatLondonRelative(new Date('2026-03-29T01:30:00Z'), noon)).toBe('Today 02:30')
    expect(formatLondonRelative(new Date('2026-03-30T08:00:00Z'), noon)).toBe('Tomorrow 09:00')
  })

  it('says yesterday or tomorrow across new year, and the year for anything further', () => {
    const newYear = new Date('2026-01-01T10:00:00Z')
    expect(formatLondonRelative(new Date('2025-12-31T23:30:00Z'), newYear)).toBe('Yesterday 23:30')
    expect(formatLondonRelative(new Date('2025-12-30T10:40:00Z'), newYear)).toBe(
      '30 Dec 2025, 10:40',
    )
    const yearEnd = new Date('2025-12-31T10:00:00Z')
    expect(formatLondonRelative(new Date('2026-01-01T10:00:00Z'), yearEnd)).toBe('Tomorrow 10:00')
    expect(formatLondonRelative(new Date('2026-01-02T10:00:00Z'), yearEnd)).toBe(
      '2 Jan 2026, 10:00',
    )
  })
})

describe('fromLondonLocal', () => {
  it('reads a London wall clock as an instant in summer and in winter', () => {
    expect(fromLondonLocal('2026-07-01T14:00')).toEqual(SUMMER)
    expect(fromLondonLocal('2026-12-01T14:00')).toEqual(WINTER)
  })

  it('takes the seconds when they are there', () => {
    expect(fromLondonLocal('2026-07-01T14:00:30')).toEqual(new Date('2026-07-01T13:00:30Z'))
    expect(fromLondonLocal('2026-12-01T00:00:00')).toEqual(new Date('2026-12-01T00:00:00Z'))
  })

  it('takes the first instant, the BST one, in the hour the clocks go back', () => {
    expect(fromLondonLocal('2026-10-25T01:00')).toEqual(new Date('2026-10-25T00:00:00Z'))
    expect(fromLondonLocal('2026-10-25T01:30')).toEqual(new Date('2026-10-25T00:30:00Z'))
    expect(fromLondonLocal('2026-10-25T01:59')).toEqual(new Date('2026-10-25T00:59:00Z'))
  })

  it('reads the minutes either side of the repeated hour once', () => {
    expect(fromLondonLocal('2026-10-25T00:59')).toEqual(new Date('2026-10-24T23:59:00Z'))
    expect(fromLondonLocal('2026-10-25T02:00')).toEqual(new Date('2026-10-25T02:00:00Z'))
    expect(fromLondonLocal('2026-10-25T02:30')).toEqual(new Date('2026-10-25T02:30:00Z'))
  })

  it('reads the hour the clocks skip as if they had not moved', () => {
    expect(fromLondonLocal('2026-03-29T01:00')).toEqual(new Date('2026-03-29T01:00:00Z'))
    expect(fromLondonLocal('2026-03-29T01:30')).toEqual(new Date('2026-03-29T01:30:00Z'))
    expect(fromLondonLocal('2026-03-29T01:59')).toEqual(new Date('2026-03-29T01:59:00Z'))
    // Which London then shows as the BST hour that followed.
    expect(toLondonLocal(instantOf('2026-03-29T01:30'))).toBe('2026-03-29T02:30')
  })

  it('reads the minutes either side of the skipped hour as they stand', () => {
    expect(fromLondonLocal('2026-03-29T00:59')).toEqual(new Date('2026-03-29T00:59:00Z'))
    expect(fromLondonLocal('2026-03-29T02:00')).toEqual(new Date('2026-03-29T01:00:00Z'))
    expect(fromLondonLocal('2026-03-29T02:30')).toEqual(new Date('2026-03-29T01:30:00Z'))
  })

  it('keeps a leap day and refuses one that is not there', () => {
    expect(fromLondonLocal('2028-02-29T10:00')).toEqual(new Date('2028-02-29T10:00:00Z'))
    expect(fromLondonLocal('2026-02-29T10:00')).toBeNull()
  })

  it.each([
    '',
    'nonsense',
    '2026-07-01',
    '14:00',
    '2026-07-01 14:00',
    '2026-7-1T14:00',
    '2026-07-01T14:00:00.000',
    '2026-07-01T14:00Z',
    ' 2026-07-01T14:00',
    '2026-07-01T14:00 ',
    '+2026-07-01T14:00',
  ])('returns null for the malformed %j', (value) => {
    expect(fromLondonLocal(value)).toBeNull()
  })

  it.each([
    '2026-00-10T10:00',
    '2026-13-01T10:00',
    '2026-07-00T10:00',
    '2026-07-32T10:00',
    '2026-02-30T10:00',
    '2026-04-31T10:00',
    '2026-07-01T24:00',
    '2026-07-01T14:60',
    '2026-07-01T14:00:60',
  ])('returns null for the off-calendar %s', (value) => {
    expect(fromLondonLocal(value)).toBeNull()
  })
})

describe('toLondonLocal', () => {
  it('writes the London wall clock for a datetime-local input', () => {
    expect(toLondonLocal(SUMMER)).toBe('2026-07-01T14:00')
    expect(toLondonLocal(new Date('2026-12-01T14:05:00Z'))).toBe('2026-12-01T14:05')
  })

  it('pads midnight and moves to the London date past a summer midnight', () => {
    expect(toLondonLocal(new Date('2026-12-01T00:05:00Z'))).toBe('2026-12-01T00:05')
    expect(toLondonLocal(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-02T00:30')
  })

  it('drops the seconds', () => {
    expect(toLondonLocal(new Date('2026-07-01T13:00:45.500Z'))).toBe('2026-07-01T14:00')
  })

  it.each([
    '2026-07-01T13:00:00Z',
    '2026-12-01T14:05:00Z',
    '2026-03-29T00:59:00Z',
    '2026-03-29T01:00:00Z',
    '2026-10-24T23:59:00Z',
    '2026-10-25T02:00:00Z',
    '2025-12-31T23:30:00Z',
  ])('round-trips %s through fromLondonLocal', (iso) => {
    const moment = new Date(iso)
    expect(fromLondonLocal(toLondonLocal(moment))).toEqual(moment)
  })

  it.each(['2026-07-01T14:00', '2026-12-01T09:05', '2026-03-29T02:00', '2026-10-25T02:00'])(
    'round-trips %s through both',
    (value) => {
      expect(toLondonLocal(instantOf(value))).toBe(value)
    },
  )

  it('round-trips the first instant of the repeated hour and folds the second onto it', () => {
    const first = new Date('2026-10-25T00:30:00Z')
    const second = new Date('2026-10-25T01:30:00Z')
    expect(toLondonLocal(first)).toBe('2026-10-25T01:30')
    expect(toLondonLocal(second)).toBe('2026-10-25T01:30')
    expect(fromLondonLocal(toLondonLocal(first))).toEqual(first)
    expect(fromLondonLocal(toLondonLocal(second))).toEqual(first)
  })
})

describe('nextWholeHour', () => {
  it('moves to the top of the next hour', () => {
    const top = new Date('2026-07-01T14:00:00Z')
    expect(nextWholeHour(new Date('2026-07-01T13:25:10.500Z'))).toEqual(top)
    expect(nextWholeHour(new Date('2026-07-01T13:59:59.999Z'))).toEqual(top)
    expect(nextWholeHour(new Date('2026-07-01T13:00:00.001Z'))).toEqual(top)
  })

  it('goes to the following hour when now is on the hour', () => {
    expect(nextWholeHour(SUMMER)).toEqual(new Date('2026-07-01T14:00:00Z'))
    expect(nextWholeHour(WINTER)).toEqual(new Date('2026-12-01T15:00:00Z'))
  })

  it('crosses midnight and lands on a whole London hour in summer and in winter', () => {
    const summerNight = nextWholeHour(new Date('2026-07-01T23:30:00Z'))
    expect(summerNight).toEqual(new Date('2026-07-02T00:00:00Z'))
    expect(toLondonLocal(summerNight)).toBe('2026-07-02T01:00')
    expect(toLondonLocal(nextWholeHour(new Date('2026-12-01T23:30:00Z')))).toBe('2026-12-02T00:00')
  })

  it('leaves now untouched', () => {
    const now = new Date('2026-07-01T13:25:00Z')
    nextWholeHour(now)
    expect(now).toEqual(new Date('2026-07-01T13:25:00Z'))
  })
})

describe('addMinutes', () => {
  it('adds the minutes', () => {
    expect(addMinutes(SUMMER, 20)).toEqual(new Date('2026-07-01T13:20:00Z'))
    expect(addMinutes(WINTER, 90)).toEqual(new Date('2026-12-01T15:30:00Z'))
  })

  it('takes minutes away when they are negative', () => {
    expect(addMinutes(SUMMER, -30)).toEqual(new Date('2026-07-01T12:30:00Z'))
  })

  it('returns a new date and leaves the moment untouched', () => {
    const moment = new Date('2026-07-01T13:00:00Z')
    const same = addMinutes(moment, 0)
    expect(same).toEqual(moment)
    expect(same).not.toBe(moment)
    addMinutes(moment, 20)
    expect(moment).toEqual(new Date('2026-07-01T13:00:00Z'))
  })
})

describe('daysAfter', () => {
  it('adds whole days of elapsed time', () => {
    expect(daysAfter(new Date('2026-09-04T13:05:00Z'), 30)).toEqual(
      new Date('2026-10-04T13:05:00Z'),
    )
    expect(daysAfter(new Date('2026-09-04T13:05:00Z'), 180)).toEqual(
      new Date('2027-03-03T13:05:00Z'),
    )
  })

  it('counts 86,400,000 ms a day across a clock change, so the London hour moves', () => {
    const eve = new Date('2026-10-24T12:00:00Z') // 13:00 BST
    const next = daysAfter(eve, 1)
    expect(next.getTime() - eve.getTime()).toBe(86_400_000)
    expect(toLondonLocal(eve)).toBe('2026-10-24T13:00')
    expect(toLondonLocal(next)).toBe('2026-10-25T12:00')
  })

  it('goes back for negative days and returns a new date for none', () => {
    expect(daysAfter(SUMMER, -7)).toEqual(new Date('2026-06-24T13:00:00Z'))
    const moment = new Date('2026-07-01T13:00:00Z')
    expect(daysAfter(moment, 0)).toEqual(moment)
    expect(daysAfter(moment, 0)).not.toBe(moment)
  })
})

describe('formatLondonDay', () => {
  it('names the London day alone, with its weekday and year', () => {
    expect(formatLondonDay(new Date('2026-10-08T13:05:00Z'))).toBe('Thu, 8 Oct 2026')
    expect(formatLondonDay(new Date('2026-07-31T23:30:00Z'))).toBe('Sat, 1 Aug 2026')
  })
})
