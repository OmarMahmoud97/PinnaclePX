'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { drawnKey } from '@/app/preview/_components/drawn-key'
import { useSubmissionStatus } from '@/app/preview/_components/use-submission-status'
import type { SubmissionStatus } from '@/lib/brief/status'

type Props = Readonly<{
  slug: string
  // The status the server drew the page from: the full view, or the status alone.
  initial: SubmissionStatus
}>

// Keeps a page the server drew in step with the build (docs/start-page-journey-plan.md, 8.4): it
// asks the status poll, every few seconds while the page is shown and less often while it is
// hidden, and once an answer would draw the page differently it has the server draw it again, from
// the row. The page's words and posters stay server markup, so none of their modules reaches the
// browser. One redraw per new answer: a redraw that lands ahead of the poll is not chased. A
// submission swept while the page is open redraws as not found.
export function FollowBuild({ slug, initial }: Props) {
  const router = useRouter()
  const latest = useSubmissionStatus(slug, initial)
  const fromView = 'stages' in initial
  const answer = drawnKey(latest, fromView)
  const shown = drawnKey(initial, fromView)
  const redrawnFor = useRef(shown)
  useEffect(() => {
    if (answer === shown || answer === redrawnFor.current) return
    redrawnFor.current = answer
    router.refresh()
  }, [answer, shown, router])
  return null
}
