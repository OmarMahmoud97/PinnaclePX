import type * as z from 'zod'
import type { DoneDetails } from '@/app/start/_components/done-storage'
import type { Requested, View } from '@/app/start/_components/start-address'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { StoredDraft } from '@/lib/brief/read-draft'
import {
  type Answers,
  brandSchema,
  type ColoursAnswer,
  coloursSchema,
  describeSchema,
  detailsSchema,
  type DraftLogo,
  type DraftPhoto,
  lookSchema,
} from '@/lib/brief/schema'
import { isSentenceComplete } from '@/lib/brief/sentence'
import type { VisualStyle } from '@/lib/brief/styles'
import type { LogoPolarity } from '@/lib/logo/types'

type TextField = 'description' | 'name' | 'company' | 'email'
type FileField = 'logo' | 'imagery'
type FieldName = TextField | FileField | 'colours'

export type Errors = Readonly<Partial<Record<FieldName, string>>>

// What the server returned for a submission: its address, the deadline the countdown runs to,
// and how many designs it builds.
export type Submitted = Readonly<{ slug: string; deadlineAt: string; conceptCount: number }>

// Why the last ask did not send (plan 4.8): the words its error says, and whether the call is
// offered with them, as it is once the day's sends are spent.
export type SubmitError = Readonly<{ message: string; call: boolean }>

type BriefStatus =
  | Readonly<{ kind: 'editing' }>
  // The last question was sent while a picture was still uploading: the send waits for it (plan
  // D14), with the value of the field no person sees from the press.
  | Readonly<{ kind: 'waiting'; website: string }>
  | Readonly<{ kind: 'submitting' }>
  // This tab's send: the server's answer and the visitor's words for the done view. The answers
  // stay as sent, for the finished sketch; the draft goes with the send (brief-flow.tsx).
  | Readonly<{ kind: 'done'; submitted: Submitted; details: DoneDetails }>

// Which question is showing lives in the URL, not here. This holds what the visitor said and the
// furthest question they have been shown, `reached`, 0-based like the question index (plan D3).
// The flow follows `reached`, never validity alone: look and colour have valid defaults, so a
// flow that followed validity would skip them.
export type BriefState = Readonly<{
  answers: Answers
  reached: number
  errors: Errors
  submitError: SubmitError | undefined
  status: BriefStatus
}>

export type BriefAction =
  | { type: 'set-text'; field: TextField; value: string }
  | { type: 'set-logo'; value: DraftLogo }
  | { type: 'set-style'; value: VisualStyle }
  | { type: 'set-photos'; photos: readonly DraftPhoto[] }
  // A picture's upload finished: the logo or a photo, found by its id.
  | { type: 'upload-done'; id: string; url: string }
  // The browser has read the logo (logo-sampler.ts): its polarity and its own colour, kept in the
  // draft beside it so a refresh keeps them.
  | { type: 'logo-read'; id: string; polarity: LogoPolarity; accent: string | null }
  | { type: 'set-colours'; value: ColoursAnswer }
  | { type: 'reject-file'; field: FileField; message: string }
  // A failed picture is sent again: its message goes until it fails again.
  | { type: 'retry-file'; field: FileField }
  | { type: 'check'; question: QuestionId }
  | { type: 'clear-errors' }
  | { type: 'hydrate'; draft: StoredDraft }
  // The hero's sentence, merged into the draft on arrival (plan D4).
  | { type: 'carry'; sentence: string }
  // A question is about to show.
  | { type: 'reach'; index: number }
  | { type: 'wait'; website: string }
  // The visitor left the last question while its send waited, so the send is called off.
  | { type: 'cancel-wait' }
  | { type: 'submitting' }
  | { type: 'submitted'; submitted: Submitted; details: DoneDetails }
  | { type: 'submit-failed'; error: SubmitError }
  // "Start a new brief".
  | { type: 'restart' }

const LAST = QUESTION_IDS.length - 1

// The business name's question, where a sentence handed over from the hero lands (plan D2).
const NAME_QUESTION = QUESTION_IDS.indexOf('brand')

