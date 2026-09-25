'use client'

import { type KeyboardEvent, useId, useState } from 'react'
import { DESCRIBE, meterShare, meterWords } from '@/app/start/_components/start-copy'
import type { StepProps } from '@/app/start/_components/step-props'
import { Field } from '@/components/ui/field'
import { finePointer } from '@/components/ui/fine-pointer'
import { CONFIG } from '@/lib/config'

// The key the hint names, as the keyboard labels it.
const ENTER = 'Enter'

// A hint with the key it names set as a keycap, wherever the words put it.
function WithKeycap({ hint, name }: { hint: string; name: string }) {
  const at = hint.indexOf(name)
  if (at === -1) return hint
  return (
    <>
      {hint.slice(0, at)}
      <kbd>{name}</kbd>
      {hint.slice(at + name.length)}
    </>
  )
}

// The well is the field, as the hero's prompt box is: the textarea sits bare inside it, so the
// whole well takes the focus outline (focus-within) and the red ring when the answer is too short
// (the start-well hook, app/_styles/start.css). Three rows at every width, so on a 390 by 844
// phone the ask and its promise land inside the first screen. Under it the meter shows how far the
// sentence has come, in a bar and in words the textarea's description carries
// (docs/start-page-journey-plan.md, 4.6), and the error keeps a line of its own below. With a fine
// pointer Enter goes on, which the page says, the key set as a keycap (plan 5.7); Shift and Enter
// is a new line. On a touch screen Enter is only ever a new line, so nothing is said, and no
// enterKeyHint either: the platform's own key is the truthful one.
export function DescribeStep({ answers, errors, dispatch }: StepProps) {
  const id = useId()
  const meterId = `${id}-meter`
  const enterId = `${id}-enter`
  // Read once: the flow renders in the browser alone (brief-flow.tsx).
  const [fine] = useState(finePointer)
  const { description } = answers

  // Not while an input method is composing, where Enter belongs to the word.
  function nextOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!fine || event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <Field
      id={id}
      label={DESCRIBE.label}
      hint={
        <>
          <span className="start-hint-long">{DESCRIBE.hint}</span>
          <span className="start-hint-short">{DESCRIBE.hintShort}</span>
        </>
      }
      notes={fine ? [meterId, enterId] : [meterId]}
      error={errors.description}
    >
      {(attributes) => (
        <>
          <div className="start-well rounded-2xl p-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-ink forced-colors:border">
            <textarea
              {...attributes}
              rows={3}
              maxLength={CONFIG.form.maxChars}
              value={description}
              onChange={(e) => {
                dispatch({ type: 'set-text', field: 'description', value: e.target.value })
              }}
              onKeyDown={nextOnEnter}
              className="w-full resize-none leading-relaxed caret-brand-ink outline-none"
            />
          </div>
          <p className="start-meter text-sm text-on-surface-muted">
            <span aria-hidden="true" className="start-meter-track">
              <span
                className="start-meter-fill"
                style={{ transform: `scaleX(${String(meterShare(description))})` }}
              />
            </span>
            <span id={meterId}>{meterWords(description)}</span>
            {fine && (
              <span aria-hidden="true" className="start-enter">
                <WithKeycap hint={DESCRIBE.enter} name={ENTER} />
              </span>
            )}
          </p>
          {fine && (
            <span id={enterId} hidden>
              {DESCRIBE.enterFull}
            </span>
          )}
        </>
      )}
    </Field>
  )
}
