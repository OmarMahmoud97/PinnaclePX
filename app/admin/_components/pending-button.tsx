'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

type Props = Readonly<{
  intent: string
  variant?: 'primary' | 'contrast' | 'outline' | 'ghost' | undefined
  size?: 'md' | 'lg' | undefined
  pressed?: boolean | undefined
  className?: string | undefined
  children: ReactNode
}>

// A submit button that names its intent, dims while the form is in flight, and says "Saving" on
// the one that was pressed, so a slow save on a phone is never mistaken for nothing happening.
// The other buttons disable together, so a second tap cannot race the first; the pressed one stays
// enabled, since a disabled element drops the keyboard's focus to the page, and its own clicks are
// swallowed instead until the answer is in.
export function PendingButton({ intent, variant, size, pressed, className, children }: Props) {
  const { pending, data } = useFormStatus()
  const mine = pending && data.get('intent') === intent
  const swallow = (event: MouseEvent<HTMLButtonElement>) => {
    if (pending) event.preventDefault()
  }
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      size={size}
      className={className}
      disabled={pending && !mine}
      aria-disabled={mine}
      aria-busy={mine}
      aria-pressed={pressed}
      onClick={swallow}
    >
      {mine ? 'Saving…' : children}
    </Button>
  )
}
