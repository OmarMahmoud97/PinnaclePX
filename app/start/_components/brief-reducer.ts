import type * as z from 'zod'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import {
  type Answers,
  type ColoursAnswer,
  coloursSchema,
  describeSchema,
  detailsSchema,
  type DraftLogo,
  type DraftPhoto,
  imagerySchema,
  logoSchema,
} from '@/lib/brief/schema'
import type { VisualStyle } from '@/lib/brief/styles'

type TextField = 'description' | 'name' | 'company' | 'email'
type FileField = 'logo' | 'imagery'
type FieldName = TextField | FileField | 'colours'

export type Errors = Readonly<Partial<Record<FieldName, string>>>

// What the server returned for a submission: its address, the deadline the countdown runs to,
// and how many designs it builds.
export type Submitted = Readonly<{ slug: string; deadlineAt: string; conceptCount: number }>

type BriefStatus =
  | Readonly<{ kind: 'editing' }>
  | Readonly<{ kind: 'submitting' }>
  | Readonly<{ kind: 'done' } & Submitted>

// Which question is showing lives in the URL, not here. This holds only what the visitor said.
export type BriefState = Readonly<{
  answers: Answers
  errors: Errors
  submitError: string | undefined
  status: BriefStatus
}>

export type BriefAction =
  | { type: 'set-text'; field: TextField; value: string }
  | { type: 'set-logo'; value: DraftLogo }
  | { type: 'set-style'; value: VisualStyle }
  | { type: 'set-photos'; photos: readonly DraftPhoto[] }
  // A picture's upload finished: the logo or a photo, found by its id.
  | { type: 'upload-done'; id: string; url: string }
  | { type: 'set-colours'; value: ColoursAnswer }
  | { type: 'reject-file'; field: FileField; message: string }
  | { type: 'check'; question: QuestionId }
  | { type: 'clear-errors' }
  | { type: 'hydrate'; answers: Answers }
  | { type: 'submitting' }
  | { type: 'submitted'; submitted: Submitted }
  | { type: 'submit-failed'; message: string }

export const INITIAL_STATE: BriefState = {
  answers: BLANK_ANSWERS,
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
  return index === QUESTION_IDS.length - 1
}

// Validates one question and returns a message per field that failed. An empty object means the
// visitor may move on. The Server Action re-validates the whole brief regardless.
export function validateQuestion(id: QuestionId, answers: Answers): Errors {
  switch (id) {
    case 'describe':
      return collect(describeSchema.safeParse({ description: answers.description }))
    case 'details':
      return collect(
        detailsSchema.safeParse({
          name: answers.name,
          company: answers.company,
          email: answers.email,
        }),
      )
    case 'logo':
      return single('logo', logoSchema.safeParse(answers.logo))
    case 'imagery':
      return single('imagery', imagerySchema.safeParse(answers.imagery))
    case 'colours':
      return single('colours', coloursSchema.safeParse(answers.colours))
  }
}

// The furthest question the visitor may open: the first one that is not yet valid, or one past
// the end when every question is answered.
export function firstInvalidIndex(answers: Answers): number {
  const index = QUESTION_IDS.findIndex(
    (id) => Object.keys(validateQuestion(id, answers)).length > 0,
  )
  return index === -1 ? QUESTION_IDS.length : index
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
    case 'set-colours':
      return clearError(
        { ...state, answers: { ...state.answers, colours: action.value } },
        'colours',
      )
    case 'reject-file':
      return { ...state, errors: { ...state.errors, [action.field]: action.message } }
    case 'check':
      return { ...state, errors: validateQuestion(action.question, state.answers) }
    case 'clear-errors':
      return { ...state, errors: {}, submitError: undefined }
    case 'hydrate': {
      // An uploaded picture lives on at its URL, so it comes back. One that was still uploading
      // when the page was left is gone: the bytes were never kept.
      const { logo, imagery } = action.answers
      return {
        ...state,
        answers: {
          ...action.answers,
          logo: logo.kind === 'file' && logo.url === null ? { kind: 'wordmark' } : logo,
          imagery: { ...imagery, photos: imagery.photos.filter((photo) => photo.url !== null) },
        },
      }
    }
    case 'submitting':
      return { ...state, submitError: undefined, status: { kind: 'submitting' } }
    case 'submitted':
      return { ...state, submitError: undefined, status: { kind: 'done', ...action.submitted } }
    case 'submit-failed':
      return { ...state, submitError: action.message, status: { kind: 'editing' } }
  }
}

// Typing again should clear the message about what was typed before.
function clearError(state: BriefState, field: FieldName): BriefState {
  if (state.errors[field] === undefined) return state
  const { [field]: _removed, ...rest } = state.errors
  return { ...state, errors: rest }
}
