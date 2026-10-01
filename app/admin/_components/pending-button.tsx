'use client'

import type { ReactNode } from 'react'
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
// Every button in the form disables together, so a second tap cannot race the first.
export function PendingButton({ intent, variant, size, pressed, className, children }: Props) {
  const { pending, data } = useFormStatus()
  const mine = pending && data.get('intent') === intent
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      size={size}
      className={className}
      disabled={pending}
      aria-busy={mine}
      aria-pressed={pressed}
    >
      {mine ? 'Saving…' : children}
    </Button>
  )
}
