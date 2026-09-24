'use client'

import { BOOK_CALL } from '@/app/_components/nav-links'
import { displayHeading } from '@/app/_components/section-styles'
import { useSubmissionStatus } from '@/app/preview/_components/use-submission-status'
import type { Submitted } from '@/app/start/_components/brief-reducer'
import { CountdownRing } from '@/app/start/_components/countdown-ring'
import { DesignSlots } from '@/app/start/_components/design-slots'
import { useCountdown } from '@/app/start/_components/use-countdown'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import { buttonStyles } from '@/components/ui/button'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { firstNameFrom } from '@/lib/brief/names'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'
import { env } from '@/lib/env'
import { SITE } from '@/lib/site'

type Props = { name: string; email: string; submitted: Submitted }

// What the server told us at submit, as the first status, before the first poll answers.
function initialStatus({ slug, deadlineAt, conceptCount }: Submitted): SubmissionStatus {
  return {
    status: 'building',
    slug,
    deadlineAt,
    conceptCount,
    concepts: Array.from({ length: conceptCount }, () => ({
      templateId: null,
      name: null,
      ready: false,
      href: null,
    })),
  }
}

// What a screen reader hears when the pane changes under it. The heading is read once, when it
// takes focus as the pane opens. After that, a new heading or a slot turning into a link is
// silent, so this one polite line states each change. It is empty until something changes, so
// opening the pane announces only the heading. It never repeats a visible sentence or the email,
// so a test that finds either by its text still finds one element.
function announcement(status: SubmissionStatus, count: number, timeUp: boolean): string {
  if (status.status === 'missing') return ''
  if (status.status === 'failed') return 'Building your designs failed.'
  if (status.status === 'exhausted') return 'There are no new designs to show you.'
  if (status.status === 'ready' || status.status === 'partial')
    return count === 1
      ? 'Your design is ready to open.'
      : `All ${String(count)} designs are ready to open.`
  const opened = status.concepts.filter((concept) => concept.href !== null).length
  if (opened > 0) return `${String(opened)} of ${String(count)} ready to open.`
  return timeUp ? 'Still building, past the usual time.' : ''
}

type SummaryProps = { status: SubmissionStatus['status']; count: number; email: string }

// The sentence under the heading, in the heading's tense. While the designs are on their way it
// says what is under way and where the links will land. Once they are ready it says they are
// built and hands them over, here or from the email. partial opens like ready but gets no email:
// send-preview-link.ts withholds it when the sweeper settled a stage with its fallback. So there
// the sentence promises no email and points to the page's own link, shown just under it.
function Summary({ status, count, email }: SummaryProps) {
  const one = count === 1
  const designs = one ? 'a homepage design' : `${String(count)} homepage designs`
  const them = one ? 'it' : 'them'
  const stay = `${one ? 'It stays' : 'They stay'} live for ${String(CONFIG.retention.days)} days.`
  const address = <span className="font-medium wrap-anywhere text-on-surface">{email}</span>

  if (status === 'ready')
    return (
      <>
        We have built {designs} in your brand. Open {them} below, or from the email on its way to{' '}
        {address}. {stay}
      </>
    )
  if (status === 'partial')
    return (
      <>
        We have built {designs} in your brand. Open {them} below, and save your page&apos;s link to
        come back to {them}. {stay}
      </>
    )
  return (
    <>
      We are building {designs} in your brand. The {one ? 'link appears' : 'links appear'} below and{' '}
      {one ? 'lands' : 'land'} at {address}. {stay}
    </>
  )
}