export const INITIAL_STATE: BriefState = {
  answers: BLANK_ANSWERS,
  reached: 0,
  errors: {},
  submitError: undefined,
  status: { kind: 'editing' },
}

export function questionAt(index: number): QuestionId {
  const id = QUESTION_IDS[index]
  if (id === undefined) {
    throw new Error(`No question at index ${String(index)}`)
  }
  return id
}

export function isLastQuestion(index: number): boolean {
  return index === LAST
}

// Validates one question and returns a message per field that failed. An empty object means the
// visitor may move on. A picture still uploading passes: the send waits for it (plan D14). The
// Server Action re-validates the whole brief regardless.
export function validateQuestion(id: QuestionId, answers: Answers): Errors {
  switch (id) {
    case 'describe':
      return collect(describeSchema.safeParse({ description: answers.description }))
    case 'brand':
      return collect(brandSchema.safeParse({ company: answers.company, logo: answers.logo }))
    case 'imagery':
      return single('imagery', lookSchema.safeParse(answers.imagery))
    case 'colours':
      return single('colours', coloursSchema.safeParse(answers.colours))
    case 'details':
      return collect(detailsSchema.safeParse({ email: answers.email, name: answers.name }))
  }
}

// The first question that is not yet valid, or one past the end when every question is answered.
export function firstInvalidIndex(answers: Answers): number {
  const index = QUESTION_IDS.findIndex(
    (id) => Object.keys(validateQuestion(id, answers)).length > 0,
  )
  return index === -1 ? QUESTION_IDS.length : index
}

// The furthest question the visitor may open: the lower of the one reached and the first that is
// not yet valid (plan D3). A visitor coming back resumes here.
export function resumeIndex({ answers, reached }: Pick<BriefState, 'answers' | 'reached'>): number {
  return Math.min(reached, firstInvalidIndex(answers), LAST)
}

// The answers are plain data, so their JSON tells a blank brief from a started one.
const BLANK = JSON.stringify(BLANK_ANSWERS)

// Whether there is a draft worth keeping: an answer changed, or a question past the first shown.
export function hasProgress(answers: Answers, reached: number): boolean {
  return reached > 0 || JSON.stringify(answers) !== BLANK
}

// What bare /start shows (plan 7.4, rule 4): a draft in this tab where it left off; else the done
// view of the submission this browser sent, while it is live; else the first question.
export function arrivalView(state: BriefState, liveSlug: string | null): View {
  if (liveSlug !== null && !hasProgress(state.answers, state.reached)) {
    return { kind: 'done', slug: liveSlug }
  }
  return { kind: 'question', index: resumeIndex(state) }
}

// What the address shows (plan 7.4): a done address its submission; a question the lowest of
// that question, the one reached and the first not yet valid (rule 2); an arrival what it
// resolved to when the visitor arrived.
export function viewFor(requested: Requested, state: BriefState, arrival: View): View {
  switch (requested.kind) {
    case 'done':
      return requested
    case 'question':
      return { kind: 'question', index: Math.min(requested.index, resumeIndex(state)) }
    case 'arrival':
      return arrival
  }
}

// The state a visitor arrives to: this tab's draft, if it kept one, with the hero's sentence
// merged over its first answer when one was handed over.
export function restoredState(draft: StoredDraft | null, carried: string | null): BriefState {
  const restored =
    draft === null ? INITIAL_STATE : briefReducer(INITIAL_STATE, { type: 'hydrate', draft })
  return carried === null ? restored : briefReducer(restored, { type: 'carry', sentence: carried })
}

type Parsed = z.ZodSafeParseResult<unknown>

// Field-per-issue, for questions whose fields map one to one onto inputs.
function collect(result: Parsed): Errors {
  if (result.success) return {}
  const errors: Partial<Record<FieldName, string>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (typeof field === 'string') {
      errors[field as FieldName] ??= issue.message
    }
  }
  return errors
}

// One message for a question whose answer is a single union value.
function single(field: FieldName, result: Parsed): Errors {
  if (result.success) return {}
  return { [field]: result.error.issues[0]?.message ?? 'Please choose an option.' }
}

