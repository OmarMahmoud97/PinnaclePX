import type { ReactNode } from 'react'
import { Bar } from '@/components/sketch/sketch-parts'
import { cn } from '@/lib/cn'

type Props = {
  // CSS zoom, not a transform: the frame lays out at the zoomed size and its text stays crisp.
  zoom?: number | undefined
  className?: string | undefined
  // The screen: the sketch's wireframe, or a captured render of a real page.
  children: ReactNode
}

// The phone shell the sketch draws: a 9:19 frame with the speaker bar, painted with the
// --sketch-* variables of the nearest stage. The screen is whatever the caller puts inside.
export function PhoneFrame({ zoom = 1, className, children }: Props) {
  return (
    <div
      data-frame="phone"
      style={zoom === 1 ? undefined : { zoom }}
      className={cn(
        'flex aspect-[9/19] w-36 flex-col overflow-hidden rounded-[1.25rem] border border-(--sketch-line) bg-(--sketch-bg) text-[8px] text-(--sketch-fg) shadow-dialog ring-4 ring-scrim/5 transition-colors duration-500',
        className,
      )}
    >
      <div className="flex justify-center pt-2 pb-1">
        <Bar className="h-1 w-8" />
      </div>
      {children}
    </div>
  )
}
