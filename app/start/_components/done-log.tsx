import { Check } from 'lucide-react'
import { type LogLine, stampOf } from '@/app/start/_components/done-progress'
import { LineWords } from '@/app/start/_components/line-words'

// The build's log (docs/start-page-journey-plan.md, 4.6 and 9.2): a plain list, never a live
// region, since the status line says each stage once; a line for each stage as it lands, with the
// server's own time for it, which never ticks, and a line with no time while the headlines or the
// photos are made. The marks and the times are for the eye, so the screen reader hears only the
// words. A name in a line is isolated, so another script never turns the sentence around it.
export function DoneLog({ lines }: Readonly<{ lines: readonly LogLine[] }>) {
  return (
    <ol className="done-log">
      {lines.map(({ id, words, running, atS }) => (
        <li key={id} data-running={running ? '' : undefined}>
          <span aria-hidden="true" className="done-log-mark">
            {!running && <Check className="size-3" />}
          </span>
          {atS !== null && (
            <span aria-hidden="true" className="done-log-stamp">
              {stampOf(atS)}
            </span>
          )}
          <span className="done-log-words">
            {typeof words === 'string' ? words : <LineWords line={words} />}
          </span>
        </li>
      ))}
    </ol>
  )
}
