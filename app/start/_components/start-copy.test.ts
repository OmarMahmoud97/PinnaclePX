import { describe, expect, it } from 'vitest'
import {
  clauseOf,
  doneTitle,
  type HandOff,
  lineText,
  meterShare,
  meterWords,
  type Notice,
  QUESTIONS,
  questionTitle,
  receiptsFor,
  SEND_LIMIT,
  SEND_PICTURE_FAILED,
  waitingHeading,
} from '@/app/start/_components/start-copy'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'

const SENTENCE =
  'Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab and same-week appointments.'

const ANSWERED: Answers = {
  ...BLANK_ANSWERS,
  description: SENTENCE,
  company: 'Gibbs',
  name: 'Sam',
  email: 'sam@gibbs.example',
}

// Every line a question shows about the answers: its helper and each receipt, for every way a
// visit can begin and every notice.
function linesFor(answers: Answers): string[] {
  const handOffs: readonly HandOff[] = ['none', 'sentence', 'short']
  const notices: readonly (Notice | null)[] = [null, 'expired', 'notFound', 'pending']
  return QUESTION_IDS.flatMap((id) => [
    lineText(QUESTIONS[id].helper(answers)),
    ...handOffs.flatMap((handOff) =>
      notices.flatMap((notice) =>
        receiptsFor(id, { answers, handOff, notice }).map((receipt) => lineText(receipt.line)),
      ),
    ),
  ])
}

describe('the questions', () => {
  it('set their payoff word in the title', () => {
    for (const id of QUESTION_IDS) {
      const { title, emphasis } = QUESTIONS[id]
      expect(title.split(/\W+/)).toContain(emphasis)
    }
  })

  it('name each tab by its place and its title', () => {
    expect(questionTitle('describe')).toBe('1 of 5: Start with a sentence | PinnaclePX')
    expect(questionTitle('details')).toBe('5 of 5: Where should we send them | PinnaclePX')
  })

  it('ask for the next step by name, and send from the last', () => {
    expect(QUESTION_IDS.map((id) => QUESTIONS[id].ask)).toEqual([
      'Next: your name',
      'Next: pick a look',
      'Next: choose a colour',
      'Next: one last step',
      'Show me my three designs',
    ])
  })
})

describe('receiptsFor', () => {
  it('echoes the first sentence at question two, with the way back to it', () => {
    const [clause, ...rest] = receiptsFor('brand', {
      answers: ANSWERED,
      handOff: 'none',
      notice: null,
    })
    expect(rest).toEqual([])
    expect(clause).toMatchObject({ place: 'tall-desk', change: true })
    expect(clause && lineText(clause.line)).toBe(
      'Your sentence is in: “Physiotherapy clinic in Sheffield.”',
    )
  })

  it('keeps the hero hand-off at every size: the echo on any desk, shorter below it', () => {
    const places = receiptsFor('brand', {
      answers: ANSWERED,
      handOff: 'sentence',
      notice: null,
    }).map((receipt) => [receipt.place, lineText(receipt.line), receipt.change])
    expect(places).toEqual([
      ['desk', 'Your sentence is in: “Physiotherapy clinic in Sheffield.”', true],
      ['narrow', 'Your sentence is in.', true],
    ])
  })

  it('says a short hand-off needs a little more, and a fresh arrival nothing', () => {
    const at = (handOff: HandOff) =>
      receiptsFor('describe', { answers: BLANK_ANSWERS, handOff, notice: null })
    expect(at('none')).toEqual([])
    expect(at('short').map((receipt) => receipt.place)).toEqual(['everywhere'])
  })

  // Once the sentence is long enough the meter says so, and coming back to it by Back or
  // "Change it" finds nothing left to add.
  it('lets the short hand-off go once the sentence is long enough', () => {
    expect(receiptsFor('describe', { answers: ANSWERED, handOff: 'short', notice: null })).toEqual(
      [],
    )
  })

  it('names what the last answer set', () => {
    const at = (id: 'imagery' | 'colours' | 'details', answers: Answers) =>
      receiptsFor(id, { answers, handOff: 'none', notice: null }).map((receipt) =>
        lineText(receipt.line),
      )
    expect(at('imagery', ANSWERED)).toEqual(['Gibbs is on the page.'])
    const withLogo: Answers = {
      ...ANSWERED,
      logo: { kind: 'file', id: 'l1', fileName: 'logo.png', url: null },
    }
    expect(at('imagery', withLogo)).toEqual(['Gibbs and your logo are on the page.'])
    expect(at('colours', ANSWERED)).toEqual(['Clean and minimal it is.'])
    expect(at('details', ANSWERED)).toEqual(['Forest it is. Your draft is finished.'])
    const custom: Answers = { ...ANSWERED, colours: { kind: 'custom', hex: '#339906' } }
    expect(at('details', custom)).toEqual(['Your colour is in. Your draft is finished.'])
  })

  it('lets a notice speak in place of the receipt, as news', () => {
    const [notice, ...rest] = receiptsFor('details', {
      answers: ANSWERED,
      handOff: 'none',
      notice: 'pending',
    })
    expect(rest).toEqual([])
    expect(notice).toMatchObject({ place: 'everywhere', news: true })
  })
})

