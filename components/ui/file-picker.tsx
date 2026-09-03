'use client'

import { type ReactNode, useId, useRef } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  accept: string
  multiple?: boolean | undefined
  onFiles: (files: readonly File[]) => void
  className?: string | undefined
  children: ReactNode
}

// A hidden file input behind a large, dashed label that works as the button. The input is
// cleared after every pick so the same file can be chosen again after being removed.
export function FilePicker({ accept, multiple = false, onFiles, className, children }: Props) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])])
          e.target.value = ''
        }}
      />
      <label
        htmlFor={id}
        tabIndex={0}
        className={cn(
          'flex cursor-pointer items-center rounded-xl border border-dashed border-border px-4 transition-colors outline-none hover:border-on-surface-muted/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          className,
        )}
        onKeyDown={(e) => {
          // A label is not a button, so Enter and Space have to be wired up by hand.
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        {children}
      </label>
    </>
  )
}
