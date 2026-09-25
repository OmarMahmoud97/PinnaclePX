import { possessive } from '@/lib/brief/names'
import { paletteFor } from '@/lib/brief/palettes'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { isSentenceComplete } from '@/lib/brief/sentence'
import type { SubmissionStatus } from '@/lib/brief/status'
import { styleFor } from '@/lib/brief/styles'
import { UPLOAD_LIMIT_LABEL } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'
import { numberWord, SITE } from '@/lib/site'

// The questionnaire's words (docs/start-page-journey-plan.md, 4.6 and D25): each question's title,
// helper, ask and the line under it; the receipts under the titles; the words of every control;
// and the flow's own lines around the done view. Kept out of the components, so the copy tests read
// every one without React (app/_components/copy-corpus.ts, start-copy.test.ts). A line that holds
// a name is a `Line`, so the page can isolate the name (<bdi>) wherever it shows it (plan 7.7).

// Words with one of the visitor's own inside, set apart where they are drawn. `echo` is empty for
// a line that holds none.
export type Line = Readonly<{ before: string; echo: string; after: string }>

function plain(text: string): Line {
  return { before: text, echo: '', after: '' }
}

export function lineText({ before, echo, after }: Line): string {
  return `${before}${echo}${after}`
}

// The business name as the visitor typed it, or null before they have.
function companyOf(answers: Answers): string | null {
  const company = answers.company.trim()
  return company === '' ? null : company
}

// "Gibbs Plumbing's", said of the business, opening a sentence: "Your" before a name exists.
function theirs(answers: Answers, after: string): Line {
  const company = companyOf(answers)
  return company === null ? plain(`Your${after}`) : { before: '', echo: possessive(company), after }
}

type QuestionCopy = Readonly<{
  // The tab's words, after "2 of 5:" (questionTitle, below).
  tab: string
  title: string
  // The title's payoff word, which Release 3 sets in the serif italic (plan 5.2).
  emphasis: string
  helper: (answers: Answers) => Line
  ask: string
  // The line under the ask.
  under: string
}>

// Under the ask on the three questions in the middle: the reward, restated.
const REWARD = 'Three designs, about five minutes after the last question.'

export const QUESTIONS: Readonly<Record<QuestionId, QuestionCopy>> = {
  describe: {
    tab: 'Start with a sentence',
    title: 'Start with a sentence.',
    emphasis: 'sentence',
    helper: () =>
      plain(
        'Five answers, three designs, about five minutes. Watch your sentence set in the draft as you type.',
      ),
    ask: 'Next: your name',
    under: SITE.reassurance,
  },
  brand: {
    tab: 'Put your name on it',
    title: 'Put your name on it.',
    emphasis: 'name',
    helper: () =>
      plain('It goes at the top of all three designs. Add your logo, or let your name stand in.'),
    ask: 'Next: pick a look',
    under: REWARD,
  },
  imagery: {
    tab: 'Pick a look',
    title: 'Pick a look.',
    emphasis: 'look',
    helper: (answers) => theirs(answers, ' type and photos follow it. Try each one.'),
    ask: 'Next: choose a colour',
    under: REWARD,
  },
  colours: {
    tab: 'Choose a colour',
    title: 'Choose a colour.',
    emphasis: 'colour',
    helper: () => plain('It runs through the buttons and accents on all three designs.'),
    ask: 'Next: one last step',
    under: REWARD,
  },
  details: {
    tab: 'Where should we send them',
    title: 'Where should we send them?',
    emphasis: 'send',
    helper: (answers) => theirs(answers, ' three designs are about five minutes away.'),
    ask: 'Show me my three designs',
    under: SITE.reassuranceSend,
  },
}

// The tab's title at a question, so a visitor with several tabs sees where they are.
export function questionTitle(id: QuestionId): string {
  const n = QUESTION_IDS.indexOf(id) + 1
  return `${String(n)} of ${String(QUESTION_IDS.length)}: ${QUESTIONS[id].tab} | ${SITE.name}`
}

