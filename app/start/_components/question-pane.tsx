'use client'

import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { type Dispatch, useId } from 'react'
import { displayHeading } from '@/app/_components/section-styles'
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
import type { Answers, ColoursAnswer, DraftImagery } from '@/lib/brief/schema'
import { SITE } from '@/lib/site'

// An answer being hovered or focused but not yet chosen, drawn in the sketch over the real one.
export type Preview = Readonly<{ imagery?: DraftImagery; colours?: ColoursAnswer }>

type Props = {
  index: number
  questionId: QuestionId
  answers: Answers
  errors: Errors
  dispatch: Dispatch<BriefAction>
  busy: boolean
  // A picture on this question is still on its way to Blob, so Next waits for it.
  uploading: boolean
  submitError: string | undefined
  logo: LocalImage | null
  onLogoFile: (file: File | null) => void
  photos: readonly LocalImage[]
  onPhotoFiles: (files: readonly File[]) => void
  onRemovePhoto: (id: string) => void
  onPreview: (preview: Preview | null) => void
  onBack: () => void
  // The value of the field no person sees, read from the form on submit.
  onNext: (website: string) => void
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
  uploading,
  submitError,
  logo,
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
        const website = new FormData(event.currentTarget).get('website')
        onNext(typeof website === 'string' ? website : '')
      }}
      className="flex w-full max-w-lg animate-question-in flex-col gap-6"
    >
      <div className="sm:hidden">
        <ProgressSteps current={index + 1} total={QUESTION_IDS.length} />
      </div>

      {/* A field for bots. Out of the tab order and hidden from assistive technology; a person
          never sees or fills it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <h1 ref={headingRef} tabIndex={-1} className={`${displayHeading} outline-none`}>
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
          logo={logo}
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
          <Button type="submit" variant="cta" size="lg" disabled={busy || uploading}>
            {(busy || uploading) && (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            )}
            {uploading ? 'Uploading' : last ? 'Show me my three designs' : 'Next'}
          </Button>
        </div>
        <p className="text-center text-small text-on-surface-muted sm:text-right">
          {SITE.reassurance}
        </p>
      </div>
    </form>
  )
}
