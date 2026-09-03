import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BriefFlow } from '@/app/start/_components/brief-flow'
import { StartSkeleton } from '@/app/start/_components/start-skeleton'

// A per-visitor form, so search engines have no business indexing it.
export const metadata: Metadata = {
  title: 'Your five questions',
  robots: { index: false, follow: false },
}

// BriefFlow reads the question from the URL, which needs a Suspense boundary on a static page.
export default function StartPage() {
  return (
    <Suspense fallback={<StartSkeleton />}>
      <BriefFlow />
    </Suspense>
  )
}
