import { describe, expect, it } from 'vitest'
import {
  buildingHeading,
  buildingLead,
  EARLY_FINISH,
  emailLine,
  headingText,
  headlinesLine,
  layoutsLine,
  openDesign,
  photosLine,
  readyHeading,
  readyLead,
  receivedLine,
  stageSaid,
  tonesLine,
} from '@/app/start/_components/done-copy'
import { lineText, waitingHeading } from '@/app/start/_components/start-copy'

// The wait's and ready's words (docs/start-page-journey-plan.md, 4.6). The first of the copy
// corpus's two passes is app/_components/copy-corpus.ts; this is the second (plan D25): names and
// addresses at their edges, restored views without them, and every count the poll can give.

const SHAPES = [
  'Ashgrove Physio and Sport Clinic for all the Runners, Riders and Walkers of Hull',
  'AshgrovePhysiotherapyAndSportsInjuryClinicsSheffieldAndLeeds',
  "Sam's",
  'Sam’s',
  'GIBBS',
  '',
]
const EMAILS = ['samantha.ashgrove-bookings.and-appointment@ashgrove-physio.co.uk', '']
const COUNTS = [1, 2, 3]
const UNFILLED = /undefined|null|NaN|\s{2}|\s[.,:?]|^\s|\s$/

describe('the done headings', () => {
  it('say what the stand-in says while the view loads', () => {
    for (const first of ['Sam', '']) {
      for (const count of COUNTS) {
        expect(headingText(buildingHeading(first, count))).toBe(waitingHeading(first, count))
      }
    }
  })

  it('end on the phrase set in the italic', () => {
    expect(buildingHeading('Sam', 3)).toEqual({
      first: 'Sam',
      rest: 'your designs are on their way.',
      payoff: 'on their way.',
    })
    expect(headingText(readyHeading('', 1))).toBe('Your design is ready.')
    expect(headingText(readyHeading('Sam', 2))).toBe('Sam, your designs are ready.')
  })
})

describe('the wait', () => {
  it('counts what the poll counts', () => {
    expect(buildingLead(2)).toBe('We are building two homepage designs from your draft.')
    expect(buildingLead(1)).toBe('We are building a homepage design from your draft.')
    expect(lineText(layoutsLine(2, 'Gibbs'))).toBe('Two layouts chosen for Gibbs.')
    expect(headlinesLine(1, 'done')).toBe('One headline written.')
    expect(stageSaid(1).layouts).toBe('One layout chosen.')
  })

  it('says the address it emails, or the one the visitor gave when the tab has lost it', () => {
    expect(lineText(emailLine(3, 'sam@gibbs.example'))).toBe(
      'We also email them to sam@gibbs.example when they are done.',
    )
    expect(lineText(emailLine(1, ''))).toBe(
      'We also email it to the address you gave when it is done.',
    )
  })

  it('names the colour, or the visitor’s own', () => {
    expect(lineText(tonesLine('Forest'))).toBe(
      'Your Forest set in 14 tones, every text colour checked for easy reading.',
    )
    expect(lineText(tonesLine(null))).toMatch(/^Your colour set in 14 tones/)
  })

  it('names the photos the build is placing', () => {
    expect(photosLine({ state: 'running', photos: 0, style: 'Warm and natural' })).toBe(
      'Finding photos for a warm and natural look',
    )
    expect(photosLine({ state: 'running', photos: 1, style: 'Dark and moody' })).toBe(
      'Placing your photo',
    )
    expect(photosLine({ state: 'running', photos: 4, style: 'Dark and moody' })).toBe(
      'Placing your four photos',
    )
  })

  it('never leaves a slot empty or unfilled', () => {
    const lines = [
      ...SHAPES.flatMap((company) => [
        receivedLine(company),
        ...COUNTS.map((count) => layoutsLine(count, company)),
      ]),
      ...EMAILS.flatMap((email) => COUNTS.map((count) => emailLine(count, email))),
      tonesLine(null),
    ].map(lineText)
    for (const line of lines) expect(line, line).not.toMatch(UNFILLED)
  })

  it('drops the name when the tab no longer has it', () => {
    expect(lineText(receivedLine(''))).toBe('Brief received.')
    expect(lineText(layoutsLine(3, ''))).toBe('Three layouts chosen.')
  })
})

describe('ready', () => {
  it('says how long the build took only when the server kept its times', () => {
    expect(readyLead(3, '1:52')).toBe(
      'Built in 1:52. Each opens in a new tab and stays live for 30 days.',
    )
    expect(readyLead(1, null)).toBe('It opens in a new tab and stays live for 30 days.')
    expect(EARLY_FINISH).toBe('Ahead of the five minutes.')
  })

  it('opens each design by its place', () => {
    expect(openDesign(0)).toBe('Open design one')
  })
})
