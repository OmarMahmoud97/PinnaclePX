'use client'

import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react'
import { type Dispatch, useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { sectionLead } from '@/app/_components/section-styles'
import { emphasised } from '@/app/_components/words'
import {
  type BriefAction,
  type Errors,
  type SubmitError,
  validateQuestion,
} from '@/app/start/_components/brief-reducer'
import { failedPictureAt } from '@/app/start/_components/picture-holds'
import { hrefFor } from '@/app/start/_components/start-address'
import {
  CHANGE_IT,
  type HandOff,
  type Line,
  lineText,
  type Notice,
  QUESTIONS,
  type Receipt,
  receiptsFor,
  SENDING,
  TRY_AGAIN,
} from '@/app/start/_components/start-copy'
import { startHeading } from '@/app/start/_components/start-layout'
import { DescribeStep } from '@/app/start/_components/steps/describe-step'
import {
  type LaterSteps,
  preloadAfter,
  useStepChunk,
} from '@/app/start/_components/steps/later-steps'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import type { PictureUploads } from '@/app/start/_components/use-picture-uploads'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { textLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'
import { CONFIG } from '@/lib/config'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers, ColoursAnswer, DraftImagery } from '@/lib/brief/schema'
import { SITE } from '@/lib/site'

// An answer being hovered or focused but not yet chosen, drawn in the sketch over the real one.
export type Preview = Readonly<{ imagery?: DraftImagery; colours?: ColoursAnswer }>

// How far a send has got: waiting for pictures still on their way, then the answers on theirs.
export type Sending = 'uploads' | 'answers'

type Props = {
  index: number
  questionId: QuestionId
  answers: Answers
  errors: Errors
  dispatch: Dispatch<BriefAction>
  sending: Sending | null
  submitError: SubmitError | undefined
  // How the visit began and what the flow has to say, for the receipt under the title.
  handOff: HandOff
  notice: Notice | null
  pictures: PictureUploads
  onPreview: (preview: Preview | null) => void
  onBack: () => void
  // The value of the field no person sees, read from the form on submit.
  onNext: (website: string) => void
}

// The question leaving by the page's own Next, with the form's hidden field, or its own Back
// (plan 6.2's exit).
type Leaving = Readonly<{ way: 'next'; website: string }> | Readonly<{ way: 'back' }>

// The parts of a question that go quiet together while it leaves or while the brief is sent: the
// lead (the receipt and the helper), the controls, and Back. The ask is never one of them, since
// it keeps the focus; the part that holds the focus when the question starts to go stays live too.
type Part = 'lead' | 'controls' | 'back'

function partOf(element: Element | null): Part | null {
  const part = element?.closest('[data-part]')?.getAttribute('data-part')
  return part === 'lead' || part === 'controls' || part === 'back' ? part : null
}

// The box that draws a focused control's ring: the control itself, or the nearest box around it
// that takes the ring for it, as the description's well does by focus-within. The search stops at
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

// Words with the visitor's own set apart and isolated, so a name in another script never turns
// the sentence around it (docs/start-page-journey-plan.md, 7.7).
function Words({ line, echoClassName }: { line: Line; echoClassName?: string }) {
  return (
    <>
      {line.before}
      {line.echo !== '' && <bdi className={echoClassName}>{line.echo}</bdi>}
      {line.after}
    </>
  )
}

// A notice is news, so a screen reader is told it as the question arrives: its words follow a
// frame late into a status line already in the page, which is how a live region is heard.
function Said({ text }: { text: string }) {
  const [said, setSaid] = useState('')
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSaid(text)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [text])
  return <span role="status">{said}</span>
}

type ReceiptProps = { receipt: Receipt; onChange: () => void; inert: boolean }

// The receipt under the title (plan D6): what the last answer set, or the flow's notice, in the
// DOM where it shows, between the title and the card. Where it shows is start.css's to decide,
// by data-place, so the server's markup and every width agree. Its link goes back to the sentence.
function ReceiptLine({ receipt, onChange, inert }: ReceiptProps) {
  return (
    <p
      data-place={receipt.place}
      data-rise="lead"
      data-part="lead"
      inert={inert}
      className="start-receipt text-sm font-medium wrap-anywhere text-on-surface-muted"
    >
      {receipt.news ? (
        <Said text={lineText(receipt.line)} />
      ) : (
        <Words line={receipt.line} echoClassName="font-semibold" />
      )}
      {receipt.change && (
        <>
          {' '}
          <a
            href={hrefFor({ kind: 'question', index: 0 })}
            onClick={(event) => {
              event.preventDefault()
              onChange()
            }}
            className={textLinkStyles}
          >
            {CHANGE_IT}
          </a>
        </>
      )}
    </p>
  )
}

