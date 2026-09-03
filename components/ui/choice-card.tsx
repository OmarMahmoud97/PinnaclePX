'use client'

import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  selected: boolean
  onSelect: () => void
  // Called with true while the pointer or focus rests on the card, false when it leaves.
  onPreview?: ((active: boolean) => void) | undefined
  title: string
  detail?: string | undefined
  media?: ReactNode
}

// A large, tappable option. Radio semantics so a keyboard reaches the group once and arrows
// through it, and so screen readers announce "2 of 4".
export function ChoiceCard({ selected, onSelect, onPreview, title, detail, media }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onMouseEnter={() => onPreview?.(true)}
      onMouseLeave={() => onPreview?.(false)}
      onFocus={() => onPreview?.(true)}
      onBlur={() => onPreview?.(false)}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        selected
          ? 'border-brand-deeper bg-brand-deeper/5'
          : 'border-border hover:border-on-surface-muted/40 hover:bg-accent',
      )}
    >
      {media}
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">{title}</span>
        {detail !== undefined && <span className="text-sm text-on-surface-muted">{detail}</span>}
      </span>
      <Check
        aria-hidden="true"
        className={cn(
          'ml-auto size-4 shrink-0 text-brand-deeper transition-opacity',
          selected ? 'opacity-100' : 'opacity-0',
        )}
      />
    </button>
  )
}
