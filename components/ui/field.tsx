import { CircleAlert } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

// A field on /start is a well in the question's card (docs/start-page-journey-plan.md, 5.7): the
// wash inside the white card from sm, white on the wash below it where the card is flat, with a
// soft inset edge and no border, and a placeholder at the full muted colour. Its boundary is
// about 1.18:1, so the control is known by its label, its fill, its edge and its placeholder, a
// judgement ADR 0037 re-signs by hand. Focus is the site's authored outline rather than a
// box-shadow ring, because forced colours drop box-shadows and would leave the focused field with
// no indicator; for the same reason the well takes a border there and nowhere else. An invalid
// field takes a red ring, which clears the 3:1 a mark needs where red as text would not. The
// well, its edge, its ring and its text size (16px on a phone, since anything smaller makes iOS
// Safari zoom the page on focus, 20px from sm) are /start's rules, on the start-well hook
// (app/_styles/start.css).
export const fieldStyles =
  'start-well w-full rounded-2xl px-4 py-3 caret-brand-ink placeholder:text-on-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink forced-colors:border'

// A message about an answer. --danger is 3.76:1 on white and 3.17:1 on the wash, so it fails as
// text and passes as a mark: the words are dark and the red is the icon that leads them. Passed
// through to the paragraph, so the submit error can be the page's alert with the same look.
export function FieldError({ children, ...rest }: Omit<ComponentProps<'p'>, 'className'>) {
  return (
    <p {...rest} className="flex items-start gap-1.5 text-sm font-medium text-on-surface">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
      {children}
    </p>
  )
}

type Props = {
  id: string
  label: string
  hint?: ReactNode
  // The ids of other lines that describe the control, read after the hint: a meter, a key hint.
  notes?: readonly string[] | undefined
  error?: string | undefined
  children: (attributes: {
    id: string
    'aria-describedby': string | undefined
    'aria-invalid': boolean
  }) => ReactNode
}

// Label, control, hint and error wired together for assistive tech. The control is a render prop
// so the same wiring serves an input, a textarea or a group of choices.
export function Field({ id, label, hint, notes = [], error, children }: Props) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [
      ...(hint === undefined ? [] : [hintId]),
      ...notes,
      ...(error === undefined ? [] : [errorId]),
    ].join(' ') || undefined

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
      {error !== undefined && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  )
}
