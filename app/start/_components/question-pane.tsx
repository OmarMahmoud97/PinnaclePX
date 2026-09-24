'use client'

import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { type Dispatch, useEffect, useId, useRef, useState } from 'react'
import { displayHeading, sectionLead } from '@/app/_components/section-styles'
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
import { FieldError } from '@/components/ui/field'
import type { QuestionId } from '@/lib/brief/question-ids'
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

// The box that draws a focused control's ring: the control itself, or the nearest box around it
// that takes the ring for it, as the description's card does by focus-within. The search stops at
// the form, and a control with no ring of its own or around it is its own box.
function ringOf(control: HTMLElement, form: HTMLElement): HTMLElement {
  for (
    let box: HTMLElement | null = control;
    box !== null && box !== form;
    box = box.parentElement
  ) {
    if (getComputedStyle(box).outlineStyle !== 'none') return box
  }
  return control
}

// One question: heading, helper, its control, Back and the ask. Mounted afresh for every
// question, so the heading takes focus and the pane slides in each time. The progress is the
// header island's alone, live at every width, so the form carries no second copy of it.
//
// The hooks app/_styles/start.css reads: start-question on the form (Back's entrance from the
// left), start-ask on the ask's wrapper (sticky at the foot of the screen below lg, on a screen
// at least 30rem tall) and start-actions on the actions row, which from lg is a box of its own,
// riding at the foot of a desk window shorter than the question. The form lifts a control
// focused from the keyboard clear of whichever of the two rides at the foot. Below lg the actions
// row has no box of its own (display: contents), so Back and the ask are the form's own flex
// items: a sticky box cannot leave its parent, and the form spans the whole question, which is
// what lets the ask ride at the foot and fall back into place at the end. The ask is full width
// there, so "Show me my three designs" never shares a row with Back and the page never scrolls
// sideways. Below lg its label may wrap to a second line, which only a reader's own text spacing
// brings about at 320, so the column never grows wider than the phone. Back is a text button,
// first in the tab order as it is first in the row from lg, and drawn under the ask on a phone,
// where the ask is the thumb's next move.
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

  // Every Next on this question is counted, and after each one the focus moves to the first
  // control still marked invalid, if there is one. Left on the ask, a screen reader hears none of
  // the messages, and below lg the ask riding at the foot covers them on a short phone (at 390 by
  // 664, all three of question two's). The focused control reads its message through
  // aria-describedby. Focus comes first, so a field above the screen comes back into view before
  // its message is placed; the message (Field names it after its control, components/ui/field.tsx)
  // is then scrolled into view, and the root's scroll padding (app/_styles/start.css) keeps it
  // above a sticky ask. A Next that passes leaves no control marked invalid, so nothing moves; on
  // arrival the count is 0 and the heading keeps the focus.
  const [nexts, setNexts] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (nexts === 0) return
    const control = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")
    if (control === null || control === undefined) return
    control.focus()
    document
      .getElementById(`${control.id}-error`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [nexts])

  return (
    <form
      ref={formRef}
      noValidate
      aria-describedby={submitError === undefined ? undefined : errorId}
      // The root's scroll padding keeps a control the browser scrolls to clear of the row riding
      // at the foot, but for a text field browsers scroll only the caret's line into view and leave
      // the rest of the box and its ring under the ask (most of the description box in Safari). So
      // a control focused from the keyboard is lifted whole, by the box that draws its ring
      // (ringOf, above): the description's card, not the bare text area inside it, which left the
      // card's foot and ring under the ask at 390 by 664. start.css sets the padding only while
      // an ask rides the foot (below lg, on a screen at least 30rem tall) or the desk row does
      // (from lg), so reading it follows both and no breakpoint is repeated here. The heading is
      // left alone, since it takes focus on arrival while the page glides to the top, and so are
      // Back and the ask, which ride in view. A text field matches :focus-visible on a tap too and
      // is lifted then as well; a card or button pressed by a pointer does not, so it never moves
      // between press and release. The lift is instant: Firefox and Safari cancel a smooth scroll
      // with their own focus scroll, which follows this event.
      onFocus={(event) => {
        // React types a focus event's target as the form; focus bubbles up from the control.
        const target: EventTarget = event.target
        if (!(target instanceof HTMLElement) || target === headingRef.current) return
        if (target.closest('.start-actions, .start-ask') !== null) return
        if (!target.matches(':focus-visible')) return
        const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom)
        if (!(padding > 0)) return
        ringOf(target, event.currentTarget).scrollIntoView({
          block: 'nearest',
          behavior: 'instant',
        })
      }}
      onSubmit={(event) => {
        event.preventDefault()
        setNexts((count) => count + 1)
        const website = new FormData(event.currentTarget).get('website')
        onNext(typeof website === 'string' ? website : '')
      }}
      className="start-question flex w-full max-w-lg animate-question-in flex-col gap-6"
    >
      {/* A field for bots. Out of the tab order and hidden from assistive technology; a person
          never sees or fills it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {/* A title can carry the company's name, which may be one long word: it breaks inside the
          heading rather than widening the page's grid and scrolling a phone sideways. */}
      <div className="flex flex-col gap-3">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className={`${displayHeading} wrap-anywhere outline-none`}
        >
          {question.title(answers)}
        </h1>
        <p className={sectionLead}>{question.helper}</p>
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

      {submitError !== undefined && (
        <FieldError id={errorId} role="alert">
          {submitError}
        </FieldError>
      )}

      <div className="start-actions max-lg:contents lg:flex lg:items-start lg:justify-end lg:gap-3">
        {index > 0 && (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 self-start rounded-sm font-medium text-on-surface underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink disabled:cursor-not-allowed disabled:opacity-60 max-lg:order-last lg:mr-auto lg:h-12"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </button>
        )}
        <div className="start-ask flex flex-col gap-2 lg:items-end">
          <Button
            type="submit"
            variant="cta"
            size="lg"
            disabled={busy || uploading}
            className="w-full text-center max-lg:h-auto max-lg:min-h-12 max-lg:py-3 max-lg:whitespace-normal lg:w-auto"
          >
            {(busy || uploading) && (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            )}
            {uploading ? 'Uploading' : last ? 'Show me my three designs' : 'Next'}
          </Button>
          <p className="text-center text-small text-on-surface-muted lg:text-right">
            {SITE.reassurance}
          </p>
        </div>
      </div>
    </form>
  )
}
