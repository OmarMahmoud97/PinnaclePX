'use client'

import { useResubmit } from '@/app/admin/_components/standing-form'
import { captionStyles } from '@/components/ui/caption'
import { CONFIG } from '@/lib/config'

// A field on the panel: the site's tokens, 16px so iOS never zooms it, the authored focus outline.
const inputStyles =
  'w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-on-surface caret-brand-ink placeholder:text-on-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink'

// The three typed fields of the standing panel. Each mounts again with every answer from the
// action (its key), showing the words a refusal carried back, or the page's own values after a
// save took (standing-form.tsx). Uncontrolled, so the form still posts before hydration.

type NoteProps = Readonly<{ initial: string; labelledBy: string; describedBy: string }>

export function NoteField({ initial, labelledBy, describedBy }: NoteProps) {
  const { fields, attempt } = useResubmit()
  return (
    <textarea
      key={attempt}
      name="note"
      rows={3}
      maxLength={CONFIG.admin.noteMaxChars}
      defaultValue={fields?.note ?? initial}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      placeholder="What was agreed. Nothing you would not show them."
      className={`${inputStyles} field-sizing-content min-h-24`}
    />
  )
}

export function QuoteField({ initial }: Readonly<{ initial: string }>) {
  const { fields, attempt } = useResubmit()
  return (
    <label className="flex max-w-xs flex-col gap-1">
      <span className={captionStyles}>Quote, whole pounds</span>
      <input
        key={attempt}
        name="quotePounds"
        inputMode="numeric"
        pattern="[0-9]*"
        defaultValue={fields?.quotePounds ?? initial}
        className={inputStyles}
      />
    </label>
  )
}

type StartsAtProps = Readonly<{ initial: string; note: string | null }>

export function StartsAtField({ initial, note }: StartsAtProps) {
  const { fields, attempt } = useResubmit()
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className={captionStyles}>When (London time, optional)</span>
      <input
        key={attempt}
        type="datetime-local"
        name="startsAt"
        defaultValue={fields?.startsAt ?? initial}
        className={inputStyles}
      />
      {note !== null && <span className={captionStyles}>{note}</span>}
    </label>
  )
}
