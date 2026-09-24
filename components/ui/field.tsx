import { CircleAlert } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

// A field on /start is a white card floating on the wash, the way the hero's prompt box floats
// on the ink: no border, the card's shadow for its edge, and a placeholder at the full muted
// colour (7.58:1 on white). Against the wash its boundary is 1.18:1, so the control is known by
// its label, its fill, its shadow and its placeholder, a judgement ADR 0035 records by hand.
// Focus is the site's authored outline rather than a box-shadow ring, because forced colours
// drop box-shadows and would leave the focused field with no indicator; for the same reason the
// card takes a border there and nowhere else. An invalid field keeps a red ring, which clears the
// 3:1 a mark needs where red as text would not. text-base at every size: anything smaller makes
// iOS Safari zoom the page on focus. One line is 48px, the height of the ask beside it.
export const fieldStyles =
  'w-full rounded-2xl bg-surface px-4 py-3 text-base shadow-card caret-brand-ink transition-colors placeholder:text-on-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger forced-colors:border'

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
      {error !== undefined && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  )
}