// The flow's notices, each said once in the receipt of the question it lands on.
export const NOTICES = {
  // The poll says a submission this browser kept is gone, swept after its days.
  expired: 'Those designs have expired, or the link is incomplete. Start a new brief here.',
  // The poll knows no submission by a slug this browser never kept: most likely a mistyped link,
  // so nothing is said about the designs expiring.
  notFound: 'We could not find that link. Start a new brief here.',
  // A reload during a send. The same answers sent again return the submission already made, so a
  // second press starts no second build.
  pending:
    'If you pressed send just now, it may be on its way. Sending again will not start a second build.',
} as const

export type Notice = keyof typeof NOTICES

// How the visit began, as far as the receipts care: the hero handed over a sentence long enough
// to brief from, one too short, or nothing.
export type HandOff = 'none' | 'sentence' | 'short'

// Where a receipt shows (plan D6 and 4.6). A desk at least 47.5rem tall has room for one at every
// question ('tall-desk'); elsewhere only the notices and the hero's hand-off keep theirs. The
// hand-off echoes the sentence on a desk of any height ('desk'), and below lg says less and stands
// in for the helper ('narrow').
type ReceiptPlace = 'everywhere' | 'desk' | 'tall-desk' | 'narrow'

export type Receipt = Readonly<{
  place: ReceiptPlace
  line: Line
  // Ends with the way back to the sentence.
  change: boolean
  // A notice rather than a reminder, which a screen reader is told as the question arrives.
  news: boolean
}>

export const CHANGE_IT = 'Change it'

// The text up to the first full stop, question or exclamation mark that ends at least
// CONFIG.start.names.clauseMinWords words, so an abbreviation such as "Dr." or "St." is read
// through rather than taken for a sentence; the whole text when none does.
function firstSentence(text: string): string {
  for (const end of text.matchAll(/[.!?](?=\s|$)/g)) {
    const sentence = text.slice(0, end.index + 1)
    if (sentence.split(' ').length >= CONFIG.start.names.clauseMinWords) return sentence
  }
  return text
}

// The first sentence of the description, as a receipt echoes it: cut at a word boundary to
// CONFIG.start.names.clauseMax characters, with an ellipsis where it is cut. Counted in code
// points, so a cut never splits a character.
export function clauseOf(description: string): string {
  const first = firstSentence(description.trim().replace(/\s+/g, ' '))
  const characters = Array.from(first)
  const max = CONFIG.start.names.clauseMax
  if (characters.length <= max) return first
  const cut = characters.slice(0, max).join('')
  const space = cut.lastIndexOf(' ')
  const kept = space > 0 ? cut.slice(0, space) : cut
  return `${kept.replace(/[\s,;:.!?-]+$/u, '')}…`
}

type ReceiptContext = Readonly<{ answers: Answers; handOff: HandOff; notice: Notice | null }>

function receipt(place: ReceiptPlace, line: Line, change = false): Receipt {
  return { place, line, change, news: false }
}

// What each question says under its title about the answer before it (plan 4.6): the notice when
// there is one, else the question's own receipts, which may differ by place.
export function receiptsFor(id: QuestionId, context: ReceiptContext): readonly Receipt[] {
  const { answers, handOff, notice } = context
  if (notice !== null) {
    return [{ place: 'everywhere', line: plain(NOTICES[notice]), change: false, news: true }]
  }
  switch (id) {
    // A short sentence from the hero is nearly there until it is long enough, and then the meter
    // under it says so on its own.
    case 'describe':
      return handOff === 'short' && !isSentenceComplete(answers.description)
        ? [receipt('everywhere', plain('Nearly there. Add a little more about what you do.'))]
        : []
    case 'brand': {
      const clause: Line = {
        before: 'Your sentence is in: “',
        echo: clauseOf(answers.description),
        after: '”',
      }
      return handOff === 'sentence'
        ? [receipt('desk', clause, true), receipt('narrow', plain('Your sentence is in.'), true)]
        : [receipt('tall-desk', clause, true)]
    }
    case 'imagery': {
      const company = companyOf(answers) ?? 'Your business'
      const after =
        answers.logo.kind === 'file' ? ' and your logo are on the page.' : ' is on the page.'
      return [receipt('tall-desk', { before: '', echo: company, after })]
    }
    case 'colours':
      return [
        receipt('tall-desk', {
          before: '',
          echo: styleFor(answers.imagery.style).label,
          after: ' it is.',
        }),
      ]
    case 'details': {
      const { colours } = answers
      return [
        receipt(
          'tall-desk',
          colours.kind === 'palette'
            ? {
                before: '',
                echo: paletteFor(colours.paletteId).label,
                after: ' it is. Your draft is finished.',
              }
            : plain('Your colour is in. Your draft is finished.'),
        ),
      ]
    }
  }
}