// The pane once the brief is in. The page has turned to the ink by then (the flow puts the dark
// scope on main), so everything here reads the scope's tokens and names no colour of its own:
// light type on the foot, and the product's blue as the one hue for the ring and the building
// dots. The order is the visitor's: what happened, the call and its promise, then a clock
// running to the server's deadline beside a slot for each design, which fills with its link as
// the pipeline reports it. The finished sketch stays in view on its pool, so what they told us
// and what they are getting sit together.
//
// The pane repeats nothing the island above it says. The island's "Brief received" is the page's
// live line, heard as the pane arrives, and its exit is the one way out on every question, in
// view at every width. So the pane has no "Brief received" eyebrow and no "Back to site" link of
// its own: on a phone each pair sat within one screen, and the pane's copies only pulled the eye
// from the call and the slots. It opens on its heading and ends on the designs.
export function BriefDone({ name, email, submitted }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const first = firstNameFrom(name)
  const remaining = useCountdown(submitted.deadlineAt)
  const status = useSubmissionStatus(submitted.slug, initialStatus(submitted))
  const ready = status.status === 'ready' || status.status === 'partial'
  const settled = status.status !== 'building'
  const timeUp = remaining === 0 && !settled
  const count = submitted.conceptCount
  const noun = count === 1 ? 'design' : 'designs'
  const greeting = first === '' ? `Your ${noun}` : `${first}, your ${noun}`

  const heading =
    status.status === 'exhausted'
      ? 'You have seen every design we have for now.'
      : status.status === 'failed'
        ? 'Something went wrong on our side.'
        : ready
          ? `${greeting} ${count === 1 ? 'is' : 'are'} ready.`
          : `${greeting} ${count === 1 ? 'is on its way.' : 'are on their way.'}`

  return (
    <div className="flex w-full max-w-lg animate-question-in flex-col gap-8">
      <div className="flex flex-col gap-3">
        {/* The visitor's name and address are theirs, so either may be one long word: each
            breaks where it must rather than running past the column on a phone. */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className={`${displayHeading} wrap-anywhere outline-none`}
        >
          {heading}
        </h1>
        {status.status === 'exhausted' ? (
          <p className="text-on-surface-muted">
            Every design we can build has already been shown to this address, so there is nothing
            new to show you here. The next step is a call: we go through your designs together.
          </p>
        ) : status.status === 'failed' ? (
          <p className="text-on-surface-muted">
            We could not finish your designs this time. We have the details. Try again in a few
            minutes, or book a call and we will sort it out with you.
          </p>
        ) : (
          <p className="text-on-surface-muted">
            <Summary status={status.status} count={count} email={email} />
          </p>
        )}
        {/* The address is shown only once the page opens to something: a link handed over
            while the pipeline is still running would open a page of pending slots. */}
        {ready && (
          <p className="text-sm text-on-surface-muted">
            Your page:{' '}
            {/* The slug is one random word, so the line breaks before it rather than inside it;
                wrap-anywhere only steps in if the host alone is wider than the column. */}
            <a
              href={`/preview/${submitted.slug}`}
              target="_blank"
              rel="noreferrer"
              className={`${textLinkStyles} wrap-anywhere`}
            >
              {`${env.NEXT_PUBLIC_APP_URL}/preview/`}
              <wbr />
              {submitted.slug}
            </a>
          </p>
        )}
      </div>

      {/* The call comes before the clock, so the one filled button is inside the first screen on
          a phone. It stands on the ink itself, never inside a card: its navy edge holds 3.36:1
          on the foot and would sink into an ink card. */}
      <div className="flex flex-col items-start gap-3">
        <TrackedLink
          href={BOOK_CALL.href}
          event="call_click"
          location="brief-done"
          className={buttonStyles({ variant: 'cta', size: 'lg', className: 'w-full sm:w-auto' })}
        >
          {BOOK_CALL.label}
        </TrackedLink>
        <p className="text-sm text-on-surface-muted">{SITE.callPromise}</p>
      </div>

      {/* The slots are where the designs arrive, so on a laptop they share the first screen with
          the call (1024 by 768, 1280 by 800, 1366 by 657, 1440 by 900). From sm the ring sits
          beside them, and from lg it shrinks to about their height (countdown-ring.tsx). The
          column is 391 px at 1024, and a 128 px ring leaves the widest slot row, "Design three"
          with "on its way", its 230 px on one line; stacked over the slots, the ring pushed them
          below the fold. */}
      {!settled || ready ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <CountdownRing
            remainingMs={remaining}
            totalMs={CONFIG.deadline.totalMs}
            ready={ready}
            besideSlots
          />
          <div className="flex w-full flex-1 flex-col gap-3">
            <DesignSlots status={status} timeUp={timeUp} />
            {timeUp && (
              <p className="text-sm text-on-surface-muted">
                Taking a little longer than usual. Your {count === 1 ? 'link' : 'links'} will still
                land at {email}.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Always in the tree, and empty at first, so it exists before its first change and
          survives the failed and exhausted branches. role="status" is already polite and atomic,
          and the text follows only the status and whether the time is up, so the countdown's
          ticks announce nothing. */}
      <p role="status" className="sr-only">
        {announcement(status, count, timeUp)}
      </p>
    </div>
  )
}
