'use client'

import { Button } from '@/components/ui/button'

type Props = Readonly<{ error: Error & { digest?: string }; retry: () => void }>

// A render or an action that threw (a stale action id after a deploy, a lost connection): the
// page is out of date, and a reload is the whole remedy. Nothing of the error is shown or sent.
export default function BriefError({ retry }: Props) {
  return (
    <main id="main" className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-10 sm:px-6">
      <p>This page is out of date.</p>
      <Button variant="outline" size="lg" className="self-start" onClick={retry}>
        Reload
      </Button>
    </main>
  )
}