// The first question's words (plan 4.6 and 4.7). Its errors are the schema's (lib/brief/schema.ts).
export const DESCRIBE = {
  label: 'What does your business do?',
  hint: 'For example: Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab, same-week appointments.',
  // A short screen's hint, where the long one would push the field under the ask.
  hintShort: 'For example: Physio clinic in Sheffield.',
  // Where Enter moves on, that is with a fine pointer: what shows, and what a screen reader hears.
  enter: 'Enter to go on',
  enterFull: 'Enter to go on, Shift and Enter for a new line.',
} as const

// How far the sentence has come (plan 4.6): what it needs until it is long enough to brief from,
// and what room is left once it nears the limit, in the textarea's own characters.
export function meterWords(value: string): string {
  const used = value.trim().length
  const left = CONFIG.form.maxChars - value.length
  if (used === 0) return 'Aim for a sentence or two.'
  if (used < CONFIG.form.minChars) return `${String(CONFIG.form.minChars - used)} more to go.`
  if (left <= CONFIG.start.meter.countdownChars) {
    return left === 1 ? '1 character left.' : `${String(left)} characters left.`
  }
  return 'That is plenty to start from.'
}

// How full the meter's bar is: full once the sentence is long enough to brief from.
export function meterShare(value: string): number {
  return Math.min(value.trim().length / CONFIG.form.minChars, 1)
}

export const TRY_AGAIN = 'Try again'

// The words beside the logo and the photos, pointing to what happens to them.
export const PICTURES_LINK = 'How we use your pictures'

// The second question's words.
export const BRAND = {
  label: 'Business name',
  mark: 'Your mark',
  useName: 'Use my name',
  useNameDetail: 'We set it as your mark',
  useLogo: 'Use my logo',
  useLogoDetail: `PNG, JPEG, SVG or WebP, up to ${UPLOAD_LIMIT_LABEL}`,
  chooseFile: 'Choose a file',
  removeLogo: 'Remove logo',
} as const

// The logo's line under the choice, said politely as it changes.
export const LOGO_STATUS = {
  uploading: 'Uploading your logo.',
  done: 'We check whether it is light or dark artwork and set your designs on a background that suits it.',
  failed: 'That logo did not upload. Try again, or remove it.',
  unreadable: 'We could not read that file, so your name stands in.',
} as const

// A picture refused before or during its upload, as the question it belongs to says it.
export const UPLOAD_ERRORS = {
  logos: {
    unsupported: 'That file type is not supported. Use PNG, JPEG, SVG or WebP.',
    failed: LOGO_STATUS.failed,
    tooBig: `That file is over ${UPLOAD_LIMIT_LABEL}. Try a smaller one.`,
  },
  photos: {
    unsupported: 'One of your photos is a type we cannot use. Use PNG, JPEG or WebP.',
    failed: 'One of your photos did not upload. Try again, or remove it.',
    tooBig: `Some photos were over ${UPLOAD_LIMIT_LABEL} and were left out.`,
    tooMany: `Up to ${String(CONFIG.form.maxPhotos)} photos, so the rest were left out.`,
  },
} as const

// The third question's words.
export const IMAGERY = {
  group: 'Look',
  addPhotos: 'Add your own photos',
  addMorePhotos: 'Add more photos',
  caption: `Up to ${String(CONFIG.form.maxPhotos)}. Without any, we find photos to match your look and credit each photographer.`,
  uploading: 'Uploading.',
  failed: 'Did not upload.',
  remove: 'Remove',
} as const

// The fourth question's words. The hex code's error is the schema's.
export const COLOURS = {
  group: 'Colour',
  ownColour: 'My own colour',
  ownColourDetail: 'Have a hex code?',
  logoColour: "Your logo's colour",
  logoColourDetail: 'Found in your logo',
  hexLabel: 'Hex code',
  hexHint: 'Paste it, or pick one by eye.',
  hexPlaceholder: '#',
  picker: 'Pick a colour',
  hexSet: 'Colour set.',
} as const

