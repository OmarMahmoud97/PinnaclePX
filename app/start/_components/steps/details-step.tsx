'use client'

import Link from 'next/link'
import { type KeyboardEvent, useId } from 'react'
import { DETAILS } from '@/app/start/_components/start-copy'
import type { StepProps } from '@/app/start/_components/step-props'
import { Field, fieldStyles } from '@/components/ui/field'
import { textLinkStyles } from '@/components/ui/text-link'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// The last question: where the designs go, then who they are for (docs/start-page-journey-plan.md,
// 4.6 and 4.7). The phone keyboard's Enter key says what it does: Next on the email, which moves to
// the name, and Send on the name, which sends the brief as the ask does. A key labelled Next that
// sent the brief would send it with the name still empty, so Enter on the email only moves on; not
// while an input method is composing a word, where Enter belongs to the composition.
function moveOn(event: KeyboardEvent<HTMLInputElement>, nextId: string) {
  if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
  event.preventDefault()
  document.getElementById(nextId)?.focus()
}

export function DetailsStep({ answers, errors, dispatch }: StepProps) {
  const prefix = useId()
  const emailId = `${prefix}-email`
  const nameId = `${prefix}-name`

  return (
    <div className="flex flex-col gap-4">
      <Field
        id={emailId}
        label={DETAILS.email}
        hint={
          <>
            <span className="start-hint-long">{DETAILS.emailHint}</span>
            <span className="start-hint-short">{DETAILS.emailHintShort}</span>
          </>
        }
        error={errors.email}
      >
        {(attributes) => (
          <input
            {...attributes}
            type="email"
            inputMode="email"
            autoComplete="email"
            enterKeyHint="next"
            value={answers.email}
            onChange={(e) => {
              dispatch({ type: 'set-text', field: 'email', value: e.target.value })
            }}
            onKeyDown={(e) => {
              moveOn(e, nameId)
            }}
            className={fieldStyles}
          />
        )}
      </Field>
      <Field id={nameId} label={DETAILS.name} error={errors.name}>
        {(attributes) => (
          <input
            {...attributes}
            type="text"
            autoComplete="name"
            enterKeyHint="send"
            maxLength={CONFIG.start.names.personMax}
            value={answers.name}
            onChange={(e) => {
              dispatch({ type: 'set-text', field: 'name', value: e.target.value })
            }}
            className={fieldStyles}
          />
        )}
      </Field>
      <p className="text-sm text-on-surface-muted">
        <Link href="/privacy" target="_blank" className={textLinkStyles}>
          {DETAILS.detailsLink}
          <span className="sr-only"> {SITE.newTab}</span>
        </Link>
      </p>
    </div>
  )
}
