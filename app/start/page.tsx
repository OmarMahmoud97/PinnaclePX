import type { Metadata } from 'next'
import { BriefFlow } from '@/app/start/_components/brief-flow'

// A per-visitor form, so search engines have no business indexing it.
export const metadata: Metadata = {
  title: 'Your five questions',
  robots: { index: false, follow: false },
}

// No Suspense boundary. BriefFlow's server render is the skeleton, because it reads the URL only
// after hydration, so nothing here suspends or bails out to the client (the build would fail if
// that changed). A boundary would cost bytes as well: React streams a finished boundary larger
// than 12,800 B as a hidden second copy that a script swaps in, and the skeleton, with the real
// sketch and the island, is larger than that.
export default function StartPage() {
  return <BriefFlow />
}
