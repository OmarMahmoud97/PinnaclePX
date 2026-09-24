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
import { SketchPane } from '@/app/start/_components/sketch-pane'
import { StartChrome } from '@/app/start/_components/start-chrome'
import {
  startGrid,
  startMain,
  startMainAsking,
  startMainDone,
} from '@/app/start/_components/start-layout'
import { StartSkeleton } from '@/app/start/_components/start-skeleton'
import { usePictureUploads } from '@/app/start/_components/use-picture-uploads'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { trackEvent } from '@/lib/analytics/events'
import { clearDraft, writeDraft } from '@/lib/brief/draft'
import { readDraft } from '@/lib/brief/read-draft'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'

const DONE = 'done'
const LAST = QUESTION_IDS.length - 1

type Target = number | typeof DONE

// Which way the visitor last moved between questions: Back enters from the left.
type Direction = 'next' | 'back'

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

  // The direction comes from the change of the question index, compared while rendering (React's
  // pattern for a value drawn from the previous render), so the browser's own Back button enters
  // from the left too, and the question arrives in the same commit as its direction. Nothing is
  // set on the first question shown, which enters as it always has.
  const [step, setStep] = useState<{ index: number; dir: Direction | undefined }>({
    index: current,
    dir: undefined,
  })
  if (step.index !== current) {
    setStep({ index: current, dir: current < step.index ? 'back' : 'next' })
  }

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

  // main comes first in the DOM and the region second (start-layout.ts). Once the brief is sent
  // main joins the ink, so the whole page is the foot, as the home page ends: its ground
  // crossfades from the wash, and the island reads the new dark scope as it appears. main also
  // drops the curve's clearance below lg then, because the region no longer hangs its curve.
  return (
    <>
      <StartChrome current={stage} total={QUESTION_IDS.length} done={showDone} />

      <div className={startGrid}>
        <main
          id="main"
          data-theme={showDone ? 'dark' : undefined}
          data-dir={step.dir}
          className={`${startMain} ${showDone ? startMainDone : startMainAsking}`}
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

        <SketchPane model={model} answers={answers} answered={answered} done={showDone} />
      </div>
    </>
  )
}