// Whether a Next from this question moves on: every answer valid and no picture of its own
// failed, as the flow will find it (brief-flow.tsx), so the exit plays only for a Next that leaves.
function movesOn(id: QuestionId, answers: Answers, pictures: PictureUploads): boolean {
  return (
    Object.keys(validateQuestion(id, answers)).length === 0 &&
    failedPictureAt(id, pictures) === null
  )
}

// One question: its title and the receipt under it on the ground, then a card holding the helper,
// its controls, Back and the ask (docs/start-page-journey-plan.md, 4.4 and 5.7). Mounted afresh for
// every question, so the heading takes focus and the question enters each time: the form by its
// opacity alone, since it holds the title and the ask riding the foot, then the lead and the
// controls rising in turn (plan 6.2, app/_styles/start.css). The progress is the header island's
// alone, live at every width, so the form carries no second copy of it.
//
// A later question opens once the chunk with its step is here (steps/later-steps.tsx), so it never
// shows without its controls; until then the skeleton's bars hold its place (Waiting, below). A
// chunk that will not come leaves the question with a way to fetch it again in their place, and
// the ask waits for them.
//
// A Next that moves on, and the page's own Back, first play the question's exit: the lead and the
// controls fade and slip the way the visitor is going, the part that holds the focus keeps it, the
// ask says it is busy rather than letting go of the focus, and the rest go inert; the flow moves
// on when the exit is over. A second press meanwhile does nothing. The browser's own Back and
// Forward skip it. The part that kept the focus stays live, so an answer can still change in the
// exit; if the flow then refuses the Next, the question comes back with the focus on what is wrong. While the brief is sent the same parts go inert, the ask keeping the focus and
// saying "Sending", and they come back if the send fails (plan 4.8).
//
// The hooks app/_styles/start.css reads: start-question on the form (data-question names it, for
// the lamp; data-leaving marks the exit), start-card on the card, data-rise on what rises,
// start-actions on the actions row, which from lg is a box of its own riding at the foot of a desk
// window shorter than the question, start-back on Back's well, and start-ask on the ask's, which
// rides at the foot of the screen below lg on a screen at least 30rem tall. Below lg the actions
// row has no box of its own (display: contents), so Back and the ask are the card's own items: a
// sticky box cannot leave its parent, and the card spans the whole question, which is what lets
// the ask ride at the foot and fall back into place at the end. There Back is a round button
// beside the ask, riding with it, and under a full-width ask below 22.5rem. Back comes first in
// the tab order, as it is first in the row. Each ask names the step it leads to, and the line
// under it says what the visitor gets (plan 4.6).
export function QuestionPane(props: Props) {
  const chunk = useStepChunk(props.questionId)
  if (chunk.kind === 'loading') return <Waiting questionId={props.questionId} />
  return chunk.kind === 'ready' ? (
    <Question {...props} steps={chunk.steps} retry={null} />
  ) : (
    <Question {...props} steps={null} retry={chunk.retry} />
  )
}

// What holds a later question's place while its step is on its way: the skeleton's bars
// (start-skeleton.tsx), so main never empties between the skeleton and the question on an arrival
// at a later one (the hero's hand-off, a refresh, a kept draft), and the question's name, so the
// lamp (start.css) has already walked to it when the question comes.
function Waiting({ questionId }: { questionId: QuestionId }) {
  return (
    <div
      aria-hidden="true"
      data-question={questionId}
      className="flex w-full max-w-lg flex-col gap-6"
    >
      <span className="h-10 w-3/4 rounded-2xl bg-surface-wash-deep" />
      <span className="h-4 w-2/3 rounded-full bg-surface-wash-deep" />
      <span className="h-28 w-full rounded-2xl bg-surface-wash-deep" />
    </div>
  )
}

type QuestionProps = Props & {
  // The later questions' steps, once their chunk is here; the first question needs none.
  steps: LaterSteps | null
  // How to fetch the chunk again, once it has failed.
  retry: (() => void) | null
}