export function briefReducer(state: BriefState, action: BriefAction): BriefState {
  switch (action.type) {
    case 'set-text':
      return clearError(
        { ...state, answers: { ...state.answers, [action.field]: action.value } },
        action.field,
      )
    case 'set-logo':
      return clearError({ ...state, answers: { ...state.answers, logo: action.value } }, 'logo')
    case 'set-style':
      return clearError(
        {
          ...state,
          answers: { ...state.answers, imagery: { ...state.answers.imagery, style: action.value } },
        },
        'imagery',
      )
    case 'set-photos':
      return clearError(
        {
          ...state,
          answers: {
            ...state.answers,
            imagery: { ...state.answers.imagery, photos: [...action.photos] },
          },
        },
        'imagery',
      )
    case 'upload-done': {
      const { logo, imagery } = state.answers
      if (logo.kind === 'file' && logo.id === action.id) {
        return { ...state, answers: { ...state.answers, logo: { ...logo, url: action.url } } }
      }
      if (!imagery.photos.some((photo) => photo.id === action.id)) return state
      const photos = imagery.photos.map((photo) =>
        photo.id === action.id ? { ...photo, url: action.url } : photo,
      )
      return { ...state, answers: { ...state.answers, imagery: { ...imagery, photos } } }
    }
    case 'logo-read': {
      const { logo } = state.answers
      if (logo.kind !== 'file' || logo.id !== action.id) return state
      const read = { ...logo, polarity: action.polarity, accent: action.accent }
      return { ...state, answers: { ...state.answers, logo: read } }
    }
    case 'set-colours':
      return clearError(
        { ...state, answers: { ...state.answers, colours: action.value } },
        'colours',
      )
    case 'reject-file':
      return { ...state, errors: { ...state.errors, [action.field]: action.message } }
    case 'retry-file':
      return clearError(state, action.field)
    case 'check':
      return { ...state, errors: validateQuestion(action.question, state.answers) }
    case 'clear-errors':
      return { ...state, errors: {}, submitError: undefined }
    case 'hydrate': {
      // An uploaded picture lives on at its URL, so it comes back. One that was still uploading
      // when the page was left is gone: the bytes were never kept. A draft saved before `reached`
      // existed resumes at its first unanswered question, as it always did.
      const { logo, imagery } = action.draft.answers
      const answers: Answers = {
        ...action.draft.answers,
        logo: logo.kind === 'file' && logo.url === null ? { kind: 'wordmark' } : logo,
        imagery: { ...imagery, photos: imagery.photos.filter((photo) => photo.url !== null) },
      }
      return {
        ...state,
        answers,
        reached: action.draft.reached ?? Math.min(firstInvalidIndex(answers), LAST),
      }
    }
    case 'carry': {
      // A sentence long enough to brief from is question one answered, so the name comes next.
      const reached = isSentenceComplete(action.sentence)
        ? Math.max(state.reached, NAME_QUESTION)
        : state.reached
      return clearError(
        { ...state, reached, answers: { ...state.answers, description: action.sentence } },
        'description',
      )
    }
    case 'reach':
      return { ...state, reached: Math.max(state.reached, Math.min(action.index, LAST)) }
    case 'wait':
      return {
        ...state,
        submitError: undefined,
        status: { kind: 'waiting', website: action.website },
      }
    case 'cancel-wait':
      return state.status.kind === 'waiting' ? { ...state, status: { kind: 'editing' } } : state
    case 'submitting':
      return { ...state, submitError: undefined, status: { kind: 'submitting' } }
    case 'submitted':
      return {
        ...state,
        submitError: undefined,
        status: { kind: 'done', submitted: action.submitted, details: action.details },
      }
    case 'submit-failed':
      return { ...state, submitError: action.error, status: { kind: 'editing' } }
    case 'restart':
      return INITIAL_STATE
  }
}

// Typing again should clear the message about what was typed before.
function clearError(state: BriefState, field: FieldName): BriefState {
  if (state.errors[field] === undefined) return state
  const { [field]: _removed, ...rest } = state.errors
  return { ...state, errors: rest }
}
