import type { ReactNode } from 'react'

// Shared input styling so every field in the brief has the same focus ring as the buttons.
// text-base at every size: anything smaller makes iOS Safari zoom the page on focus.
export const fieldStyles =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-base outline-none transition-colors placeholder:text-on-surface-muted/70 focus-visible:border-brand-deeper focus-visible:ring-2 focus-visible:ring-brand-deeper/40 aria-[invalid=true]:border-danger'

type Props = {
  id: string
  label: string
  hint?: string | undefined
  error?: string | undefined
  children: (attributes: {
    id: string
    'aria-describedby': string | undefined
    'aria-invalid': boolean
  }) => ReactNode
}

// Label, control, hint and error wired together for assistive tech. The control is a render prop
// so the same wiring serves an input, a textarea or a group of choices.
export function Field({ id, label, hint, error, children }: Props) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [hint === undefined ? null : hintId, error === undefined ? null : errorId]
      .filter((value) => value !== null)
      .join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {hint !== undefined && (
        <p id={hintId} className="text-sm text-on-surface-muted">
          {hint}
        </p>
      )}
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error !== undefined })}
      {error !== undefined && (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
