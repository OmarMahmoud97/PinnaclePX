import { DONE_LINES, type Line } from '@/app/start/_components/start-copy'
import { CONFIG } from '@/lib/config'
import { capitalise, numberWord } from '@/lib/site'
import { TOKEN_NAMES } from '@/lib/tokens/types'

// The words of the wait and of ready (docs/start-page-journey-plan.md, 4.6 and D25): the heading
// and its payoff, the lead, the time, the build's log, the intermission, ready's lead and the call
// after an open, the partial notes, the lines the status says once each, and the studio bar's way
// back. The done view, the hub and the studio bar read them from here, and the copy tests read
// every one without React (app/_components/copy-corpus.ts, done-copy.test.ts). Lines that hold a
// name or an address are a `Line`, so the page can isolate it (<bdi>) wherever it is shown (7.7).
// Every count follows the poll's conceptCount, so a build of two says "two" throughout.

function plain(text: string): Line {
  return { before: text, echo: '', after: '' }
}

// A line about the visitor's business, which drops the name when the tab no longer has it: a
// done view opened from a pasted link or another tab.
function forCompany(before: string, company: string, withoutName: string): Line {
  return company === '' ? plain(withoutName) : { before, echo: company, after: '.' }
}

function designsWord(count: number): string {
  return count === 1 ? 'design' : 'designs'
}

// The heading, whose closing phrase is set in the serif italic (plan 5.2): the first name when the
// tab has it, the plain form when it does not.
type DoneHeading = Readonly<{ first: string; rest: string; payoff: string }>

function heading(first: string, words: string, payoff: string): DoneHeading {
  const rest = `${words} ${payoff}`
  return first === '' ? { first, rest: capitalise(rest), payoff } : { first, rest, payoff }
}

export function headingText({ first, rest }: DoneHeading): string {
  return first === '' ? rest : `${first}, ${rest}`
}

// "your designs are", or "your design is" for a build of one.
function yourDesigns(count: number): string {
  return `your ${designsWord(count)} ${count === 1 ? 'is' : 'are'}`
}

// "Sam, your designs are on their way." The same words as waitingHeading, which the done view's
// stand-in shows while its chunk loads (done-copy.test.ts holds the two together).
export function buildingHeading(first: string, count: number): DoneHeading {
  return heading(first, yourDesigns(count), count === 1 ? 'on its way.' : 'on their way.')
}

// "Sam, your designs are ready."
export function readyHeading(first: string, count: number): DoneHeading {
  return heading(first, yourDesigns(count), 'ready.')
}

// The lead while the designs are built. The page link's promise joins it once the hub polls, and
// the email line is said last, with the visitor's address or, restored, without it.
export function buildingLead(count: number): string {
  const designs = count === 1 ? 'a homepage design' : `${numberWord(count)} homepage designs`
  return `We are building ${designs} from your draft.`
}

export const PAGE_LINK_LIVE = `Your page link works now and stays live for ${String(CONFIG.retention.days)} days.`

export function emailLine(count: number, email: string): Line {
  const one = count === 1
  return {
    before: `We also email ${one ? 'it' : 'them'} to `,
    echo: email === '' ? DONE_LINES.restoredAddress : email,
    after: ` when ${one ? 'it is' : 'they are'} done.`,
  }
}

// When the designs usually land, from the build's own clock, "14:32".
export function usuallyDoneBy(time: string): string {
  return `Usually done by ${time}.`
}

export const SHARE_WORDS = {
  share: 'Share this page',
  // Said by the status line when the browser cannot share and the link is copied instead.
  copied: 'Link ready to paste.',
} as const

// The ring's centre, which the screen reader never hears: how many stages have landed.
export function ringCentre(landed: number, stages: number): string {
  return `${String(landed)} of ${String(stages)}`
}

// The build's log, one line per stage, each true of what the pipeline does (plan 4.6). A line that
// names the business drops the name when the tab no longer has it.
export function receivedLine(company: string): Line {
  return forCompany('Brief received for ', company, 'Brief received.')
}

export function layoutsLine(count: number, company: string): Line {
  const layouts = `${capitalise(numberWord(count))} ${count === 1 ? 'layout' : 'layouts'} chosen`
  return forCompany(`${layouts} for `, company, `${layouts}.`)
}

// The colour's stage: the palette's name, or "colour" for a code of the visitor's own, set in as
// many tones as a design has colour tokens.
export function tonesLine(palette: string | null): Line {
  const after = ` set in ${numberWord(TOKEN_NAMES.length)} tones, every text colour checked for easy reading.`
  return palette === null ? plain(`Your colour${after}`) : { before: 'Your ', echo: palette, after }
}

export const BRIEF_LINE = 'Your brief written from your sentence.'

