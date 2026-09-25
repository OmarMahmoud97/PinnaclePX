'use client'

import { ArrowUpRight, Share } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
// The view's own rules and the posters', loaded with this chunk and never with /start's first
// paint (docs/start-page-journey-plan.md, 9.6).
import '../../_styles/design-poster.css'
import '../../_styles/start-done-view.css'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { sectionLead } from '@/app/_components/section-styles'
import { emphasised } from '@/app/_components/words'
import { DEADLINE_WORDS } from '@/app/preview/_components/deadline-words'
import { DoneBy } from '@/app/preview/_components/done-by'
import { usePassed } from '@/app/preview/_components/use-passed'
import { DesignList, DesignStrip } from '@/app/start/_components/design-list'
import {
  buildingHeading,
  buildingLead,
  CALL_AFTER_OPEN,
  EARLY_FINISH,
  emailLine,
  INTERMISSION,
  openDesign,
  PAGE_LINK_LIVE,
  PARTIAL_NOTES,
  readyHeading,
  readyLead,
  SHARE_WORDS,
  STOPPED,
} from '@/app/start/_components/done-copy'
import { DoneLog } from '@/app/start/_components/done-log'
import {
  bookingHref,
  heardAfter,
  heardAtOpen,
  intermissionAt,
  isEarly,
  isLit,
  landedOf,
  logOf,
  newsOf,
  saidOf,
  STAGE_COUNT,
  stageNow,
  tookOf,
} from '@/app/start/_components/done-progress'
import { type DoneDetails, sendsToday } from '@/app/start/_components/done-storage'
import { LineWords } from '@/app/start/_components/line-words'
import { StageRing } from '@/app/start/_components/stage-ring'
import { DONE_LINES, SEND_LIMIT } from '@/app/start/_components/start-copy'
import { doneHeading } from '@/app/start/_components/start-layout'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import { buttonStyles } from '@/components/ui/button'
import { handOn, useCopiedNews } from '@/components/ui/share'
import { tapLinkStyles, textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { trackEvent } from '@/lib/analytics/events'
import type { FoundView } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

type Props = Readonly<{
  view: FoundView
  // This tab's own words about the send, or null for a done view opened from a link.
  details: DoneDetails | null
  // The region's place for the designs beside the draft (sketch-pane.tsx), once it is drawn.
  slot: HTMLElement | null
  // Whether bare /start opened this live submission (plan 7.4, rule 4), which offers a new brief.
  fromAsk: boolean
  onNewBrief: () => void
}>

type Heading = ReturnType<typeof buildingHeading>

// The heading's words, the visitor's first name isolated and the closing phrase in the serif
// italic (plan 5.2). The phrase swaps in place at ready; the heading itself never fades.
function HeadingWords({ heading }: Readonly<{ heading: Heading }>) {
  return (
    <>
      {heading.first !== '' && (
        <>
          <bdi>{heading.first}</bdi>,{' '}
        </>
      )}
      {emphasised(heading.rest, heading.payoff)}
    </>
  )
}

type PageLineProps = Readonly<{
  slug: string
  copied: boolean
  onCopied: () => void
  // In main's column below lg, or under the posters in the region from lg (plan 4.1, desk-wait):
  // drawn in both places, and start-done-view.css shows exactly one at a width.
  place: 'column' | 'region'
}>

// The page link, so the designs are one click away from the first poll, and the way to hand it on
// (plan 4.6). Its words are the host and the path, without the scheme, as an address is read
// aloud; the link itself and what Share hands on carry the whole URL. A link gone to the
// clipboard is shown here, and said by the status line.
function PageLine({ slug, copied, onCopied, place }: PageLineProps) {
  const path = `/preview/${encodeURIComponent(slug)}`
  async function share() {
    const method = await handOn(new URL(path, window.location.origin).toString())
    if (method === null) return
    if (method === 'copy') onCopied()
    trackEvent('share_click', { location: 'brief-done', method })
  }
  return (
    <div data-place={place} className="done-page">
      <p className="text-sm text-on-surface-muted">
        {DONE_LINES.pageLink}{' '}
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className={`${textLinkStyles} wrap-anywhere`}
        >
          {`${window.location.host}/preview/`}
          <wbr />
          {slug}
          <span className="sr-only"> {SITE.newTab}</span>
        </a>
      </p>
      <button
        type="button"
        onClick={() => {
          void share()
        }}
        className={`${tapLinkStyles} inline-flex cursor-pointer items-center gap-2`}
      >
        <Share aria-hidden="true" className="size-4" />
        {SHARE_WORDS.share}
      </button>
      {copied && (
        <p aria-hidden="true" className="done-copied">
          {SHARE_WORDS.copied}
        </p>
      )}
    </div>
  )
}

type CallLinkProps = Readonly<{ href: ReturnType<typeof bookingHref>; text?: boolean }>

// The call: the booking page in a new tab, so this page, where the designs are, is still here,
// filled in with the visitor's name while this tab has it. As the aside it is a link in the
// sentence; as the next step, a button. Its location is the mark scripts/bundle-budget.mjs finds
// this chunk by, so the view never rides /start's first scripts.
function CallLink({ href, text = false }: CallLinkProps) {
  return (
    <TrackedLink
      href={href}
      target="_blank"
      rel="noreferrer"
      event="call_click"
      location="brief-done"
      className={text ? tapLinkStyles : buttonStyles({ variant: 'cta', size: 'lg' })}
    >
      {text ? INTERMISSION.link : BOOK_CALL.label}
      <span className="sr-only"> {SITE.newTab}</span>
    </TrackedLink>
  )
}

// The way on to another brief, until the day's sends are spent. Offered where the plan puts it:
// under a build that failed or had nothing new to show (4.6), and on the live done view bare
// /start opened (7.4, rule 4). A build on its way or ready keeps the call as its next step.
function NewBrief({ onNewBrief }: Readonly<{ onNewBrief: () => void }>) {
  const [spent] = useState(() => sendsToday() >= CONFIG.rateLimit.submissionsPerIdentity.max)
  if (spent) return <p className="text-sm text-on-surface-muted">{SEND_LIMIT}</p>
  return (
    <button
      type="button"
      onClick={onNewBrief}
      className={`${tapLinkStyles} cursor-pointer self-start`}
    >
      {DONE_LINES.newBrief}
    </button>
  )
}

// wait_leave, once a page, when the tab is hidden while the designs build (plan 7.6): the stage
// the build was at, never the slug.
function useWaitLeave(view: FoundView): void {
  const building = view.status === 'building'
  const told = useRef(false)
  const report = useEffectEvent(() => {
    if (told.current || document.visibilityState !== 'hidden') return
    told.current = true
    trackEvent('wait_leave', { stage: stageNow(view) })
  })
  useEffect(() => {
    if (!building) return
    document.addEventListener('visibilitychange', report)
    return () => {
      document.removeEventListener('visibilitychange', report)
    }
  }, [building])
}

// The lead while the designs build: what is happening, that the page link works already, and
// that the email follows once they are done, to the visitor's address or, restored, without it.
function BuildingLead({
  view,
  details,
}: Readonly<{ view: FoundView; details: DoneDetails | null }>) {
  const count = view.conceptCount
  return (
    <p className={sectionLead}>
      {buildingLead(count)} {PAGE_LINK_LIVE}{' '}
      <LineWords line={emailLine(count, details?.email ?? '')} className="font-medium" />
    </p>
  )
}

// Ready's lead, which rises in as the page turns to light (start-done-view.css): how long the build
// took, where it has the times, an early finish drawn with a check, and what a partial build set
// simply (plan D19).
function ReadyLead({ view }: Readonly<{ view: FoundView }>) {
  const notes = [
    ...(view.stages.copy.state === 'fallback' ? [PARTIAL_NOTES.headlines] : []),
    ...(view.stages.imagery.state === 'fallback' ? [PARTIAL_NOTES.photos] : []),
  ]
  return (
    <div data-flip="" className="done-lead">
      <p className={sectionLead}>{readyLead(view.conceptCount, tookOf(view))}</p>
      {isEarly(view) && (
        <p className="done-early">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="done-check">
            <path pathLength={1} d="M20 6 9 17l-5-5" />
          </svg>
          {EARLY_FINISH}
        </p>
      )}
      {notes.map((note) => (
        <p key={note} className="text-sm text-on-surface-muted">
          {note}
        </p>
      ))}
    </div>
  )
}

// Whether the visitor has come back to this page after opening a design, when the call takes the
// ask's place (plan 6.2 and OD8a). A press on a design's link only marks the open: a link whose
// address changed in its own click would send the browser to the new one, the call, instead of
// the design. The page being left, hidden or its window losing the focus to the design's tab, and
// then shown again is the return.
function useBackFromDesign(): readonly [boolean, () => void] {
  const [back, setBack] = useState(false)
  const away = useRef<'here' | 'opened' | 'left'>('here')
  useEffect(() => {
    const leave = () => {
      if (away.current === 'opened') away.current = 'left'
    }
    const come = () => {
      if (away.current === 'left') setBack(true)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') leave()
      else come()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', leave)
    window.addEventListener('focus', come)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', leave)
      window.removeEventListener('focus', come)
    }
  }, [])
  const markOpened = () => {
    if (away.current === 'here') away.current = 'opened'
  }
  return [back, markOpened]
}

type AskProps = Readonly<{
  view: FoundView
  opened: boolean
  booking: string
  onOpen: () => void
}>

// Ready's one filled ask (plan OD8a): the first design, until the visitor comes back from opening
// one, and then the call, which the line above it asks for. One link throughout, so a visitor who
// pressed it keeps the focus on it as its words change. On a phone its well rides the foot of the
// screen (start-done-view.css); the lines either side of it stay in the column.
function ReadyAsk({ view, opened, booking, onOpen }: AskProps) {
  const [design] = view.concepts
  const href = design?.href ?? null
  const template = design?.templateId ?? null
  if (href === null || template === null) return null
  return (
    <>
      {opened && <p className="text-on-surface-muted">{CALL_AFTER_OPEN}</p>}
      <div className="done-ask">
        <a
          href={opened ? booking : href}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            if (opened) trackEvent('call_click', { location: 'brief-done' })
            else trackEvent('design_open', { template, from: 'done' })
            onOpen()
          }}
          className={`start-done-ask ${buttonStyles({ variant: 'cta', size: 'lg' })}`}
        >
          <span key={opened ? 'call' : 'design'} className="done-ask-label">
            {opened ? BOOK_CALL.label : openDesign(0)}
          </span>
          <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
          <span className="sr-only"> {SITE.newTab}</span>
        </a>
      </div>
      {opened && <p className="text-sm text-on-surface-muted">{SITE.callPromise}</p>}
    </>
  )
}

