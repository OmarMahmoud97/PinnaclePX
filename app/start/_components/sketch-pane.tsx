'use client'

import { type CSSProperties, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react'
import { validateQuestion } from '@/app/start/_components/brief-reducer'
import { DRAFT_CAPTION } from '@/app/start/_components/draft-copy'
import {
  type DraftExtras,
  draftModelFrom,
  isGreyHex,
  NO_EXTRAS,
  reaches,
  whisperOf,
} from '@/app/start/_components/draft/draft-model'
import { Draft } from '@/app/start/_components/draft/draft-page'
import type { Focus } from '@/app/start/_components/draft/draft-parts'
import { useFace } from '@/app/start/_components/draft/load-faces'
import { SketchChips } from '@/components/sketch/sketch-chips'
import { captionStyles } from '@/components/ui/caption'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { startCurve } from '@/lib/motion/start-curve'

// The widths at which a part of the region first shows (app/_styles/start-draft.css): the board
// and the whisper at lg, and the phone frame over the browser's corner at 80rem.
const FRAME_BOUNDARIES = ['(width >= 64rem)', '(width >= 80rem)'] as const

type Props = {
  answers: Answers
  // The question showing, 0-based, or all five once this tab's brief is sent: the chips' count
  // and the question whose part the draft marks.
  answered: number
  // The brief is sent: the lamp brightens, the caption turns to the call and the curve goes.
  done: boolean
  // A done view this tab did not send (plan 4.9, restored): there are no answers to draw, so the
  // draft is never shown, and the region takes the build's colour from the poll instead.
  restored?: boolean | undefined
  // The build's colour, once the poll has it, for a restored view; null before, and for this
  // tab's own send, whose answers colour the region.
  builtHex?: string | null | undefined
  // The build ended without designs: the caption changes, and a restored view's region empties.
  stopped?: boolean | undefined
  // The furthest question reached, which decides what the draft shows (plan D3); the question
  // showing until the flow passes it.
  reached?: number | undefined
  // The pictures and a hovered answer, beside the answers.
  extras?: DraftExtras | undefined
  // The done view's designs, drawn beside the draft (plan D18).
  doneSlot?: ReactNode
  // Painted by the server's skeleton, which the flow replaces as soon as it mounts.
  still?: boolean | undefined
}

// The home page's pooled curve under the region (app/page.tsx explains its geometry), springing
// on each question change below lg (lib/motion/start-curve.ts): down for a Next, up for a Back.
// A dark scope of its own, so the island reads the ink where the curve passes under it. The
// hide from lg matters: .ink-pool is an unlayered rule whose display beats any utility.
function PoolCurve({ step }: { step: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const kick = useRef<((direction: 1 | -1) => void) | null>(null)
  const last = useRef(step)

  useEffect(() => {
    if (ref.current === null) return
    const curve = startCurve(ref.current)
    kick.current = curve.kick
    return curve.stop
  }, [])

  useEffect(() => {
    if (step === last.current) return
    kick.current?.(step > last.current ? 1 : -1)
    last.current = step
  }, [step])

  return (
    <svg
      ref={ref}
      data-curve=""
      data-theme="dark"
      className="ink-pool lg:hidden!"
      viewBox="0 0 1000 140"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 -2H1000V0A962.857 962.857 0 0 1 0 0Z" />
    </svg>
  )
}

// The region "Your brief so far": the visitor's live draft on the hero's ink, lit by the lamp
// behind it (docs/start-page-journey-plan.md, 5.3 to 5.8). The skeleton draws it blank at the
// first question and the flow from the live answers, at the same geometry, so hydration moves
// nothing. It follows main in the DOM, so a screen reader hears the question first, and it
// holds nothing focusable while the visitor answers; the draft is hidden from assistive
// technology, and the sentence under it says the brief in words (SketchChips, its visible chips
// retired, plan 5.6).
//
// Below lg it comes first on screen: the draft's frame zoomed whole to the screen, then the
// pooled curve over the wash while the visitor answers. From lg it is the right-hand pane on the ramp's dark band: the
// board, which holds the browser frame with the phone over its corner, the caption, and the
// business name set large at the foot, and which keeps its own screen while a long question
// scrolls (start-board, app/_styles/start.css); below lg and at done the board is no box, so the
// region lays those parts out itself. The ramp is painted on the ground layer
// (start-ground-region, app/_styles/start.css); the region itself is no dark scope, since the
// draft's frames read the light scope's surfaces. It is raised one level, which makes it the
// ground layer's stacking context, so main, which follows it on screen below lg, never paints
// over the curve.
//
// The region carries the colour and the face for everything in it: --draft-hex, which the lamp
// takes as its glow (start-draft.css) and the draft's engine retints from, and --draft-face. The
// colour is the answers' while the tab has them, and the build's own on a restored done view, so
// the lamp behind the posters matches the fill they carry (plan 5.3, the table).
export function SketchPane({
  answers,
  answered,
  done,
  restored = false,
  builtHex = null,
  stopped = false,
  reached = answered,
  extras = NO_EXTRAS,
  doneSlot,
  still = false,
}: Props) {
  // The flow draws the region afresh over the skeleton on every load, a refresh among them, and
  // nothing it shows then is news: the draft's and the whisper's entrances are finished before
  // the first paint (plan 3.1), so only what an answer brings later lands. Nothing in them loops
  // (plan 6.3), so each has an end to finish at. A frame the screen's width had hidden starts its
  // entrances afresh the moment it shows, so a tablet turned across lg, or a phone across 36rem,
  // would watch the board land again: each frame boundary is watched, and the entrances are
  // finished again as it is crossed.
  const region = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const finish = () => {
      for (const part of region.current?.querySelectorAll('.draft, .draft-whisper') ?? []) {
        for (const animation of part.getAnimations({ subtree: true })) animation.finish()
      }
    }
    finish()
    const boundaries = FRAME_BOUNDARIES.map((query) => window.matchMedia(query))
    for (const boundary of boundaries) boundary.addEventListener('change', finish)
    return () => {
      for (const boundary of boundaries) boundary.removeEventListener('change', finish)
    }
  }, [])

  const draft = draftModelFrom(answers, reached, extras)
  const face = useFace(draft.style, reaches(reached, 'brand'))
  const id = done ? undefined : QUESTION_IDS[answered]
  const focus: Focus =
    id === undefined
      ? null
      : { id, ticked: Object.keys(validateQuestion(id, answers)).length === 0 }
  const whisper = whisperOf(draft.company)
  const hex = draft.hex ?? builtHex
  const grey = hex !== null && isGreyHex(hex)
  // The caption on the ink: the live draft, the designs in its place, or the sealed draft of a
  // build that ended without them; a restored view of such a build has nothing to caption.
  const caption = !done
    ? DRAFT_CAPTION.live
    : !stopped
      ? DRAFT_CAPTION.done
      : restored
        ? null
        : DRAFT_CAPTION.stopped

  // The skeleton's pre-paint marks a done address's region restored before this draws it
  // (start-skeleton.tsx), which React would otherwise report as the server's extra attribute.
  return (
    <section
      ref={region}
      suppressHydrationWarning
      aria-label="Your brief so far"
      data-coloured={hex === null ? undefined : ''}
      data-grey={grey ? '' : undefined}
      data-done={done ? '' : undefined}
      data-restored={restored ? '' : undefined}
      style={{ '--draft-hex': hex, '--draft-face': face.family } as CSSProperties}
      className="start-region relative z-1 flex flex-col items-center justify-center px-4 pt-18 pb-6 max-lg:order-first sm:px-8 lg:gap-6 lg:overflow-clip lg:px-10 lg:pt-24 lg:pb-16"
    >
      <div
        aria-hidden="true"
        data-theme="dark"
        className="start-ground-region absolute inset-0 -z-1 bg-surface"
      />

      <div className="start-board">
        {/* The lamp's anchor (app/_styles/start.css). */}
        <div className="start-stage">
          <Draft model={draft} focus={focus} face={face} still={still} />
        </div>

        {whisper !== null && (
          <div aria-hidden="true" className="draft-whisper">
            <p style={{ '--graphemes': whisper.graphemes } as CSSProperties}>{whisper.text}</p>
          </div>
        )}

        {doneSlot}

        <div data-theme="dark" className="flex min-w-0 flex-col gap-3 lg:items-center">
          {/* A plain string: cn() would drop the caption's size in favour of its colour. */}
          {caption !== null && (
            <p className={`${captionStyles} hidden max-w-sm text-center text-balance lg:block`}>
              {caption}
            </p>
          )}
          <SketchChips answers={answers} answered={answered} chips={false} />
        </div>
      </div>

      {/* Drawn only while the visitor answers. Once the brief is sent main is the ink too, so
          the curve would be ink on ink; with main's clearance gone (start-layout.ts) it would
          hang over the done view's heading; and forced colours keep its fill while main takes
          the system's ground. */}
      {!done && <PoolCurve step={answered} />}
    </section>
  )
}
