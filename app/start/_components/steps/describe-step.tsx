'use client'

import { useId } from 'react'
import type { StepProps } from '@/app/start/_components/step-props'
import { Field, fieldStyles } from '@/components/ui/field'
import { CONFIG } from '@/lib/config'

const EXAMPLE =
  'For example: Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab, same-week appointments.'

export function DescribeStep({ answers, errors, dispatch }: StepProps) {
  const id = useId()
  const used = answers.description.trim().length

  return (
    <Field id={id} label="What does your business do?" hint={EXAMPLE} error={errors.description}>
      {(attributes) => (
        <>
          <textarea
            {...attributes}
            rows={4}
            maxLength={CONFIG.form.maxChars}
            value={answers.description}
            onChange={(e) => {
              dispatch({ type: 'set-text', field: 'description', value: e.target.value })
            }}
            className={`${fieldStyles} resize-none leading-relaxed`}
          />
          <p className="text-right text-xs text-on-surface-muted tabular-nums">
            {used} / {CONFIG.form.maxChars}
          </p>
        </>
      )}
    </Field>
  )
}
