import { Check } from 'lucide-react'
import { captionStyles } from '@/components/ui/caption'
import { formatCountdown } from '@/lib/brief/time'
import { cn } from '@/lib/cn'

// Geometry of the ring, in SVG units. The stroke is drawn as one dash the length of the
// circumference and slid back as the time drains.
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type Props = { remainingMs: number; totalMs: number; ready: boolean; besideSlots?: boolean }

// The ring's box, its digits and its ready check. On its own, as the preview route's pending page
// shows it, it is the page's centrepiece. Beside the done pane's slots it is the same up to lg,
// and from lg it is a quieter instrument at 128 px, about the height of the three slots (148 px),
// so the slots keep the column's width and the whole block fits a laptop's first screen. Its
// digits drop to the subtitle size there, about half the ring's inner width, the proportion the
// ring has on a phone.
const SIZES = {
  alone: { box: 'size-44 sm:size-48', digits: 'text-display', check: 'size-10' },
  besideSlots: {
    box: 'size-44 sm:size-48 lg:size-32',
    digits: 'text-display lg:text-subtitle',
    check: 'size-10 lg:size-8',
  },
} as const

// A clock for the five minutes. Reads once to a screen reader as a timer; the digits do not
// announce every second.
//
// One hue: the fill and the ready check are brand-ink, never a green, so ready reads as ready by
// its word, its check and its full ring rather than by a second colour. The same ring stands on
// the done state's ink, where brand-ink is --brand (7.18:1 on the foot), and on the preview
// route's pending page on white, where it is #0369a1 (5.93:1). The track is the ground's own ink
// at a low share, so it is a quiet groove on either ground rather than a hairline.
export function CountdownRing({ remainingMs, totalMs, ready, besideSlots = false }: Props) {
  const fraction = totalMs === 0 ? 0 : remainingMs / totalMs
  const timeUp = remainingMs === 0 && !ready
  const size = besideSlots ? SIZES.besideSlots : SIZES.alone

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label="Time until your designs are ready"
      className={`relative shrink-0 ${size.box}`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="6"
          className="stroke-on-surface/12"
        />
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
            timeUp ? 'stroke-on-surface-muted/40' : 'stroke-brand-ink',
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {ready ? (
          <Check aria-hidden="true" className={`${size.check} text-brand-ink`} />
        ) : (
          <span className={`${size.digits} font-semibold tabular-nums`}>
            {formatCountdown(remainingMs)}
          </span>
        )}
        <span className={`${captionStyles} uppercase`}>
          {ready ? 'Ready' : timeUp ? 'Nearly there' : 'Building'}
        </span>
      </div>
    </div>
  )
}
