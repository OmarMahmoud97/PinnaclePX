'use client'

import type { ReactNode } from 'react'

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
// through it to the label, which opens the dialog. The card draws the authored outline while the
// input inside has keyboard focus. The input is cleared after every pick so the same file can be
// chosen again after being removed.
//
// The label is a tile like a choice card (docs/start-page-journey-plan.md, 5.7): a well of the
// question card's ground, no dashed edge, the authored focus outline, and a border under forced
// colours only (components/ui/field.tsx says why). Its looks and its hover are /start's own
// rules, on the file-picker hook (app/_styles/start.css), as a choice card's are.
export function FilePicker({ accept, multiple = false, onFiles, className = '', children }: Props) {
  return (
    <label
      className={`file-picker relative flex cursor-pointer items-center rounded-2xl px-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-ink forced-colors:border ${className}`}
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
