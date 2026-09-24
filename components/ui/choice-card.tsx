'use client'

import { Check } from 'lucide-react'
import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'

// Which way each arrow moves through the group: down and right to the next card, up and left to
// the one before. Directions, not tuning numbers, so they stay out of CONFIG.
const ARROW_STEPS: Readonly<Record<string, number>> = {
  ArrowDown: 1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowLeft: -1,
}

// An arrow moves focus to the next card in the group and chooses it, as a native radio group
// does, wrapping from the last card to the first and back. The page must not scroll as well, so
// the key's default is stopped; focusing the card still scrolls it clear of the ask, through the
// page's scroll padding.
function moveWithArrows(event: KeyboardEvent<HTMLButtonElement>) {
  const step = ARROW_STEPS[event.key]
  if (step === undefined || event.altKey || event.ctrlKey || event.metaKey) return
  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (group === null) return
  const radios = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
  const next = radios[(radios.indexOf(event.currentTarget) + step + radios.length) % radios.length]
  if (next === undefined) return
  event.preventDefault()
  next.focus()
  next.click()
}

type Props = {
  selected: boolean
  // Whether this card holds the group's one Tab stop: the chosen card, or the first when none is.
  tabbable: boolean
  onSelect: () => void
  // Called with true while the pointer or focus rests on the card, false when it leaves.
  onPreview?: ((active: boolean) => void) | undefined
  title: string
  detail?: string | undefined
  media?: ReactNode
}

// A large, tappable option. Radio semantics with one Tab stop per group, on the chosen card or
// the first, and the arrows move the choice through it as a native radio group does, so screen
// readers announce "2 of 4" and the keys do what that announcement promises.
//
// A white card on the wash like every control on /start, 64px at the least so four stack short
// on a phone. Chosen is two cues, never colour alone: a brand-ink ring and the check. Hover tints
// the fill, which a control may do. Focus is the authored outline and forced colours add a
// border, for the reasons fieldStyles gives (components/ui/field.tsx).
export function ChoiceCard({
  selected,
  tabbable,
  onSelect,
  onPreview,
  title,
  detail,
  media,
}: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={onSelect}
      onKeyDown={moveWithArrows}
      onMouseEnter={() => onPreview?.(true)}
      onMouseLeave={() => onPreview?.(false)}
      onFocus={() => onPreview?.(true)}
      onBlur={() => onPreview?.(false)}
      className={cn(
        'flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-card transition-colors hover:bg-surface-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink forced-colors:border',
        selected && 'ring-2 ring-brand-ink',
      )}
    >
      {media}
      <span className="flex min-w-0 flex-col">
        <span className="text-small font-medium">{title}</span>
        {detail !== undefined && <span className="text-sm text-on-surface-muted">{detail}</span>}
      </span>
      <Check
        aria-hidden="true"
        className={cn(
          'ml-auto size-4 shrink-0 text-brand-ink transition-opacity',
          selected ? 'opacity-100' : 'opacity-0',
        )}
      />
    </button>
  )
}
