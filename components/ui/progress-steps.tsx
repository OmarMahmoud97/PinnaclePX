import { cn } from '@/lib/cn'

type Props = { current: number; total: number }

// "Question N of M" with one segment per question. The text carries the meaning; the segments
// are decorative.
export function ProgressSteps({ current, total }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs text-on-surface-muted">
      <span>
        Question {current} of {total}
      </span>
      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn('h-1 w-5 rounded-full', i < current ? 'bg-brand-deeper' : 'bg-border')}
          />
        ))}
      </span>
    </div>
  )
}
