'use client'

import { createContext, type ReactNode, useActionState, useContext } from 'react'
import { useFormStatus } from 'react-dom'
import { type Fields, setStanding, type StandingResult } from '@/app/admin/_components/actions'
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

// What the fields show after an answer. React resets a form's fields when its action settles; a
// save that took brings a fresh page to reset them to, a refusal does not, so the refusal carries
// the words back and the fields mount again with them (standing-fields.tsx). `attempt` changes
// with every answer, so a field is remounted whichever way it went.
type Resubmit = Readonly<{ fields: Fields | null; attempt: number }>

const ResubmitContext = createContext<Resubmit>({ fields: null, attempt: 0 })

export function useResubmit(): Resubmit {
  return useContext(ResubmitContext)
}

// The answer line: empty while a save is in flight, so a second "Saved." is a fresh change for a
// screen reader rather than the same words again.
function StatusLine({ state }: Readonly<{ state: StandingResult | null }>) {
  const { pending } = useFormStatus()
  return (
    <p role="status" aria-live="polite" className={`${captionStyles} min-h-5`}>
      {pending ? '' : wordFor(state)}
    </p>
  )
}

type Props = Readonly<{ children: ReactNode }>

// The one form around the standing panel: the fields and buttons are drawn by the server and
// handed in as children; this leaf only binds the Server Action and prints its answer, so the form
// posts before hydration and nothing optimistic has to be undone. The re-rendered page is the
// truth; the line here says only whether the last tap took.
export function StandingForm({ children }: Props) {
  const [state, action] = useActionState(setStanding, null)
  const resubmit: Resubmit = {
    fields: state !== null && !state.ok ? state.fields : null,
    attempt: state?.attempt ?? 0,
  }
  return (
    <ResubmitContext.Provider value={resubmit}>
      <form action={action} className="flex flex-col gap-5">
        {children}
        <StatusLine state={state} />
      </form>
    </ResubmitContext.Provider>
  )
}
