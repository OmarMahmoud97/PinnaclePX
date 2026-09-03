'use client'

import { useEffect, useState } from 'react'
import { getDesigns } from '@/app/start/_components/actions'
import type { DesignsStatus } from '@/lib/brief/designs'
import { CONFIG } from '@/lib/config'

// Asks the server for the finished designs every few seconds until they are ready or the brief
// turns out to be unknown. A hidden tab waits instead of asking. Cancelled when the page is left.
export function useDesigns(briefId: string): DesignsStatus {
  const [status, setStatus] = useState<DesignsStatus>({ status: 'building' })

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const later = () => {
      timer = setTimeout(() => {
        void poll()
      }, CONFIG.polling.designsMs)
    }

    async function poll() {
      if (document.visibilityState === 'hidden') {
        later()
        return
      }
      try {
        const next = await getDesigns(briefId)
        if (cancelled) return
        setStatus(next)
        if (next.status === 'building') later()
      } catch {
        // A dropped request is not the end: ask again next time.
        if (!cancelled) later()
      }
    }

    later()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [briefId])

  return status
}
