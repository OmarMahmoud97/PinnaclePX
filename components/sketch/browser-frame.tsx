import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { tabLabelFrom } from '@/lib/brief/sketch'
import { cn } from '@/lib/cn'

type Props = {
  company: string
  // Whether the brand colour has arrived: the tab then carries a dot in it.
  coloured: boolean
  className?: string | undefined
  // The page area: the sketch's wireframe, or a captured render of a real page.
  children: ReactNode
}

// The browser chrome the sketch draws around a page: three dots, a tab pill with the company's
// address, and whatever page sits below. It paints with the --sketch-* variables of the nearest
// stage, so a sketch and a captured render share one palette. Decorative on its own; the caller
// decides what is exposed to assistive technology.
export function BrowserFrame({ company, coloured, className, children }: Props) {
  return (
    <div
      data-frame="browser"
      className={cn(
        'overflow-hidden rounded-xl border border-(--sketch-line) bg-(--sketch-bg) text-[11px] text-(--sketch-fg) shadow-dialog transition-colors duration-500 sm:text-xs',
        className,
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-(--sketch-line) bg-(--sketch-bg-muted) px-3 py-2 transition-colors duration-500">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-(--sketch-line)" />
          <span className="size-2 rounded-full bg-(--sketch-line)" />
          <span className="size-2 rounded-full bg-(--sketch-line)" />
        </span>
        <span
          key={company}
          className="flex animate-sketch-in items-center gap-1.5 rounded-md border border-(--sketch-line) bg-(--sketch-bg) px-3 py-0.5 font-mono text-[9px] text-(--sketch-muted)"
        >
          {coloured && (
            <span className="size-1.5 animate-sketch-in rounded-full bg-(--sketch-strong)" />
          )}
          <Lock className="size-2.5" />
          {tabLabelFrom(company)}
        </span>
      </div>
      {children}
    </div>
  )
}