// The headlines' stage, running and then landed, in full or set from the sentence at the deadline.
export function headlinesLine(count: number, state: 'running' | 'done' | 'fallback'): string {
  const headlines = `${numberWord(count)} ${count === 1 ? 'headline' : 'headlines'}`
  if (state === 'running') return `Writing ${headlines}`
  if (state === 'done') return `${capitalise(headlines)} written.`
  return 'Headlines set from your sentence, to finish on time.'
}

// The photos' stage: found to match the look, or the visitor's own placed. `photos` is how many
// the visitor added; `style` the look's label.
type PhotosStage =
  | Readonly<{ state: 'running'; photos: number; style: string }>
  | Readonly<{ state: 'done'; photos: number }>
  | Readonly<{ state: 'fallback' }>

export function photosLine(stage: PhotosStage): string {
  switch (stage.state) {
    case 'running':
      if (stage.photos === 0) return `Finding photos for a ${stage.style.toLowerCase()} look`
      return stage.photos === 1
        ? 'Placing your photo'
        : `Placing your ${numberWord(stage.photos)} photos`
    case 'done':
      return stage.photos === 0
        ? 'Photos placed, each photographer credited.'
        : 'Your photos placed.'
    case 'fallback':
      return 'Some photo spaces left plain, to finish on time.'
  }
}

// The pause the wait offers once the first headline lands or a minute has passed.
export const INTERMISSION = {
  line: `Like where this is going? The ${String(CONFIG.call.minutes)}-minute call is where a real site starts.`,
  link: "Pick a time for after you've looked",
} as const

// Ready's lead: how long the build took, when the server kept its stage times, then what the
// designs do. An early finish is said after it.
export function readyLead(count: number, took: string | null): string {
  const one = count === 1
  const opens = `${one ? 'It opens' : 'Each opens'} in a new tab and stays live for ${String(CONFIG.retention.days)} days.`
  return took === null ? opens : `Built in ${took}. ${opens}`
}

export const EARLY_FINISH = `Ahead of the ${numberWord(CONFIG.deadline.totalMs / 60_000)} minutes.`

// The primary at ready, which opens the first design, and the call it becomes once a design has
// been opened.
export function openDesign(index: number): string {
  return `Open design ${numberWord(index + 1)}`
}

export const CALL_AFTER_OPEN = `Seen one you like? Book the ${String(CONFIG.call.minutes)}-minute call.`

// What a partial build names as set simply, each only when its stage fell back.
export const PARTIAL_NOTES = {
  headlines: 'Headlines are set from your sentence, to finish on time.',
  photos: 'Some photo spaces are left plain, to finish on time.',
} as const

// What the status line says once each as the stages land, beside the lines it already says.
export function stageSaid(count: number) {
  return {
    layouts: `${capitalise(numberWord(count))} ${count === 1 ? 'layout' : 'layouts'} chosen.`,
    colours: 'Your colours are set.',
    headlines: 'Headlines written.',
    photos: 'Photos placed.',
  } as const
}

// The lines the status says as the build ends, or runs late: the done page's own since its first
// release, moved here with every count in words.
export function buildSaid(count: number) {
  return {
    ready:
      count === 1
        ? 'Your design is ready to open.'
        : count === 2
          ? 'Both designs are ready to open.'
          : `All ${numberWord(count)} designs are ready to open.`,
    late: 'Still building, past the usual time.',
    failed: 'Building your designs failed.',
    exhausted: 'There are no new designs to show you.',
  } as const
}

// A build with nothing to open, as the done page has said it since its first release, held to the
// copy rules now the tests read it: the heading, and why, with the call as the next step.
export const STOPPED = {
  failed: {
    heading: 'Something went wrong on our side.',
    lead: 'We could not finish your designs this time. We have the details. Try again in a few minutes, or book a call and we will sort it out with you.',
  },
  exhausted: {
    heading: 'You have seen every design we have for now.',
    lead: 'Every design we can build has been shown to this address, so there is nothing new to show you. The next step is a call: we go through your designs together.',
  },
} as const

// The designs page's words for a build with nothing to open (app/preview/_components/hub.tsx):
// the heading and the lead, which says what the call starts from: the brief when nothing was
// finished, the designs once the address has seen every one.
export const HUB_STOPPED = {
  failed: {
    heading: 'We could not finish these designs.',
    lead: 'The next step is a call: we go through your brief together.',
  },
  exhausted: {
    heading: 'Every design we have has been shown to this address.',
    lead: 'The next step is a call: we go through what you have seen together.',
  },
} as const

// The studio bar over a design, back to the done view that lists them.
export const BACK_TO_DESIGNS = 'Back to your designs'
