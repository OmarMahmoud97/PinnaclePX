import { cn } from '@/lib/cn'

const CORNERS = ['left', 'right'] as const

// Crosshair marks at the bottom corners of a bordered section. The parent must be positioned.
export function CornerTicks() {
  return (
    <>
      {CORNERS.map((corner) => (
        <span key={corner} aria-hidden="true" className="text-on-surface-muted/50">
          <span
            className={cn(
              'absolute -bottom-px z-40 h-px w-6 bg-current',
              corner === 'left' ? '-left-3' : '-right-3',
            )}
          />
          <span
            className={cn(
              'absolute -bottom-3 z-40 h-6 w-px bg-current',
              corner === 'left' ? '-left-px' : '-right-px',
            )}
          />
        </span>
      ))}
    </>
  )
}
