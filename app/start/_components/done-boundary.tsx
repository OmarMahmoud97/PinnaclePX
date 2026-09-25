'use client'

import { Component, type ReactNode, useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useSubmissionStatus } from '@/app/preview/_components/use-submission-status'
import type { BriefDone } from '@/app/start/_components/brief-done'
import type { Submitted } from '@/app/start/_components/brief-reducer'
import {
  type DoneDetails,
  firstDoneView,
  type Kept,
  keptFor,
} from '@/app/start/_components/done-storage'
import { DONE_LINES, doneTitle, waitingHeading } from '@/app/start/_components/start-copy'
import { doneHeading } from '@/app/start/_components/start-layout'
import { useDocumentTitle } from '@/app/start/_components/use-document-title'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import { Button } from '@/components/ui/button'
import { textLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'
import type { FoundView, SubmissionStatus } from '@/lib/brief/status'
import { SITE } from '@/lib/site'

// The boundary between the questions and the done view (docs/start-page-journey-plan.md, 4.9 and
// 9.6). The done view is a chunk of its own, fetched as the last question shows, so a visitor who
// never sends never downloads it; scripts/bundle-budget.mjs holds it out of /start's first
// scripts. Here it is loaded, fed and guarded: the view draws the poll's answers, in this tab's own
// words where it has them, and until both the chunk and the first answer are in hand, or if the
// chunk fails, a stand-in holds the heading and the page link, so the designs are always one click
// away.

type DoneView = typeof BriefDone

// How a build stands, as the poll reports it, and the colour its designs carry once the tokens
// stage has set it, which lights the region of a done view this tab did not send.
export type Build = Readonly<{ status: FoundView['status']; hex: string | null }>

let request: Promise<DoneView> | null = null
let loaded: DoneView | null = null

// Fetches the done view's chunk, once. A failed fetch is forgotten, so the next call asks again.
export function preloadDone(): Promise<DoneView> {
  request ??= import('@/app/start/_components/brief-done')
    .then((module) => {
      loaded = module.BriefDone
      return module.BriefDone
    })
    .catch((error: unknown) => {
      request = null
      throw error instanceof Error ? error : new Error('The done view did not load')
    })
  return request
}

type Chunk =
  | Readonly<{ kind: 'loading' }>
  | Readonly<{ kind: 'ready'; View: DoneView }>
  | Readonly<{ kind: 'failed' }>

// The chunk as this view has it. Already fetched, it renders at once; otherwise it settles through
// the one request, even when that lands between the first render and this effect.
function useDoneChunk(): readonly [Chunk, () => void] {
  const [chunk, setChunk] = useState<Chunk>(() =>
    loaded === null ? { kind: 'loading' } : { kind: 'ready', View: loaded },
  )
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let current = true
    preloadDone().then(
      (View) => {
        if (current) setChunk({ kind: 'ready', View })
      },
      () => {
        if (current) setChunk({ kind: 'failed' })
      },
    )
    return () => {
      current = false
    }
  }, [attempt])
  const retry = () => {
    setChunk({ kind: 'loading' })
    setAttempt((count) => count + 1)
  }
  return [chunk, retry]
}

type BoundaryProps = { fallback: (retry: () => void) => ReactNode; children: ReactNode }

// A done view that throws as it renders shows the stand-in, with the way to try it again.
class DoneErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children
    return this.props.fallback(() => {
      this.setState({ failed: false })
    })
  }
}

// done_view, once per submission per tab, in the state the first answer found it in.
function useDoneViewEvent(slug: string, status: SubmissionStatus | undefined): void {
  useEffect(() => {
    if (status === undefined || !firstDoneView(slug)) return
    const timeUp = status.status === 'building' && Date.parse(status.deadlineAt) <= Date.now()
    trackEvent('done_view', { state: timeUp ? 'time-up' : status.status })
  }, [slug, status])
}

