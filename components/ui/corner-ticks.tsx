import { cn } from '@/lib/cn'

type Edge = 'top' | 'bottom'

const CORNERS = ['left', 'right'] as const

// Class names stay literal so Tailwind can see them.
const EDGE = {
  top: { line: '-top-px', bar: '-top-3' },
  bottom: { line: '-bottom-px', bar: '-bottom-3' },
} as const
const SIDE = {
  left: { line: '-left-3', bar: '-left-px' },
  right: { line: '-right-3', bar: '-right-px' },
} as const

type Props = { edges?: readonly Edge[] | undefined }

// Crosshair marks at the corners of a bordered block. The parent must be positioned.
export function CornerTicks({ edges = ['bottom'] }: Props) {
  return (
    <>
      {edges.flatMap((edge) =>
        CORNERS.map((corner) => (
          <span key={`${edge}-${corner}`} aria-hidden="true" className="text-on-surface-muted/50">
            <span
              className={cn(
                'absolute z-40 h-px w-6 bg-current',
                EDGE[edge].line,
                SIDE[corner].line,
              )}
            />
            <span
              className={cn('absolute z-40 h-6 w-px bg-current', EDGE[edge].bar, SIDE[corner].bar)}
            />
          </span>
        )),
      )}
    </>
  )
}
