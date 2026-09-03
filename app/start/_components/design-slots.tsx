import { ArrowUpRight } from 'lucide-react'
import type { DesignsStatus } from '@/lib/brief/designs'
import { cn } from '@/lib/cn'
import { CONFIG } from '@/lib/config'

const ORDINALS = ['one', 'two', 'three', 'four', 'five'] as const

type Props = { designs: DesignsStatus; timeUp: boolean }

// One slot per design. Dashed and "building" until the pipeline reports a link, then a solid
// card that opens it. The slots are the same shape as the sketch's, so the page keeps one
// language for "not yet".
export function DesignSlots({ designs, timeUp }: Props) {
  const ready = designs.status === 'ready' ? designs.designs : []

  return (
    <ol aria-label="Your designs" className="flex w-full flex-col gap-2">
      {Array.from({ length: CONFIG.templates.conceptsShown }, (_, index) => {
        const design = ready[index]
        const ordinal = ORDINALS[index] ?? String(index + 1)
        return (
          <li
            key={ordinal}
            className={cn(
              'flex items-center gap-4 rounded-xl border px-4 py-3 text-sm transition-colors',
              design === undefined
                ? 'border-dashed border-on-surface-muted/35'
                : 'border-border bg-surface shadow-badge',
            )}
          >
            <span className="font-mono text-xs text-on-surface-muted tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            {design === undefined ? (
              <>
                <span className="flex-1">Design {ordinal}</span>
                <span className="flex items-center gap-2 font-mono text-[11px] text-on-surface-muted">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-1.5 rounded-full',
                      timeUp ? 'bg-on-surface-muted/50' : 'animate-pulse bg-brand-deeper',
                    )}
                  />
                  {timeUp ? 'on its way' : 'building'}
                </span>
              </>
            ) : (
              <a
                href={design.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-between gap-3 font-medium hover:underline"
              >
                {design.title}
                <ArrowUpRight aria-hidden="true" className="size-4 text-on-surface-muted" />
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}