type StandInProps = { slug: string; heading: string; onRetry?: (() => void) | undefined }

// The heading and the page link, while the done view is on its way or if it will not come, the
// heading set as the view sets it, so the view takes its place without a jump. A failed view
// takes the focus, as the done view would have; one still loading leaves it to the
// view. The two are keyed apart where they are rendered, so a load that fails mounts the failed
// one afresh and its heading takes the focus then.
function StandIn({ slug, heading, onRetry }: StandInProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const failed = onRetry !== undefined
  const path = `/preview/${encodeURIComponent(slug)}`
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <h1
        ref={failed ? headingRef : undefined}
        tabIndex={-1}
        className={`${doneHeading} outline-none`}
      >
        {heading}
      </h1>
      {failed && <p className="text-on-surface-muted">{DONE_LINES.chunkFailed}</p>}
      <p className="text-sm text-on-surface-muted">
        {DONE_LINES.pageLink}{' '}
        {/* This deployment's own host: the page is served from wherever the visitor is. */}
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
      {failed && (
        <Button variant="outline" onClick={onRetry} className="self-start">
          {DONE_LINES.retry}
        </Button>
      )}
    </div>
  )
}

type Props = {
  slug: string
  // This tab's send, when it is the one on show, from memory: the storage behind it may be
  // refused. Otherwise what the browser kept stands in, and the poll fills the rest.
  own: Readonly<{ details: DoneDetails; submitted: Submitted }> | null
  // The poll found no such submission; `kept` says whether this browser had sent it.
  onMissing: (kept: boolean) => void
  // Whether this is the live submission bare /start opened (plan 7.4, rule 4).
  opened: boolean
  onNewBrief: () => void
  // The region's place for the designs beside the draft, which the view fills (brief-done.tsx).
  slot: HTMLElement | null
  // How the build stands at each answer of the poll, which the flow turns into the page's light
  // (start-done.css): null until the first answer.
  onBuild: (build: Build | null) => void
}

export function DoneBoundary({ slug, own, onMissing, opened, onNewBrief, slot, onBuild }: Props) {
  const kept: Kept = useMemo(() => own ?? keptFor(slug), [own, slug])
  const { details } = kept
  const status = useSubmissionStatus(slug)
  const [chunk, retry] = useDoneChunk()
  const missing = status?.status === 'missing'
  const found = status === undefined || status.status === 'missing' ? null : status
  const count = found?.conceptCount ?? kept.submitted?.conceptCount ?? null
  const heading = waitingHeading(details?.first ?? '', count)

  const reportMissing = useEffectEvent(() => {
    onMissing(details !== null || kept.submitted !== null)
  })
  useEffect(() => {
    if (missing) reportMissing()
  }, [missing])
  const reportBuild = useEffectEvent((build: Build | null) => {
    onBuild(build)
  })
  // Reported by its two values, so a poll that changes neither reports nothing.
  const buildStatus = found?.status ?? null
  const buildHex = found?.palette?.hex ?? null
  useEffect(() => {
    reportBuild(buildStatus === null ? null : { status: buildStatus, hex: buildHex })
  }, [buildStatus, buildHex])
  useDoneViewEvent(slug, status)
  useDocumentTitle(doneTitle(status), 'done')

  if (chunk.kind === 'failed') {
    return <StandIn key="failed" slug={slug} heading={heading} onRetry={retry} />
  }
  // The view opens on the poll's first answer, so it never draws a build as it is not.
  if (chunk.kind === 'loading' || found === null) {
    return <StandIn key="loading" slug={slug} heading={heading} />
  }
  return (
    <DoneErrorBoundary
      fallback={(again) => <StandIn slug={slug} heading={heading} onRetry={again} />}
    >
      <chunk.View
        view={found}
        details={details}
        slot={slot}
        fromAsk={opened}
        onNewBrief={onNewBrief}
      />
    </DoneErrorBoundary>
  )
}
