'use client'

import Link from 'next/link'
import { type KeyboardEvent, useId } from 'react'
import type { StepProps } from '@/app/start/_components/step-props'
import { Field, fieldStyles } from '@/components/ui/field'
import { textLinkStyles } from '@/components/ui/text-link'

// The phone keyboard's Enter key says what it does: Next on the name and the company, which move
// to the field below, and Go on the email, which sends the question like the button does.
const FIELDS = [
  { field: 'name', label: 'Your name', autoComplete: 'name', type: 'text', enterKeyHint: 'next' },
  {
    field: 'company',
    label: 'Company',
    autoComplete: 'organization',
    type: 'text',
    enterKeyHint: 'next',
  },
  { field: 'email', label: 'Email', autoComplete: 'email', type: 'email', enterKeyHint: 'go' },
] as const

// A key labelled Next that submitted the form would show the visitor three errors for fields
// they have not reached, so Enter on those two moves on instead. Not while an input method is
// composing a word, where Enter belongs to the composition.
function moveOn(event: KeyboardEvent<HTMLInputElement>, nextId: string) {
  if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
  event.preventDefault()
  document.getElementById(nextId)?.focus()
}

export function DetailsStep({ answers, errors, dispatch }: StepProps) {
  const prefix = useId()

  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map(({ field, label, autoComplete, type, enterKeyHint }, i) => {
        const following = FIELDS[i + 1]
        return (
          <Field
            key={field}
            id={`${prefix}-${field}`}
            label={label}
            error={errors[field]}
            hint={
              field === 'email' ? 'We use this to send you your link. Nothing else.' : undefined
            }
          >
            {(attributes) => (
              <input
                {...attributes}
                type={type}
                autoComplete={autoComplete}
                enterKeyHint={enterKeyHint}
                value={answers[field]}
                onChange={(e) => {
                  dispatch({ type: 'set-text', field, value: e.target.value })
                }}
                onKeyDown={
                  following === undefined
                    ? undefined
                    : (e) => {
                        moveOn(e, `${prefix}-${following.field}`)
                      }
                }
                className={fieldStyles}
              />
            )}
          </Field>
        )
      })}
      <p className="text-sm text-on-surface-muted">
        Your answers go into your designs and nowhere else.{' '}
        <Link href="/privacy" className={textLinkStyles} target="_blank">
          How we use your details
        </Link>
        .
      </p>
    </div>
  )
}
