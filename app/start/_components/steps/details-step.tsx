'use client'

import Link from 'next/link'
import { useId } from 'react'
import type { StepProps } from '@/app/start/_components/step-props'
import { Field, fieldStyles } from '@/components/ui/field'

const FIELDS = [
  { field: 'name', label: 'Your name', autoComplete: 'name', type: 'text' },
  { field: 'company', label: 'Company', autoComplete: 'organization', type: 'text' },
  { field: 'email', label: 'Email', autoComplete: 'email', type: 'email' },
] as const

export function DetailsStep({ answers, errors, dispatch }: StepProps) {
  const prefix = useId()

  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map(({ field, label, autoComplete, type }) => (
        <Field
          key={field}
          id={`${prefix}-${field}`}
          label={label}
          error={errors[field]}
          hint={field === 'email' ? 'We use this to send you your link. Nothing else.' : undefined}
        >
          {(attributes) => (
            <input
              {...attributes}
              type={type}
              autoComplete={autoComplete}
              value={answers[field]}
              onChange={(e) => {
                dispatch({ type: 'set-text', field, value: e.target.value })
              }}
              className={fieldStyles}
            />
          )}
        </Field>
      ))}
      <p className="text-sm text-on-surface-muted">
        Your answers go into your designs and nowhere else.{' '}
        <Link href="/privacy" className="underline underline-offset-4" target="_blank">
          How we use your details
        </Link>
        .
      </p>
    </div>
  )
}
