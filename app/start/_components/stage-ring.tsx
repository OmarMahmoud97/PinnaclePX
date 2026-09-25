import type { CSSProperties } from 'react'
import { ringCentre } from '@/app/start/_components/done-copy'

// The ring's geometry, in SVG units: one stroke the length of the circumference, slid back by the
// share of the stages still to land.
const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type Props = Readonly<{ landed: number; stages: number }>

// How far the build has got, as a ring beside the time (docs/start-page-journey-plan.md, 4.4 and
// 6.2): its arc grows a share as each stage lands, and its centre counts them, "3 of 5". Nothing
// in it ticks, so it is decoration: the time line beside it and the status line say the same in
// words, and the whole ring is hidden from the screen reader (plan 9.2). Its track and arc are
// start-done-view.css's, the arc in the product's blue, and the system's colours under forced
// colours.
export function StageRing({ landed, stages }: Props) {
  const share = stages === 0 ? 0 : landed / stages
  return (
    <span aria-hidden="true" className="stage-ring">
      <svg viewBox="0 0 48 48">
        <circle className="stage-ring-track" cx="24" cy="24" r={RADIUS} />
        <circle
          className="stage-ring-arc"
          cx="24"
          cy="24"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          style={{ '--ring-left': CIRCUMFERENCE * (1 - share) } as CSSProperties}
        />
      </svg>
      <span className="stage-ring-count">{ringCentre(landed, stages)}</span>
    </span>
  )
}
