'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { displayHeading } from '@/app/_components/section-styles'
import { useSubmissionStatus } from '@/app/preview/_components/use-submission-status'
import type { Submitted } from '@/app/start/_components/brief-reducer'
import { CountdownRing } from '@/app/start/_components/countdown-ring'
import { DesignSlots } from '@/app/start/_components/design-slots'
import { useCountdown } from '@/app/start/_components/use-countdown'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
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

// The left pane once the brief is in: a clock running to the server's deadline and a slot for
// each design, which fills with its link as the pipeline reports it. The sketch stays on the
// right, finished, so what they told us and what they are getting sit side by side.
export function BriefDone({ name, email, submitted }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const first = firstNameFrom(name)
  const remaining = useCountdown(submitted.deadlineAt)
  const status = useSubmissionStatus(submitted.slug, initialStatus(submitted))
  const ready = status.status === 'ready'
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
        <p className={`${captionStyles} flex items-center gap-2 uppercase`}>
          <Check aria-hidden="true" className="size-3.5 text-success" />
          Brief received
        </p>
        <h1 ref={headingRef} tabIndex={-1} className={`${displayHeading} outline-none`}>
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
            We are building{' '}
            {count === 1 ? 'a homepage design' : `${String(count)} homepage designs`} in your brand.
            The {count === 1 ? 'link appears' : 'links appear'} below and{' '}
            {count === 1 ? 'lands' : 'land'} at{' '}
            <span className="font-medium text-on-surface">{email}</span>.{' '}
            {count === 1 ? 'It stays' : 'They stay'} live for {CONFIG.retention.days} days.
          </p>
        )}
        {status.status !== 'exhausted' && status.status !== 'failed' && (
          <p className="text-sm text-on-surface-muted">
            Your page:{' '}
            <a
              href={`/preview/${submitted.slug}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium break-all text-on-surface underline underline-offset-4"
            >
              {`${env.NEXT_PUBLIC_APP_URL}/preview/${submitted.slug}`}
            </a>
          </p>
        )}
      </div>

      {!settled || ready ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <CountdownRing remainingMs={remaining} totalMs={CONFIG.deadline.totalMs} ready={ready} />
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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TrackedLink
            href={BOOK_CALL.href}
            event="call_click"
            location="brief-done"
            className={buttonStyles({ variant: 'cta', size: 'lg' })}
          >
            {BOOK_CALL.label}
          </TrackedLink>
          <Link href="/" className={buttonStyles({ variant: 'ghost', size: 'lg' })}>
            Back to site
          </Link>
        </div>
        <p className="text-sm text-on-surface-muted">{SITE.callPromise}</p>
      </div>
    </div>
  )
}
