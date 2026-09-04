'use client'

import { useEffect, useState } from 'react'
import { getSubmissionStatus } from '@/app/preview/actions'
import type { SubmissionStatus } from '@/lib/brief/status'
import { CONFIG } from '@/lib/config'

// Asks the server how the designs are coming along every few seconds until they are ready, or
// the submission turns out to be exhausted, failed or unknown. A hidden tab waits instead of
// asking. Cancelled when the page is left. Starts from what the caller already knows.
export function useSubmissionStatus(slug: string, initial: SubmissionStatus): SubmissionStatus {
  const [status, setStatus] = useState<SubmissionStatus>(initial)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const later = () => {
      timer = setTimeout(() => {
        void poll()
      }, CONFIG.polling.statusMs)
    }

    async function poll() {
      if (document.visibilityState === 'hidden') {
        later()
        return
      }
      try {
        const next = await getSubmissionStatus(slug)
        if (cancelled) return
        setStatus(next)
        if (next.status === 'building') later()
      } catch {
        // A dropped request is not the end: ask again next time.
        if (!cancelled) later()
      }
    }

    if (initial.status === 'building') later()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [slug, initial.status])

  return status
}
