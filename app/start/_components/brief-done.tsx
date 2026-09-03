'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { CountdownRing } from '@/app/start/_components/countdown-ring'
import { DesignSlots } from '@/app/start/_components/design-slots'
import { useCountdown } from '@/app/start/_components/use-countdown'
import { useDesigns } from '@/app/start/_components/use-designs'
import { useFocusOnMount } from '@/app/start/_components/use-focus-on-mount'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { firstNameFrom } from '@/lib/brief/names'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

type Props = { name: string; email: string; briefId: string }

// The left pane once the brief is in: a clock for the five minutes and a slot for each design,
// which fills with its link when the pipeline reports it. The sketch stays on the right,
// finished, so what they told us and what they are getting sit side by side.
export function BriefDone({ name, email, briefId }: Props) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  const first = firstNameFrom(name)
  const remaining = useCountdown(CONFIG.deadline.totalMs)
  const designs = useDesigns(briefId)
  const ready = designs.status === 'ready'
  const timeUp = remaining === 0 && !ready
  const greeting = first === '' ? 'Your designs' : `${first}, your designs`

  return (
    <div className="question-in flex w-full max-w-lg flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 font-mono text-xs tracking-wide text-on-surface-muted uppercase">
          <Check aria-hidden="true" className="size-3.5 text-success" />
          Brief received
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-semibold tracking-tighter text-balance outline-none sm:text-4xl lg:text-5xl"
        >
          {ready ? `${greeting} are ready.` : `${greeting} are on their way.`}
        </h1>
        <p className="text-on-surface-muted">
          We are building three homepage designs in your brand. The links appear below and land at{' '}
          <span className="font-medium text-on-surface">{email}</span>. They stay live for{' '}
          {CONFIG.retention.days} days.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <CountdownRing remainingMs={remaining} totalMs={CONFIG.deadline.totalMs} ready={ready} />
        <div className="flex w-full flex-1 flex-col gap-3">
          <DesignSlots designs={designs} timeUp={timeUp} />
          {timeUp && (
            <p className="text-sm text-on-surface-muted">
              Taking a little longer than usual. Your links will still land at {email}.
            </p>
          )}
        </div>
      </div>

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
