'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { submitBrief } from '@/app/start/_components/actions'
import { BriefDone } from '@/app/start/_components/brief-done'
import {
  briefReducer,
  firstInvalidIndex,
  INITIAL_STATE,
  isLastQuestion,
  questionAt,
  validateQuestion,
} from '@/app/start/_components/brief-reducer'
import { type Preview, QuestionPane } from '@/app/start/_components/question-pane'
import { StartChrome } from '@/app/start/_components/start-chrome'
import { StartSkeleton } from '@/app/start/_components/start-skeleton'
import { usePictureUploads } from '@/app/start/_components/use-picture-uploads'
import { BriefSketch } from '@/components/sketch/brief-sketch'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { SketchChips } from '@/components/sketch/sketch-chips'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import { trackEvent } from '@/lib/analytics/events'
import { clearDraft, writeDraft } from '@/lib/brief/draft'
import { readDraft } from '@/lib/brief/read-draft'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { cn } from '@/lib/cn'

const DONE = 'done'
const LAST = QUESTION_IDS.length - 1

type Target = number | typeof DONE

// ?q=1..5 or ?q=done. Anything else is the first question.
function requestedFrom(param: string | null): Target {
  if (param === DONE) return DONE
  const n = Number(param)
  return Number.isInteger(n) && n >= 1 && n <= QUESTION_IDS.length ? n - 1 : 0
}

function hrefFor(target: Target): `/start?q=${string}` {
  return `/start?q=${target === DONE ? DONE : String(target + 1)}`
}

// useSyncExternalStore needs a subscribe function; hydration never changes again, so it is inert.
const subscribeToNothing = () => () => {
  // nothing to unsubscribe
}

// The server and the first client render show the skeleton; the real flow mounts once the
// browser can read the URL and its own storage, so nothing about the answers is ever guessed.
export function BriefFlow() {
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )
  const draft = useMemo(() => (hydrated ? readDraft() : null), [hydrated])
  if (!hydrated) return <StartSkeleton />
  return <Flow initialAnswers={draft} />
}

function Flow({ initialAnswers }: { initialAnswers: Answers | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requested = requestedFrom(searchParams.get('q'))

  const [state, dispatch] = useReducer(briefReducer, initialAnswers, (answers) =>
    answers === null ? INITIAL_STATE : briefReducer(INITIAL_STATE, { type: 'hydrate', answers }),
  )
  const { answers, errors, status, submitError } = state
  const { logo, photos, handleLogoFile, handlePhotoFiles, removePhoto } = usePictureUploads(
    answers,
    dispatch,
  )
  // When the form was opened, so the server can tell a person's pace from a bot's. Read in an
  // effect, because the clock is not for rendering.
  const openedAt = useRef(0)
  useEffect(() => {
    openedAt.current = Date.now()
  }, [])
  const [preview, setPreview] = useState<Preview | null>(null)

  const done = status.kind === 'done'
  const showDone = done && requested === DONE
  const current = Math.min(requested === DONE ? LAST : requested, firstInvalidIndex(answers))
  const questionId = questionAt(current)
  const busy = status.kind === 'submitting'

  useEffect(() => {
    if (!done) writeDraft(answers)
  }, [done, answers])

  // A URL past the first unanswered question, or ?q=done with nothing submitted, is corrected.
  useEffect(() => {
    const allowed: Target = showDone ? DONE : current
    if (requested !== allowed) router.replace(hrefFor(allowed), { scroll: false })
  }, [requested, current, showDone, router])

  const go = useCallback(
    (target: Target) => {
      dispatch({ type: 'clear-errors' })
      setPreview(null)
      router.push(hrefFor(target), { scroll: false })
    },
    [router],
  )

  async function next(website: string) {
    if (busy) return
    if (Object.keys(validateQuestion(questionId, answers)).length > 0) {
      dispatch({ type: 'check', question: questionId })
      trackEvent('brief_error', { step: current + 1, reason: 'invalid' })
      return
    }
    if (!isLastQuestion(current)) {
      trackEvent('brief_step', { step: current + 1 })
      go(current + 1)
      return
    }
    dispatch({ type: 'submitting' })
    const result = await submitBrief({
      answers,
      openedForMs: Date.now() - openedAt.current,
      website,
    })
    if (result.ok) {
      dispatch({ type: 'submitted', submitted: result.value })
      clearDraft()
      trackEvent('brief_complete', { step: current + 1 })
      go(DONE)
    } else {
      dispatch({ type: 'submit-failed', message: result.reason })
      trackEvent('brief_error', { step: current + 1, reason: 'server' })
    }
  }

  const uploading =
    (questionId === 'logo' && logo?.status === 'uploading') ||
    (questionId === 'imagery' && photos.some((photo) => photo.status === 'uploading'))

  const answered = showDone ? QUESTION_IDS.length : current
  const stage = Math.min(answered + 1, QUESTION_IDS.length)
  const model = sketchModelFrom({ ...answers, ...preview }, stage, {
    logo: logo?.url ?? null,
    photos: photos.map((photo) => photo.url),
  })

  return (
    <div className="flex min-h-dvh flex-col">
      <StartChrome current={stage} total={QUESTION_IDS.length} />

      <div className="grid flex-1 lg:grid-cols-[46fr_54fr]">
        <section
          aria-label="Your brief so far"
          style={model.vars}
          className="relative isolate order-first flex flex-col items-center gap-3 overflow-hidden border-b border-border bg-surface-muted px-4 pt-4 pb-3 lg:order-last lg:justify-center lg:border-b-0 lg:border-l lg:px-12 lg:py-16"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-1 bg-[radial-gradient(var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_72%)] bg-[size:22px_22px]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-1 bg-radial-[at_50%_85%] from-(--sketch-glow) to-transparent to-65% transition-colors duration-700"
          />
          <div className="max-h-52 w-full max-w-2xl overflow-hidden mask-[linear-gradient(to_bottom,black_80%,transparent)] lg:max-h-none lg:overflow-visible lg:mask-none">
            <BriefSketch model={model} />
          </div>
          <p className={cn('hidden text-center lg:block', captionStyles)}>{SKETCH_CAPTION.yours}</p>
          {showDone && (
            <p className="hidden max-w-sm text-center text-sm font-medium text-balance lg:block">
              This is a sketch from five answers. Imagine what an hour does.
            </p>
          )}
          <SketchChips answers={answers} answered={answered} />
        </section>

        <main
          id="main"
          className="flex flex-col items-center px-4 py-8 sm:px-8 lg:items-start lg:justify-center lg:px-16 lg:py-16"
        >
          {showDone ? (
            <BriefDone name={answers.name} email={answers.email} submitted={status} />
          ) : (
            <QuestionPane
              key={questionId}
              index={current}
              questionId={questionId}
              answers={answers}
              errors={errors}
              dispatch={dispatch}
              busy={busy}
              uploading={uploading}
              submitError={submitError}
              logo={logo}
              onLogoFile={handleLogoFile}
              photos={photos}
              onPhotoFiles={handlePhotoFiles}
              onRemovePhoto={removePhoto}
              onPreview={setPreview}
              onBack={() => {
                go(current - 1)
              }}
              onNext={(website) => {
                void next(website)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
