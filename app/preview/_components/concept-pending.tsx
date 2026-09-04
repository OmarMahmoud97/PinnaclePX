'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSubmissionStatus } from '@/app/preview/_components/use-submission-status'
import { CountdownRing } from '@/app/start/_components/countdown-ring'
import { useCountdown } from '@/app/start/_components/use-countdown'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'

type Props = { slug: string; initial: SubmissionStatus; name: string }

// A design opened before it is ready: the same clock as the done page, and the page reloads
// itself the moment the server says the design can be shown.
export function ConceptPending({ slug, initial, name }: Props) {
  const router = useRouter()
  const status = useSubmissionStatus(slug, initial)
  const deadlineAt = status.status === 'missing' ? new Date().toISOString() : status.deadlineAt
  const remaining = useCountdown(deadlineAt)

  useEffect(() => {
    if (status.status !== 'building') router.refresh()
  }, [status.status, router])

  return (
    <main className="mx-auto flex min-h-[70svh] w-full max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
      <CountdownRing remainingMs={remaining} totalMs={CONFIG.deadline.totalMs} ready={false} />
      <h1 className="text-title font-medium text-balance">{name} is still being built.</h1>
      <p className="text-on-surface-muted">This page will show it the moment it is ready.</p>
    </main>
  )
}
