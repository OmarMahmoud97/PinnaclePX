import { captionStyles } from '@/components/ui/caption'
import { cn } from '@/lib/cn'

type Props = {
  current: number
  total: number
  // Classes for the segments' row, so a tight place can drop them (the questionnaire's island
  // below sm does) while the words stay.
  segmentsClassName?: string | undefined
  // The words in place of the count, for the questionnaire's done state: no question is left,
  // and every segment is lit.
  label?: string | undefined
}

// "Question N of M" with one segment per question, or a caller's own words in place of the
// count. The text carries the meaning; the segments are decorative. The words are one string,
// so one text node: WebKit sets a lone digit node in proportional figures despite tabular-nums,
// so the line's width changed with the question, and the island, measured once at question one,
// was too short from question two. The caption's classes go in as a plain string, never through
// cn(): tailwind-merge reads text-label and the caption's colour as one group and drops the size,
// which set the line at 16px on 24px lines. The colour fades with the header's own ink where the
// line sits in the island and the ground under it changes scope.
export function ProgressSteps({ current, total, segmentsClassName, label }: Props) {
  return (
    <div
      className={`${captionStyles} flex items-center justify-between gap-4 transition-colors duration-(--motion-enter) ease-standard`}
    >
      <span className="whitespace-nowrap tabular-nums">
        {label ?? `Question ${String(current)} of ${String(total)}`}
      </span>
      <span aria-hidden="true" className={cn('flex gap-1', segmentsClassName)}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 w-5 rounded-full transition-colors duration-(--motion-enter)',
              i < current ? 'bg-brand-ink' : 'bg-on-surface/12',
            )}
          />
        ))}
      </span>
    </div>
  )
}
