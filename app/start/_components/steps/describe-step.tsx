'use client'

import { useId } from 'react'
import type { StepProps } from '@/app/start/_components/step-props'
import { captionStyles } from '@/components/ui/caption'
import { Field } from '@/components/ui/field'
import { CONFIG } from '@/lib/config'

const EXAMPLE =
  'For example: Physiotherapy clinic in Sheffield. Sports injuries, post-op rehab, same-week appointments.'

// The card is the field, as the hero's prompt box is: the textarea sits bare inside it with the
// counter at its foot, so the whole card takes the focus outline (focus-within) and the red ring
// when the answer is too short. Three rows at every width, so on a 390 by 844 phone the ask and
// its promise land inside the first screen. No enterKeyHint: Enter writes a new line here, so the
// platform's own key is the truthful one.
export function DescribeStep({ answers, errors, dispatch }: StepProps) {
  const id = useId()
  const used = answers.description.trim().length

  return (
    <Field id={id} label="What does your business do?" hint={EXAMPLE} error={errors.description}>
      {(attributes) => (
        <div
          className={`flex flex-col gap-1 rounded-2xl bg-surface p-4 shadow-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ink forced-colors:border ${attributes['aria-invalid'] ? 'ring-2 ring-danger' : ''}`}
        >
          <textarea
            {...attributes}
            rows={3}
            maxLength={CONFIG.form.maxChars}
            value={answers.description}
            onChange={(e) => {
              dispatch({ type: 'set-text', field: 'description', value: e.target.value })
            }}
            className="w-full resize-none text-base leading-relaxed caret-brand-ink outline-none"
          />
          <p className={`${captionStyles} text-right`}>
            {used} / {CONFIG.form.maxChars}
          </p>
        </div>
      )}
    </Field>
  )
}
