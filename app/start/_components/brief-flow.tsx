'use client'

import { useSearchParams } from 'next/navigation'
import {
  type CSSProperties,
  useEffect,
  useEffectEvent,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { submitBrief } from '@/app/start/_components/actions'
import {
  arrivalView,
  type BriefState,
  briefReducer,
  hasProgress,
  isLastQuestion,
  questionAt,
  restoredState,
  validateQuestion,
  viewFor,
} from '@/app/start/_components/brief-reducer'
import { type Build, DoneBoundary, preloadDone } from '@/app/start/_components/done-boundary'
import {
  clearPending,
  doneDetailsFrom,
  forgetSubmission,
  forgetSubmissions,
  liveSubmission,
  markPending,
  rememberSend,
  sendPending,
} from '@/app/start/_components/done-storage'
import { bandHueOf, bandHueOfHex } from '@/app/start/_components/draft/draft-model'
import { type Preview, QuestionPane, type Sending } from '@/app/start/_components/question-pane'
import { type Bloom, SendBloom } from '@/app/start/_components/send-bloom'
import { failureOf, outcomeOf, sendBrief } from '@/app/start/_components/send-brief'
import { SketchPane } from '@/app/start/_components/sketch-pane'
import {
  correctionFor,
  leaveOnBack,
  markArrival,
  type Params,
  pushView,
  replaceAddress,
  replaceView,
  requestedFrom,
  stepBack,
  type View,
} from '@/app/start/_components/start-address'
import { failedPictureAt, sendHold } from '@/app/start/_components/picture-holds'
import { StartChrome } from '@/app/start/_components/start-chrome'
import { type HandOff, type Notice, questionTitle } from '@/app/start/_components/start-copy'
import {
  startGrid,
  startMain,
  startMainAsking,
  startMainDone,
} from '@/app/start/_components/start-layout'
import { StartSkeleton } from '@/app/start/_components/start-skeleton'
import { useDocumentTitle } from '@/app/start/_components/use-document-title'
import { usePictureUploads } from '@/app/start/_components/use-picture-uploads'
import { trackEvent } from '@/lib/analytics/events'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { clearDraft, forgetCarried, writeDraft } from '@/lib/brief/draft'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import { readCarried, readDraft } from '@/lib/brief/read-draft'
import { isSentenceComplete } from '@/lib/brief/sentence'
import { CONFIG } from '@/lib/config'

const TOTAL = QUESTION_IDS.length

// Which way the visitor last moved between questions: Back enters from the left.
type Direction = 'next' | 'back'

// How this page load began, for brief_view (docs/start-page-journey-plan.md, 8.5): the hero's
// sentence, a draft this tab kept, bare /start (the header's ask and the closing call), or an
// address with a question in it.
type Entry = 'hero' | 'resume' | 'ask' | 'direct'

// What the flow finds when it mounts, read once: this tab's draft with the hero's sentence merged
// over it (plan D4), what bare /start resolves to (plan 7.4), the live submission it opened if
// the address was bare, and whether a send was in flight when the page was left.
type Arrival = Readonly<{
  state: BriefState
  view: View
  opened: string | null
  carried: string | null
  handOff: HandOff
  entry: Entry
  pending: boolean
}>

function readArrival(params: Params): Arrival {
  const draft = readDraft()
  const carried = readCarried()
  const state = restoredState(draft, carried)
  const bare = requestedFrom(params).kind === 'arrival'
  const view = arrivalView(state, liveSubmission()?.slug ?? null)
  const entry: Entry =
    carried !== null ? 'hero' : draft !== null ? 'resume' : bare ? 'ask' : 'direct'
  return {
    state,
    view,
    opened: bare && view.kind === 'done' ? view.slug : null,
    carried,
    handOff: carried === null ? 'none' : isSentenceComplete(carried) ? 'sentence' : 'short',
    entry,
    pending: sendPending(),
  }
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
  if (!hydrated) return <StartSkeleton />
  return <Flow />
}

function Flow() {
  const searchParams = useSearchParams()
  const requested = requestedFrom(searchParams)
  const [arrival] = useState(() => readArrival(searchParams))
  const [state, dispatch] = useReducer(briefReducer, arrival.state)
  const { answers, reached, errors, status, submitError } = state
  const [preview, setPreview] = useState<Preview | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  // A reload during a send lands back on the last question, which says the brief may be on its
  // way (plan 7.3). Said on that question only: moving on or sending lets it go for the page load.
  const [pendingToSay, setPendingToSay] = useState(arrival.pending)
  // The done view being left by a Back (start-address.ts, leaveOnBack), held on screen while the
  // browser travels past the questions behind it.
  const [leaving, setLeaving] = useState<View | null>(null)

  const view = leaving ?? viewFor(requested, state, arrival.view)
  const questionIndex = view.kind === 'question' ? view.index : null
  const questionId: QuestionId | null = questionIndex === null ? null : questionAt(questionIndex)
  const doneSlug = view.kind === 'done' ? view.slug : null

  // This tab's own send, when done shows it. Its answers stay in memory and draw the finished
  // sketch; a done view this tab did not send (restored: a refresh, a pasted link, the email's)
  // has none to draw, so its region draws no draft and takes the build's colour from the poll.
  const own = status.kind === 'done' && status.submitted.slug === doneSlug ? status : null
  const restored = doneSlug !== null && own === null
  const shown = restored ? BLANK_ANSWERS : answers
  const pictures = usePictureUploads(shown, dispatch)
  const { logo, photos } = pictures

  // What the last ask would do with the pictures as they stand (picture-holds.ts): send, wait for
  // one still on its way, which the ask shows as "Finishing your uploads", or refuse while one has
  // failed.
  const hold = sendHold(pictures)
  const sending: Sending | null =
    status.kind === 'submitting' ? 'answers' : status.kind === 'waiting' ? 'uploads' : null
  const busy = sending !== null

  // The ink the send blooms from the ask (send-bloom.tsx): held while the brief is on its way,
  // then run on over the page or drained, and gone once it has played.
  const [ending, setEnding] = useState<Exclude<Bloom, 'hold'> | null>(null)
  const bloom: Bloom | null = status.kind === 'submitting' ? 'hold' : ending
  // The region's place for the designs, which the done view fills beside the draft.
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  // How the build on show stands, as the done view's poll last found it, for the page's light:
  // the ink while it builds, light once it can be opened, dimmed if it ended without designs; and
  // its colour, for a restored view's region.
  const [built, setBuilt] = useState<Readonly<{ slug: string; build: Build | null }> | null>(null)

  // When the form was opened, so the server can tell a person's pace from a bot's, and the mark
  // on the entry the visitor arrived on. Both in an effect: neither is for rendering.
  const openedAt = useRef(0)
  useEffect(() => {
    openedAt.current = Date.now()
    markArrival()
  }, [])

  // The direction comes from the change of the question index, compared while rendering (React's
  // pattern for a value drawn from the previous render), so the browser's own Back button enters
  // from the left too, and the question arrives in the same commit as its direction. Nothing is
  // set on the first question shown, which enters as it always has.
  const [step, setStep] = useState<{ index: number | null; dir: Direction | undefined }>({
    index: questionIndex,
    dir: undefined,
  })
  if (step.index !== questionIndex) {
    const back = questionIndex !== null && step.index !== null && questionIndex < step.index
    setStep({ index: questionIndex, dir: back ? 'back' : 'next' })
    setPendingToSay(false)
    // A send waiting for a picture belongs to the last question: leaving it by the browser's own
    // Back calls it off, so the brief never goes from a question the visitor has left.
    if (status.kind === 'waiting') dispatch({ type: 'cancel-wait' })
  }

  // The hero's sentence is merged once; its key goes, so a refresh reads the draft instead.
  useEffect(() => {
    if (arrival.carried === null) return
    forgetCarried()
    trackEvent('sentence_carried', { valid: isSentenceComplete(arrival.carried) })
  }, [arrival.carried])

  // A draft is kept while there is anything in it, and goes with the send (plan 7.3).
  const sent = status.kind === 'done'
  useEffect(() => {
    if (!sent && hasProgress(answers, reached)) writeDraft(answers, reached)
    else clearDraft()
  }, [sent, answers, reached])

  // An address that shows something else is corrected in place: a question past what the draft
  // allows, bare /start resolved to where the visitor left off or to a live submission, or a done
  // link cut short.
  const correction = leaving === null ? correctionFor(requested, view) : null
  useEffect(() => {
    if (correction !== null) replaceAddress(correction)
  }, [correction])

  // The tab names the question, as it names the build at done (done-boundary.tsx).
  useDocumentTitle(questionId === null ? null : questionTitle(questionId), 'question')

  // Each question seen, once per page load, by its id and how the visit began.
  const viewed = useRef(new Set<QuestionId>())
  useEffect(() => {
    if (questionId === null || viewed.current.has(questionId)) return
    viewed.current.add(questionId)
    trackEvent('brief_view', { question: questionId, entry: arrival.entry })
  }, [questionId, arrival.entry])

  // The done view's chunk is fetched while the last question is answered, so a send rarely waits
  // for it. A failure here is met again, and shown, at done.
  const last = questionIndex !== null && isLastQuestion(questionIndex)
  useEffect(() => {
    if (last) preloadDone().catch(() => undefined)
  }, [last])

  // One Back from done leaves /start (plan D32).
  useEffect(() => {
    if (doneSlug === null) return
    const done: View = { kind: 'done', slug: doneSlug }
    return leaveOnBack(done, (away) => {
      setLeaving(away ? done : null)
    })
  }, [doneSlug])

  function leaveQuestion() {
    dispatch({ type: 'clear-errors' })
    setPreview(null)
    setNotice(null)
  }

  // The brief on its way (plan 4.8): the ink holds while the send waits out what is left of the
  // floor a person's pace clears and then the server's answer, for as long as the timeout allows.
  // A reload meanwhile finds the pending mark. The ink runs on into the done view, or drains back
  // to the question with the reason on the ask.
  async function send(question: QuestionId, website: string) {
    dispatch({ type: 'submitting' })
    markPending()
    const result = await sendBrief({
      submit: () => submitBrief({ answers, openedForMs: Date.now() - openedAt.current, website }),
      waitMs: CONFIG.form.minMs - (Date.now() - openedAt.current),
      timeoutMs: CONFIG.start.send.timeoutMs,
    })
    clearPending()
    if (!result.ok) {
      setEnding('drain')
      dispatch({ type: 'submit-failed', error: failureOf(result.reason) })
      trackEvent('brief_error', { question, reason: 'server' })
      trackEvent('send_outcome', { outcome: outcomeOf(result.reason) })
      return
    }
    setEnding('complete')
    const details = doneDetailsFrom(answers, result.value.slug)
    rememberSend(details, result.value)
    dispatch({ type: 'submitted', submitted: result.value, details })
    trackEvent('brief_complete', { step: TOTAL })
    replaceView({ kind: 'done', slug: result.value.slug })
  }

  // The last ask, pressed or waited out. A picture that failed stops the brief here, whenever it
  // failed, with which one and the question to go back to.
  function release(question: QuestionId, website: string) {
    switch (hold.kind) {
      case 'refuse':
        dispatch({ type: 'submit-failed', error: { message: hold.message, call: false } })
        trackEvent('brief_error', { question, reason: 'invalid' })
        trackEvent('send_outcome', { outcome: 'validation' })
        return
      case 'wait':
        dispatch({ type: 'wait', website })
        return
      case 'go':
        void send(question, website)
    }
  }

  // A waiting send goes on once no picture is still on its way.
  const releaseWaiting = useEffectEvent((website: string) => {
    if (questionId !== null) release(questionId, website)
  })
  const settled = hold.kind !== 'wait'
  useEffect(() => {
    if (status.kind === 'waiting' && settled) releaseWaiting(status.website)
  }, [status, settled])

  function next(website: string) {
    if (busy || questionIndex === null || questionId === null) return
    const failedPicture = failedPictureAt(questionId, pictures)
    if (Object.keys(validateQuestion(questionId, answers)).length > 0 || failedPicture !== null) {
      dispatch({ type: 'check', question: questionId })
      if (failedPicture !== null) {
        dispatch({
          type: 'reject-file',
          field: questionId === 'brand' ? 'logo' : 'imagery',
          message: failedPicture,
        })
      }
      trackEvent('brief_error', { question: questionId, reason: 'invalid' })
      return
    }
    if (isLastQuestion(questionIndex)) {
      setNotice(null)
      setPendingToSay(false)
      release(questionId, website)
      return
    }
    trackEvent('brief_step', { question: questionId })
    leaveQuestion()
    dispatch({ type: 'reach', index: questionIndex + 1 })
    // Bare /start takes its question's address as the visitor moves on, so Back comes to ?q=1.
    if (requested.kind === 'arrival') replaceView({ kind: 'question', index: questionIndex })
    pushView({ kind: 'question', index: questionIndex + 1 }, questionIndex)
  }

  // A new brief: the answers go back to blank, and the pictures picked for the last one go with
  // them, so question two opens on the name again.
  function restart() {
    dispatch({ type: 'restart' })
    pictures.reset()
  }

  // A missing poll (plan 7.4, rule 5): the browser forgets the submission and the visitor lands on
  // the first question, told the designs have expired if this browser sent them, or that the link
  // was not found if it never knew it. This tab's own send is let go too, so it can send again.
  function handleMissing(slug: string, kept: boolean) {
    forgetSubmission(slug)
    if (own !== null) restart()
    setNotice(kept ? 'expired' : 'notFound')
    replaceView({ kind: 'question', index: 0 })
  }

  function startAgain() {
    forgetSubmissions()
    restart()
    setNotice(null)
    trackEvent('new_brief', {})
    pushView({ kind: 'question', index: 0 }, undefined)
  }

  // How far the draft and its region's sentence have got: the question showing, all five for
  // this tab's own send, and none for a done view it did not send, which draws the draft blank.
  const answered = questionIndex ?? (own === null ? 0 : TOTAL)
  const done = doneSlug !== null
  // The ink of a send the server took, still running on over the page, which the done view waits
  // under until it is whole (start-done.css).
  const arriving = done && bloom === 'complete'
  const noticeShown = notice ?? (pendingToSay && last ? 'pending' : null)
  const build = built !== null && built.slug === doneSlug ? built.build : null
  const lit = build?.status === 'ready' || build?.status === 'partial'
  const stopped = build?.status === 'failed' || build?.status === 'exhausted'
  const draftReached = restored ? 0 : reached
  // The build's colour, once the poll has it, for a restored view's region.
  const builtHex = restored ? (build?.hex ?? null) : null
  // The ramp's dark band takes the chosen colour's hue from the colour question on (plan OD5),
  // and a restored view the build's.
  const hue = builtHex === null ? bandHueOf(shown, draftReached) : bandHueOfHex(builtHex)

  // main comes first in the DOM and the region second (start-layout.ts). Once the brief is sent
  // the page is the ink, as the home page ends, until the designs can be opened, when it rises to
  // light: main's scope follows, and the island reads it as it changes. The grid's attributes
  // tell the /start sheets where the page is: sending, done, arriving while a sent brief's ink
  // runs on, lit, or dimmed for a build that ended without designs; its --start-hue, the band's
  // hue. main also drops the curve's clearance below lg at done, because the region no longer
  // hangs its curve.
  return (
    <>
      <StartChrome current={done ? TOTAL : answered + 1} total={TOTAL} done={done} />

      <div
        className={startGrid}
        data-state={done ? 'done' : bloom !== null ? 'sending' : undefined}
        data-arriving={arriving ? '' : undefined}
        data-lit={lit ? '' : undefined}
        data-dim={stopped ? '' : undefined}
        style={hue === null ? undefined : ({ '--start-hue': hue } as CSSProperties)}
      >
        <main
          id="main"
          data-theme={done && !lit ? 'dark' : undefined}
          data-dir={step.dir}
          className={`${startMain} ${done ? startMainDone : startMainAsking}`}
        >
          {view.kind === 'done' ? (
            <DoneBoundary
              key={view.slug}
              slug={view.slug}
              own={own}
              onMissing={(kept) => {
                handleMissing(view.slug, kept)
              }}
              opened={view.slug === arrival.opened}
              onNewBrief={startAgain}
              slot={slot}
              onBuild={(next) => {
                setBuilt({ slug: view.slug, build: next })
              }}
            />
          ) : (
            <QuestionPane
              key={view.index}
              index={view.index}
              questionId={questionAt(view.index)}
              answers={answers}
              errors={errors}
              dispatch={dispatch}
              sending={sending}
              submitError={submitError}
              handOff={arrival.handOff}
              notice={noticeShown}
              pictures={pictures}
              onPreview={setPreview}
              onBack={() => {
                leaveQuestion()
                stepBack(view.index)
              }}
              onNext={next}
            />
          )}
        </main>

        {/* The draft follows the furthest question reached (plan D3), with the pictures and a
            hovered answer beside the answers. The region also carries the send's ink, under the
            draft and over main, and at done the place the designs are drawn in, which takes
            main's dark scope while the designs build and the light with it (start-done-view.css),
            since the page card is drawn there from lg. */}
        <SketchPane
          answers={shown}
          answered={answered}
          done={done}
          restored={restored}
          builtHex={builtHex}
          stopped={stopped}
          reached={draftReached}
          extras={{
            logo: logo === null ? null : { url: logo.url, polarity: logo.polarity },
            photos: photos.map((photo) => photo.url),
            preview,
          }}
          doneSlot={
            <>
              {bloom !== null && (
                <SendBloom
                  phase={bloom}
                  onEnd={() => {
                    setEnding(null)
                  }}
                />
              )}
              {done && (
                <div ref={setSlot} data-theme={lit ? undefined : 'dark'} className="done-slot" />
              )}
            </>
          }
        />
      </div>
    </>
  )
}
