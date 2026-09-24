'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  accept: string
  multiple?: boolean | undefined
  onFiles: (files: readonly File[]) => void
  className?: string | undefined
  children: ReactNode
}

// The native file input is the one tab stop and the button a screen reader hears, and it opens
// the dialog on Enter and Space by itself. It lies transparent over the whole card, so a Tab
// scrolls the card clear of the ask; a 1 px sr-only input would sit at the top of its parent's
// flex column, which can leave the card behind the ask on a small phone. Pointer events pass
// through it to the label, which opens the dialog and keeps the hover. The card draws the
// authored outline while the input inside has keyboard focus. The input is cleared after every
// pick so the same file can be chosen again after being removed.
//
// The label is a white card on the wash, as every control on /start is: no dashed edge, the
// card's shadow instead, a tinted fill on hover, the authored focus outline, and a border under
// forced colours only (components/ui/field.tsx says why).
export function FilePicker({ accept, multiple = false, onFiles, className, children }: Props) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer items-center rounded-2xl bg-surface px-4 shadow-card transition-colors hover:bg-surface-tint has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink forced-colors:border',
        className,
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="pointer-events-none absolute inset-0 size-full opacity-0"
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])])
          e.target.value = ''
        }}
      />
      {children}
    </label>
  )
}
