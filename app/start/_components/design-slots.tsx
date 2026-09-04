import { ArrowUpRight } from 'lucide-react'
import type { SubmissionStatus } from '@/lib/brief/status'
import { cn } from '@/lib/cn'

const ORDINALS = ['one', 'two', 'three', 'four', 'five'] as const

type Props = { status: SubmissionStatus; timeUp: boolean }

// One slot per design. Dashed and "building" until the pipeline reports a link, then a solid
// card that opens it. A slot takes its template's name as soon as the template is chosen. The
// slots are the same shape as the sketch's, so the page keeps one language for "not yet".
export function DesignSlots({ status, timeUp }: Props) {
  const concepts =
    status.status === 'building' || status.status === 'ready' || status.status === 'partial'
      ? status.concepts
      : []

  return (
    <ol aria-label="Your designs" className="flex w-full flex-col gap-2">
      {concepts.map((concept, index) => {
        const ordinal = ORDINALS[index] ?? String(index + 1)
        const label = concept.name ?? `Design ${ordinal}`
        return (
          <li
            key={ordinal}
            className={cn(
              'flex items-center gap-4 rounded-xl border px-4 py-3 text-sm transition-colors',
              concept.href === null
                ? 'border-dashed border-on-surface-muted/35'
                : 'border-border bg-surface shadow-badge',
            )}
          >
            <span className="font-mono text-xs text-on-surface-muted tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            {concept.href === null ? (
              <>
                <span className="flex-1">{label}</span>
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
                href={concept.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-between gap-3 font-medium hover:underline"
              >
                {label}
                <ArrowUpRight aria-hidden="true" className="size-4 text-on-surface-muted" />
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}
