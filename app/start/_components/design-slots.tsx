import { ArrowUpRight } from 'lucide-react'
import { cardInk } from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import type { SubmissionStatus } from '@/lib/brief/status'
import { cn } from '@/lib/cn'

const ORDINALS = ['one', 'two', 'three', 'four', 'five'] as const

type Props = { status: SubmissionStatus; timeUp: boolean }

// One slot per design. A slot still building is a plain row on the ink, with no surface and no
// edge, because a dashed box would be the one rule on the page; it takes its template's name as
// soon as the template is chosen, and its pulsing dot is the product's blue, the same hue as the
// ring beside it. Once the pipeline reports a link the row becomes an ink card that opens it, so
// "ready" is a change of ground and an arrow, never a second colour. Both keep one padding, so
// the numerals stay in a column as the rows turn.
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
              'flex items-center gap-4 px-4 py-3 text-sm transition-colors',
              concept.href !== null && cardInk,
            )}
          >
            <span className={captionStyles}>{String(index + 1).padStart(2, '0')}</span>
            {concept.href === null ? (
              <>
                <span className="flex-1">{label}</span>
                <span className="flex items-center gap-2 text-label text-on-surface-muted">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-1.5 rounded-full',
                      timeUp ? 'bg-on-surface-muted/50' : 'animate-pulse bg-brand-ink',
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
                className="flex flex-1 items-center justify-between gap-3 rounded-sm font-medium text-on-surface underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                {label}
                <ArrowUpRight aria-hidden="true" className="size-4 text-brand-ink" />
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}