function Question({
  index,
  questionId,
  answers,
  errors,
  dispatch,
  sending,
  submitError,
  handOff,
  notice,
  pictures,
  onPreview,
  onBack,
  onNext,
  steps,
  retry,
}: QuestionProps) {
  const errorId = useId()
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const askRef = useRef<HTMLButtonElement>(null)
  const question = QUESTIONS[questionId]
  const receipts = receiptsFor(questionId, { answers, handOff, notice })
  const busy = sending !== null
  const ask =
    sending === 'uploads' ? SENDING.uploads : sending === 'answers' ? SENDING.ask : question.ask

  // Every Next on this question is counted, and after each one the focus moves to the first
  // control still marked invalid, if there is one (the effect below).
  const [nexts, setNexts] = useState(0)

  // The exit, and the part that held the focus when the question started to go quiet. The flow
  // moves on once the exit is over, with what it holds then; a Back of the browser's own unmounts
  // the question first, and the move is called off. A Next is checked again as the exit ends, by
  // the same test the flow makes with the same answers: if it will not move on, the flow marks
  // what is wrong and the question comes back, counted as a Next so the focus goes there. If it
  // will, the exit is left in place: Next moves the address in a transition, a commit behind the
  // flow's own state, and a question brought back meanwhile would flash up before it unmounts.
  const [leaving, setLeaving] = useState<Leaving | null>(null)
  const [held, setHeld] = useState<Part | null>(null)
  const still = leaving !== null || busy
  const quiet = (part: Part) => still && held !== part
  const endExit = useEffectEvent((exit: Leaving) => {
    if (exit.way === 'back') {
      onBack()
      return
    }
    const refused = !movesOn(questionId, answers, pictures)
    onNext(exit.website)
    if (!refused) return
    setLeaving(null)
    setHeld(null)
    setNexts((count) => count + 1)
  })
  useEffect(() => {
    if (leaving === null) return
    const timer = window.setTimeout(() => {
      endExit(leaving)
    }, CONFIG.start.exitMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [leaving])

  function leave(exit: Leaving) {
    if (still) return
    setHeld(partOf(document.activeElement))
    setLeaving(exit)
  }

  // A later question whose chunk would not come has no controls to answer, so its ask waits for
  // them rather than checking answers the visitor cannot see.
  const blocked = still || retry !== null

  // The step after this one is fetched while this one is answered (steps/later-steps.tsx).
  useEffect(() => {
    preloadAfter(index)
  }, [index])

  // After each Next the focus moves to the first control still marked invalid, if there is one.
  // Left on the ask, a screen reader hears none of the messages, and below lg the ask riding at
  // the foot covers them on a short phone. The focused control reads its message through
  // aria-describedby. Focus comes first, so a field above the screen comes back into view before
  // its message is placed; the message (Field names it after its control, components/ui/field.tsx)
  // is then scrolled into view, and the root's scroll padding (app/_styles/start.css) keeps it
  // above a sticky ask. A Next that passes leaves no control marked invalid, so nothing moves; on
  // arrival the count is 0 and the heading keeps the focus.
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

  const last = index === QUESTION_IDS.length - 1

  return (
    <form
      ref={formRef}
      noValidate
      data-question={questionId}
      data-leaving={leaving?.way}
      // The root's scroll padding keeps a control the browser scrolls to clear of the row riding
      // at the foot, but for a text field browsers scroll only the caret's line into view and leave
      // the rest of the box and its ring under the ask (most of the description box in Safari). So
      // a control focused from the keyboard is lifted whole, by the box that draws its ring
      // (ringOf, above): the description's well, not the bare text area inside it, which left the
      // well's foot and ring under the ask at 390 by 664. start.css sets the padding only while
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
        if (target.closest('.start-actions, .start-ask, .start-back') !== null) return
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
        if (blocked) return
        setNexts((count) => count + 1)
        const website = new FormData(event.currentTarget).get('website')
        const value = typeof website === 'string' ? website : ''
        if (last) {
          // The send keeps the focus on the ask, wherever the press came from (plan 4.8).
          askRef.current?.focus()
          setHeld(null)
          onNext(value)
        } else if (movesOn(questionId, answers, pictures)) {
          leave({ way: 'next', website: value })
        } else {
          onNext(value)
        }
      }}
      className="start-question flex w-full max-w-lg flex-col"
    >
      {/* A field for bots. Out of the tab order and hidden from assistive technology; a person
          never sees or fills it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <h1 ref={headingRef} tabIndex={-1} className={`${startHeading} outline-none`}>
          {emphasised(question.title, question.emphasis)}
        </h1>
        {receipts.map((receipt) => (
          <ReceiptLine
            key={receipt.place}
            receipt={receipt}
            inert={quiet('lead')}
            onChange={() => {
              leave({ way: 'back' })
            }}
          />
        ))}
      </div>

      <div className="start-card">
        {/* The helper can carry the business name, which may be one long word: it breaks inside
            its box rather than widening the page's grid and scrolling a phone sideways. Where the
            hero's hand-off stands in for the helper, the helper yields its place (start.css). */}
        <p
          data-yields={receipts.some((receipt) => receipt.place === 'narrow') ? '' : undefined}
          data-rise="lead"
          data-part="lead"
          inert={quiet('lead')}
          className={`start-helper ${sectionLead} wrap-anywhere`}
        >
          <Words line={question.helper(answers)} />
        </p>

        <div data-rise="controls" data-part="controls" inert={quiet('controls')}>
          {retry !== null && (
            <button type="button" onClick={retry} className={`${textLinkStyles} cursor-pointer`}>
              {TRY_AGAIN}
            </button>
          )}
          {questionId === 'describe' && (
            <DescribeStep answers={answers} errors={errors} dispatch={dispatch} />
          )}
          {questionId === 'brand' && steps !== null && (
            <steps.BrandStep
              answers={answers}
              errors={errors}
              dispatch={dispatch}
              logo={pictures.logo}
              mark={pictures.mark}
              unreadable={pictures.unreadable}
              onMark={pictures.chooseMark}
              onFile={pictures.handleLogoFile}
              onRetry={pictures.retry}
            />
          )}
          {questionId === 'imagery' && steps !== null && (
            <steps.ImageryStep
              answers={answers}
              errors={errors}
              dispatch={dispatch}
              photos={pictures.photos}
              onFiles={pictures.handlePhotoFiles}
              onRemovePhoto={pictures.removePhoto}
              onRetry={pictures.retry}
              onPreview={(value) => {
                onPreview(value === null ? null : { imagery: value })
              }}
            />
          )}
          {questionId === 'colours' && steps !== null && (
            <steps.ColoursStep
              answers={answers}
              errors={errors}
              dispatch={dispatch}
              logoColour={pictures.logo?.accent ?? null}
              onPreview={(value) => {
                onPreview(value === null ? null : { colours: value })
              }}
            />
          )}
          {questionId === 'details' && steps !== null && (
            <steps.DetailsStep answers={answers} errors={errors} dispatch={dispatch} />
          )}
        </div>

        {/* Why the brief did not go, which the ask names as its description; once the day's
            sends are spent, the call is offered with it (plan 4.8). */}
        {submitError !== undefined && (
          <FieldError id={errorId} role="alert">
            <span>
              {submitError.message}
              {submitError.call && (
                <>
                  {' '}
                  <a
                    href={SITE.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      trackEvent('call_click', { location: 'brief-send' })
                    }}
                    className={textLinkStyles}
                  >
                    {BOOK_CALL.label}
                    <span className="sr-only"> {SITE.newTab}</span>
                  </a>
                </>
              )}
            </span>
          </FieldError>
        )}

        {/* Said once while the send waits for a picture and once as the brief goes (plan 9.2); the
            pane, and this line, go at done. */}
        <p role="status" className="sr-only">
          {sending === 'answers'
            ? SENDING.status
            : sending === 'uploads'
              ? SENDING.uploadsStatus
              : ''}
        </p>

        <div className="start-actions">
          {index > 0 && (
            <div className="start-back" data-part="back" inert={quiet('back')}>
              <button
                type="button"
                onClick={() => {
                  leave({ way: 'back' })
                }}
                className="start-back-button inline-flex cursor-pointer items-center gap-2 font-medium text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
                <span className="start-back-label sr-only">Back</span>
              </button>
            </div>
          )}
          <div className="start-ask flex flex-col gap-2 lg:items-end">
            <Button
              ref={askRef}
              type="submit"
              variant="cta"
              size="lg"
              aria-disabled={blocked ? true : undefined}
              aria-describedby={submitError === undefined ? undefined : errorId}
              // The ask wraps below xl: from lg a question's column is a share of the screen,
              // and "Show me my three designs" on one line was wider than the column at 1024,
              // where it pushed the split over and the board with it (start-layout.ts).
              // Below lg the ask is full width, so its side padding only sets where the label
              // wraps: at the size's 32 px it had 210 px at 390 wide, and Linux Chromium sets the
              // send's label at 211 px (Windows 202), so CI's ask stood two lines tall and 24 px
              // higher than the plan's arrival rule allows (ADR 0037, seventh amendment). 12 px
              // keeps the label on one line from 320 wide in every engine.
              className="w-full text-center max-xl:h-auto max-xl:min-h-12 max-xl:py-3 max-xl:whitespace-normal max-lg:px-3 lg:w-auto"
            >
              {busy && <LoaderCircle aria-hidden="true" className="start-spinner size-4" />}
              {ask}
              {!busy && <ArrowRight aria-hidden="true" className="size-5 shrink-0" />}
            </Button>
            <p className="text-center text-small text-balance text-on-surface-muted lg:text-right">
              {question.under}
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