// The last question's words. Its errors are the schema's.
export const DETAILS = {
  email: 'Email',
  emailHint: 'We email your links here, or they open on this page. Nothing else.',
  // A short screen's hint, so the field starts above the ask on a phone's first screen.
  emailHintShort: 'We email your links here. Nothing else.',
  detailsLink: 'How we use your details',
  name: 'Your name',
} as const

// The last ask while the brief is on its way: waiting for a picture still uploading, then sending.
// A screen reader is told each once, by the status line under the form, since the ask it would
// otherwise hear is disabled and loses the focus. The ink that blooms from the ask says the last,
// in the serif italic, to the eye alone (plan 4.6).
export const SENDING = {
  uploads: 'Finishing your uploads',
  uploadsStatus: 'Finishing your uploads.',
  ask: 'Sending',
  status: 'Sending your answers.',
  ink: 'Off it goes.',
} as const

// Why the brief did not go, as the ask's error says it (plan 4.8), for each refusal the server
// answers with (actions.ts, SendRefusal); a send that had no answer in time is told to try again.
export const SEND_REFUSED = {
  retry: 'Something went wrong on our side. Give it a moment and try again.',
  too_many: 'That is a lot of designs for one day. Try again tomorrow, or book a call.',
  rejected: 'Something in your answers did not look right. Go back and check them.',
} as const

// A picture that stopped uploading after the visitor moved on: the brief cannot go without it, so
// the send says which one and where to put it right.
const questionNumber = (id: QuestionId) => numberWord(QUESTION_IDS.indexOf(id) + 1)

export const SEND_PICTURE_FAILED = {
  logo: `Your logo did not upload. Go back to question ${questionNumber('brand')} to try it again, or remove it.`,
  photos: `One of your photos did not upload. Go back to question ${questionNumber('imagery')} to try it again, or remove it.`,
} as const

// A send that never reached the server, because the connection dropped. The server's own
// failures carry their own words (app/start/_components/actions.ts).
export const SEND_FAILED = 'Your answers did not reach us. Check your connection and try again.'

// The done view's words that the flow shows while its chunk loads or if it fails, and the way on
// to a new brief (done-boundary.tsx).
export const DONE_LINES = {
  pageLink: 'Your page:',
  // The done view's chunk would not load. The page link reaches the designs without it.
  chunkFailed: 'Part of this page did not load. Your page link still works.',
  retry: TRY_AGAIN,
  newBrief: 'Start a new brief',
  // The visitor's address, where this tab no longer has it: a pasted link, or another tab.
  restoredAddress: 'the address you gave',
} as const

// What stands in for "Start a new brief" once the day's briefs are spent, from the server's own
// limit (CONFIG.rateLimit), whose window is a day.
export const SEND_LIMIT = `You can send ${numberWord(CONFIG.rateLimit.submissionsPerIdentity.max)} briefs a day.`

// The heading while the designs are on their way, as the done view words it (brief-done.tsx):
// with the first name when this tab has it, and singular once the build is known to make one
// design. Until the count is known it is plural, the build's usual size.
export function waitingHeading(first: string, count: number | null): string {
  const designs = count === 1 ? 'design is on its way.' : 'designs are on their way.'
  return first === '' ? `Your ${designs}` : `${first}, your ${designs}`
}

// The tab's title at done, so a visitor waiting in another tab sees it turn (plan 7.6). Null where
// the route's own title stands: a failed, exhausted or missing build.
export function doneTitle(status: SubmissionStatus | undefined): string | null {
  const title = doneTitleWords(status)
  return title === null ? null : `${title} | ${SITE.name}`
}

function doneTitleWords(status: SubmissionStatus | undefined): string | null {
  if (status === undefined || status.status === 'building') return 'Building your designs'
  if (status.status !== 'ready' && status.status !== 'partial') return null
  return status.conceptCount === 1
    ? 'Ready: your design'
    : `Ready: your ${numberWord(status.conceptCount)} designs`
}
