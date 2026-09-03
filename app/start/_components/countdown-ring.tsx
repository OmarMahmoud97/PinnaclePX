import { Check } from 'lucide-react'
import { formatCountdown } from '@/lib/brief/time'
import { cn } from '@/lib/cn'

// Geometry of the ring, in SVG units. The stroke is drawn as one dash the length of the
// circumference and slid back as the time drains.
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type Props = { remainingMs: number; totalMs: number; ready: boolean }

// A big clock for the five minutes. Reads once to a screen reader as a timer; the digits do not
// announce every second.
export function CountdownRing({ remainingMs, totalMs, ready }: Props) {
  const fraction = totalMs === 0 ? 0 : remainingMs / totalMs
  const timeUp = remainingMs === 0 && !ready

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label="Time until your designs are ready"
      className="relative size-44 shrink-0 sm:size-48"
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="6" className="stroke-border" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={ready ? 0 : CIRCUMFERENCE * (1 - fraction)}
          className={cn(
            'transition-[stroke-dashoffset] duration-1000 ease-linear',
            ready
              ? 'stroke-success'
              : timeUp
                ? 'stroke-on-surface-muted/40'
                : 'stroke-brand-deeper',
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {ready ? (
          <Check aria-hidden="true" className="size-10 text-success" />
        ) : (
          <span className="text-4xl font-semibold tracking-tighter tabular-nums sm:text-5xl">
            {formatCountdown(remainingMs)}
          </span>
        )}
        <span className="font-mono text-[11px] tracking-wide text-on-surface-muted uppercase">
          {ready ? 'Ready' : timeUp ? 'Nearly there' : 'Building'}
        </span>
      </div>
    </div>
  )
}