describe('clauseOf', () => {
  it('echoes the first sentence whole when it fits', () => {
    expect(clauseOf(SENTENCE)).toBe('Physiotherapy clinic in Sheffield.')
  })

  it('cuts a long first sentence at a word, with an ellipsis', () => {
    const clause = clauseOf('Plumber in Leeds, 24-hour call-outs and boiler servicing for homes')
    expect(clause).toBe('Plumber in Leeds, 24-hour call-outs and…')
    expect(Array.from(clause).length).toBeLessThanOrEqual(CONFIG.start.names.clauseMax + 1)
  })

  it('cuts a word with no break in it where it must', () => {
    const clause = clauseOf('x'.repeat(60))
    expect(clause).toBe(`${'x'.repeat(CONFIG.start.names.clauseMax)}…`)
  })

  it('reads through an abbreviation rather than stopping at it', () => {
    expect(clauseOf('Dr. Patel dental practice in Leeds. Check-ups and hygiene.')).toBe(
      'Dr. Patel dental practice in Leeds.',
    )
    expect(clauseOf('St. Albans bakery. Sourdough, cakes and coffee.')).toBe('St. Albans bakery.')
  })

  it('takes the text whole, cut to fit, when no sentence ends past a word or two', () => {
    expect(clauseOf('Plumber. Leeds')).toBe('Plumber. Leeds')
  })
})

describe('the meter', () => {
  it('counts up to a sentence long enough, then says so', () => {
    expect(meterWords('')).toBe('Aim for a sentence or two.')
    expect(meterWords('a'.repeat(CONFIG.form.minChars - 12))).toBe('12 more to go.')
    expect(meterWords('a'.repeat(CONFIG.form.minChars - 1))).toBe('1 more to go.')
    expect(meterWords(SENTENCE)).toBe('That is plenty to start from.')
  })

  it('counts what is left near the limit', () => {
    const { maxChars } = CONFIG.form
    expect(meterWords('a'.repeat(maxChars - CONFIG.start.meter.countdownChars))).toBe(
      `${String(CONFIG.start.meter.countdownChars)} characters left.`,
    )
    expect(meterWords('a'.repeat(maxChars - 1))).toBe('1 character left.')
  })

  it('fills as the sentence nears the minimum', () => {
    expect(meterShare('')).toBe(0)
    expect(meterShare('a'.repeat(CONFIG.form.minChars / 2))).toBe(0.5)
    expect(meterShare(SENTENCE)).toBe(1)
  })
})

// The second of the copy corpus's two passes (plan D25): the shapes a name really takes, for the
// possessives and for any slot left empty or unfilled. The first pass, one-word samples for the
// word limit and the banned words, is app/_components/copy-corpus.ts.
describe('the questions with names at their edges', () => {
  const SHAPES = [
    // The longest business name the schema takes, 80 characters in 14 words.
    'Ashgrove Physio and Sport Clinic for all the Runners, Riders and Walkers of Hull',
    'AshgrovePhysiotherapyAndSportsInjuryClinicsSheffieldAndLeeds',
    "Sam's",
    'Sam’s',
    'GIBBS',
  ]

  it('never leaves a slot empty or unfilled', () => {
    for (const company of SHAPES) {
      for (const line of linesFor({ ...ANSWERED, company })) {
        expect(line, line).not.toMatch(/undefined|null|NaN|\s{2}|\s[.,:?]|“”|^\s|\s$/)
      }
    }
  })

  it('takes a possessive once, whatever the name ends in', () => {
    const helper = (company: string) => lineText(QUESTIONS.imagery.helper({ ...ANSWERED, company }))
    expect(helper("Sam's")).toBe("Sam's type and photos follow it. Try each one.")
    expect(helper('Sam’s')).toBe('Sam’s type and photos follow it. Try each one.')
    expect(helper('GIBBS')).toBe("GIBBS' type and photos follow it. Try each one.")
    expect(helper('Gibbs Plumbing')).toBe(
      "Gibbs Plumbing's type and photos follow it. Try each one.",
    )
    expect(lineText(QUESTIONS.details.helper(BLANK_ANSWERS))).toBe(
      'Your three designs are about five minutes away.',
    )
  })

  it('sends the visitor back to the question a failed picture belongs to', () => {
    expect(SEND_PICTURE_FAILED.logo).toContain('question two')
    expect(SEND_PICTURE_FAILED.photos).toContain('question three')
  })
})

function status(kind: 'building' | 'ready' | 'partial' | 'failed', conceptCount = 3) {
  const answer: SubmissionStatus = {
    status: kind,
    slug: 'abcdefghjkmn',
    deadlineAt: '2026-09-24T10:05:00.000Z',
    conceptCount,
    concepts: [],
  }
  return answer
}

describe('doneTitle', () => {
  it('says the designs are building until the first answer, and while they build', () => {
    expect(doneTitle(undefined)).toBe('Building your designs | PinnaclePX')
    expect(doneTitle(status('building'))).toBe('Building your designs | PinnaclePX')
  })

  it('turns at ready, counting what the poll counts', () => {
    expect(doneTitle(status('ready'))).toBe('Ready: your three designs | PinnaclePX')
    expect(doneTitle(status('partial', 2))).toBe('Ready: your two designs | PinnaclePX')
    expect(doneTitle(status('ready', 1))).toBe('Ready: your design | PinnaclePX')
  })

  it('leaves the route its own title when nothing was built', () => {
    expect(doneTitle(status('failed'))).toBeNull()
    expect(doneTitle({ status: 'missing' })).toBeNull()
  })
})

describe('waitingHeading', () => {
  it('greets by first name when this tab has one', () => {
    expect(waitingHeading('Sam', 3)).toBe('Sam, your designs are on their way.')
    expect(waitingHeading('', 3)).toBe('Your designs are on their way.')
  })

  it('counts as the done view counts, and is plural until the count is known', () => {
    expect(waitingHeading('Sam', 1)).toBe('Sam, your design is on its way.')
    expect(waitingHeading('', 1)).toBe('Your design is on its way.')
    expect(waitingHeading('', null)).toBe('Your designs are on their way.')
  })
})

describe('SEND_LIMIT', () => {
  it('names the server limit in words', () => {
    expect(SEND_LIMIT).toBe('You can send three briefs a day.')
  })
})
