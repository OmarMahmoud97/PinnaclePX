import type { z } from 'zod'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import {
  type Answers,
  type ColoursAnswer,
  coloursSchema,
  describeSchema,
  detailsSchema,
  imagerySchema,
  type LogoAnswer,
  logoSchema,
} from '@/lib/brief/schema'
import type { VisualStyle } from '@/lib/brief/styles'

type TextField = 'description' | 'name' | 'company' | 'email'
type FileField = 'logo' | 'imagery'
type FieldName = TextField | FileField | 'colours'

export type Errors = Readonly<Partial<Record<FieldName, string>>>

type BriefStatus =
  | Readonly<{ kind: 'editing' }>
  | Readonly<{ kind: 'submitting' }>
  | Readonly<{ kind: 'done'; briefId: string }>

// Which question is showing lives in the URL, not here. This holds only what the visitor said.
export type BriefState = Readonly<{
  answers: Answers
  errors: Errors
  submitError: string | undefined
  status: BriefStatus
}>

export type BriefAction =
  | { type: 'set-text'; field: TextField; value: string }
  | { type: 'set-logo'; value: LogoAnswer }
  | { type: 'set-style'; value: VisualStyle }
  | { type: 'set-photos'; fileNames: string[] }
  | { type: 'set-colours'; value: ColoursAnswer }
  | { type: 'reject-file'; field: FileField; message: string }
  | { type: 'check'; question: QuestionId }
  | { type: 'clear-errors' }
  | { type: 'hydrate'; answers: Answers }
  | { type: 'submitting' }
  | { type: 'submitted'; briefId: string }
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

type Parsed = z.SafeParseReturnType<unknown, unknown>

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
            imagery: { ...state.answers.imagery, fileNames: action.fileNames },
          },
        },
        'imagery',
      )
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
    case 'hydrate':
      // Stored files cannot be restored: the bytes were never kept. The logo falls back to the
      // wordmark and the photos to none; the style stays.
      return {
        ...state,
        answers: {
          ...action.answers,
          logo: action.answers.logo.kind === 'file' ? { kind: 'wordmark' } : action.answers.logo,
          imagery: { ...action.answers.imagery, fileNames: [] },
        },
      }
    case 'submitting':
      return { ...state, submitError: undefined, status: { kind: 'submitting' } }
    case 'submitted':
      return { ...state, submitError: undefined, status: { kind: 'done', briefId: action.briefId } }
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