// While the designs build: when they are usually done, beside a ring of the stages landed, then
// the log of each (plan 4.6). It goes as the page turns to light.
function Progress({ view, details }: Readonly<{ view: FoundView; details: DoneDetails | null }>) {
  return (
    <div className="done-progress">
      <p className="done-time">
        <StageRing landed={landedOf(view)} stages={STAGE_COUNT} />
        <span>
          <DoneBy deadlineAt={view.deadlineAt} words={DEADLINE_WORDS} />
        </span>
      </p>
      <DoneLog lines={logOf(view, details)} />
    </div>
  )
}

// The done view, the chunk the flow loads while the last question is answered
// (docs/start-page-journey-plan.md, 4.6, 4.9 and 9.1). It is drawn from the status poll's first
// answer on (done-boundary.tsx), in this tab's words where it has them and in plain ones where it
// does not, and every count follows the build's own.
//
// While the designs build, the page is the ink: the heading, what is happening and that the page
// link works now, the time beside a ring of the stages landed and the log of each, then the link
// and its share (before the log in plan 9.1; the owner put the progress first, so a 664 px phone's
// first screen holds the ring, which the card pushed under its fold), the designs as rows below
// lg, and, once the first headline lands or a minute has passed, the call, as an aside. From lg
// the designs are posters in the region, where the draft was, and the card is drawn there under
// them (start-done-view.css). When they are ready the page rises to light (the flow's data-lit):
// the heading's phrase swaps, the lead says how long they took, and the first design is the one
// filled ask, until the visitor comes back from opening a design, when the call takes its place.
// A build with nothing to open keeps the ink, says why and leads with the call. Focus goes to the
// heading once, as the view opens, and never moves after; the one status line under it says each
// change once (plan 9.2).
export function BriefDone({ view, details, slot, fromAsk, onNewBrief }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const { slug, conceptCount: count, status } = view
  const lit = isLit(status)
  const late = usePassed(Date.parse(view.deadlineAt)) && status === 'building'
  const offered = usePassed(intermissionAt(view))
  const [opened, open] = useBackFromDesign()
  // What the status line has heard, brought up to date with each poll as the view renders it.
  const news = newsOf(view, late)
  const [heard, setHeard] = useState(() => heardAtOpen(news))
  const latest = heardAfter(heard, news)
  if (latest !== heard) setHeard(latest)
  const said = saidOf(latest, count)
  const { copied, onCopied } = useCopiedNews(said)
  useWaitLeave(view)

  const first = details?.first ?? ''
  const company = details?.company ?? ''
  const booking = bookingHref(details)
  const stopped = status === 'failed' || status === 'exhausted' ? STOPPED[status] : null

  // One tree for every state, so the heading and the status line stay the same nodes as the build
  // moves on: a heading that took the focus keeps it, and a live region is only heard when it is
  // already in the page.
  return (
    <div className="done-view">
      <h1 ref={headingRef} tabIndex={-1} className={`${doneHeading} outline-none`}>
        {stopped !== null ? (
          stopped.heading
        ) : (
          <HeadingWords
            heading={lit ? readyHeading(first, count) : buildingHeading(first, count)}
          />
        )}
      </h1>

      {stopped !== null ? (
        <>
          <p className={sectionLead}>{stopped.lead}</p>
          <div className="done-call">
            <CallLink href={booking} />
            <p className="text-sm text-on-surface-muted">{SITE.callPromise}</p>
          </div>
          <NewBrief onNewBrief={onNewBrief} />
        </>
      ) : (
        <>
          {lit ? <ReadyLead view={view} /> : <BuildingLead view={view} details={details} />}
          {lit && <ReadyAsk view={view} opened={opened} booking={booking} onOpen={open} />}
          {fromAsk && <NewBrief onNewBrief={onNewBrief} />}
          {!lit && <Progress view={view} details={details} />}
          <PageLine slug={slug} copied={copied} onCopied={onCopied} place="column" />
          <DesignList view={view} company={company} variant="rows" onOpen={open} />
          {!(lit && opened) && (lit || offered) && (
            <p className="done-aside text-on-surface-muted">
              {!lit && <>{INTERMISSION.line} </>}
              <CallLink href={booking} text />
            </p>
          )}
        </>
      )}

      {/* The page's one live region: each change said once, and the link's copy while it is
          the newest news (plan 9.2). */}
      <p role="status" className="sr-only">
        {copied ? SHARE_WORDS.copied : said}
      </p>

      {stopped === null &&
        slot !== null &&
        createPortal(
          <>
            <DesignStrip view={view} company={company} />
            <DesignList view={view} company={company} variant="posters" onOpen={open} />
            <PageLine slug={slug} copied={copied} onCopied={onCopied} place="region" />
          </>,
          slot,
        )}
    </div>
  )
}
