'use client'

import { type ReactNode, useActionState } from 'react'
import { setStanding, type StandingResult } from '@/app/admin/_components/actions'
import { captionStyles } from '@/components/ui/caption'

// What the owner reads under the buttons once the action has answered (ADR 0047). Said plainly,
// since a save that failed in silence would be trusted.
const WORDS = {
  saved: 'Saved.',
  forbidden: 'Sign in again.',
  gone: 'This brief has been deleted.',
  rejected: 'That was not accepted.',
  retry: 'Not saved. Try again.',
} as const

function wordFor(state: StandingResult | null): string {
  if (state === null) return ''
  return state.ok ? WORDS.saved : WORDS[state.reason]
}

type Props = Readonly<{ children: ReactNode }>

// The one form around the standing panel: the fields and buttons are drawn by the server and
// handed in as children; this leaf only binds the Server Action and prints its answer, so the form
// posts before hydration and nothing optimistic has to be undone. The re-rendered page is the
// truth; the line here says only whether the last tap took.
export function StandingForm({ children }: Props) {
  const [state, action] = useActionState(setStanding, null)
  return (
    <form action={action} className="flex flex-col gap-5">
      {children}
      <p role="status" aria-live="polite" className={`${captionStyles} min-h-5`}>
        {wordFor(state)}
      </p>
    </form>
  )
}
