'use client'

import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { type Dispatch, useId } from 'react'
import { QUESTIONS } from '@/app/start/_components/brief-questions'
import {
  type BriefAction,
  type Errors,
  isLastQuestion,
} from '@/app/start/_components/brief-reducer'
import type { LocalImage } from '@/app/start/_components/step-props'
import { ColoursStep } from '@/app/start/_components/steps/colours-step'
import { DescribeStep } from '@/app/start/_components/steps/describe-step'
import { DetailsStep } from '@/app/start/_components/steps/details-step'
import { ImageryStep } from '@/app/start/_components/steps/imagery-step'
import { LogoStep } from '@/app/start/_components/steps/logo-step'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import { Button } from '@/components/ui/button'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers, ColoursAnswer, ImageryAnswer } from '@/lib/brief/schema'
import { SITE } from '@/lib/site'

// An answer being hovered or focused but not yet chosen, drawn in the sketch over the real one.
export type Preview = Readonly<{ imagery?: ImageryAnswer; colours?: ColoursAnswer }>

type Props = {
  index: number
  questionId: QuestionId
  answers: Answers
  errors: Errors
  dispatch: Dispatch<BriefAction>
  busy: boolean
  submitError: string | undefined
  logoPreview: string | null
  onLogoFile: (file: File | null) => void
  photos: readonly LocalImage[]
  onPhotoFiles: (files: readonly File[]) => void
  onRemovePhoto: (index: number) => void
  onPreview: (preview: Preview | null) => void
  onBack: () => void
  onNext: () => void
}

// One question: heading, helper, its control, Back and Next. Mounted afresh for every question,
// so the heading takes focus and the pane slides in each time.
export function QuestionPane({
  index,
  questionId,
  answers,
  errors,
  dispatch,
  busy,
  submitError,
  logoPreview,
  onLogoFile,
  photos,
  onPhotoFiles,
  onRemovePhoto,
  onPreview,
  onBack,
  onNext,
}: Props) {
  const errorId = useId()
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const question = QUESTIONS[questionId]
  const last = isLastQuestion(index)

  return (
    <form
      noValidate
      aria-describedby={submitError === undefined ? undefined : errorId}
      onSubmit={(event) => {
        event.preventDefault()
        onNext()
      }}
      className="question-in flex w-full max-w-lg flex-col gap-6"
    >
      <div className="sm:hidden">
        <ProgressSteps current={index + 1} total={QUESTION_IDS.length} />
      </div>

      <div className="flex flex-col gap-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tighter text-balance outline-none sm:text-4xl lg:text-5xl"
        >
          {question.title(answers)}
        </h1>
        <p className="text-on-surface-muted">{question.helper}</p>
      </div>

      {questionId === 'describe' && (
        <DescribeStep answers={answers} errors={errors} dispatch={dispatch} />
      )}
      {questionId === 'details' && (
        <DetailsStep answers={answers} errors={errors} dispatch={dispatch} />
      )}
      {questionId === 'logo' && (
        <LogoStep
          answers={answers}
          errors={errors}
          dispatch={dispatch}
          preview={logoPreview}
          onFile={onLogoFile}
        />
      )}
      {questionId === 'imagery' && (
        <ImageryStep
          answers={answers}
          errors={errors}
          dispatch={dispatch}
          photos={photos}
          onFiles={onPhotoFiles}
          onRemovePhoto={onRemovePhoto}
          onPreview={(value) => {
            onPreview(value === null ? null : { imagery: value })
          }}
        />
      )}
      {questionId === 'colours' && (
        <ColoursStep
          answers={answers}
          errors={errors}
          dispatch={dispatch}
          onPreview={(value) => {
            onPreview(value === null ? null : { colours: value })
          }}
        />
      )}

      <div className="flex flex-col gap-3 pt-2">
        {submitError !== undefined && (
          <p id={errorId} role="alert" className="text-sm font-medium text-danger">
            {submitError}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={index === 0 || busy}
            className={index === 0 ? 'invisible' : undefined}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>
          <Button type="submit" variant="cta" size="lg" disabled={busy}>
            {busy && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {last ? 'Show me my three designs' : 'Next'}
          </Button>
        </div>
        <p className="text-center text-xs text-on-surface-muted sm:text-right">
          {SITE.reassurance}
        </p>
      </div>
    </form>
  )
}
