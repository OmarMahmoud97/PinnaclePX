'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { EXAMPLE_FILES } from '@/app/_components/photos'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { PhoneSketch } from '@/components/sketch/phone-sketch'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { answersAt, EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { CONFIG } from '@/lib/config'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// The last beat paints the style, then the colour a moment later.
const COLOUR_AFTER_MS = 900

type Props = { heading: ReactNode; beats: ReactNode; actions: ReactNode }

// The walkthrough: three beats of copy scroll past a phone frame that paints one more answer
// as each beat comes into view, so "one question at a time" is something the visitor does with
// their own scrolling. Each beat carries data-beat with the stage it paints; the third paints
// stage 4 and then 5. Scrolling back unpaints. Reduced motion and JavaScript off show the
// finished frame; on a phone the frame sits under the header and the beats scroll beneath it.
export function HowItWorksTrack({ heading, beats, actions }: Props) {
  const motionAllowed = useMotionAllowed()
  const [liveStage, setLiveStage] = useState(1)
  const beatsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = beatsRef.current
    if (!motionAllowed || root === null) return
    const beats = [...root.querySelectorAll<HTMLElement>('[data-beat]')]
    const onScreen = new Set<Element>()
    let current = 1
    let colourTimer: ReturnType<typeof setTimeout> | undefined
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target)
          else onScreen.delete(entry.target)
        }
        // The stage is the last beat on screen in reading order. With none on screen the frame
        // is finished once the beats have been scrolled past, and blank before they arrive.
        const last = [...beats].reverse().find((beat) => onScreen.has(beat))
        const first = beats[0]
        const next =
          last !== undefined
            ? Number(last.dataset.beat)
            : first !== undefined && first.getBoundingClientRect().top < 0
              ? FINAL_STAGE
              : 1
        clearTimeout(colourTimer)
        if (next === FINAL_STAGE && current < FINAL_STAGE) {
          setLiveStage(FINAL_STAGE - 1)
          colourTimer = setTimeout(() => {
            setLiveStage(FINAL_STAGE)
          }, COLOUR_AFTER_MS)
        } else {
          setLiveStage(next)
        }
        current = next
      },
      { threshold: CONFIG.motion.walkthroughThreshold },
    )
    for (const beat of beats) observer.observe(beat)
    return () => {
      clearTimeout(colourTimer)
      observer.disconnect()
    }
  }, [motionAllowed])

  const stage = motionAllowed ? liveStage : FINAL_STAGE
  // Nothing is painted before the first beat; from then on the whole sentence is in.
  const model = sketchModelFrom(
    answersAt(stage, stage >= 2 ? EXAMPLE_ANSWERS.description.length : 0),
    stage,
    EXAMPLE_FILES,
  )

  return (
    <div className="grid md:grid-cols-6 md:grid-rows-[auto_1fr]">
      <div className="p-column max-md:pb-3 md:col-span-3">{heading}</div>

      <div className="sticky top-16 z-10 md:top-24 md:col-span-3 md:col-start-4 md:row-span-2 md:self-start md:border-l md:border-border">
        <div
          style={model.vars}
          className="relative flex flex-col items-center gap-3 overflow-hidden border-y border-border bg-surface-muted px-6 pt-5 pb-4 md:min-h-[60vh] md:justify-center md:border-y-0 md:py-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-1 bg-[radial-gradient(var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_72%)] bg-[size:22px_22px]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-1 bg-radial-[at_50%_80%] from-(--sketch-glow) to-transparent to-65% transition-colors duration-700"
          />
          <div className="w-full max-w-64">
            <ProgressSteps current={stage} total={QUESTION_IDS.length} />
          </div>
          <div
            aria-hidden="true"
            className="relative max-h-40 overflow-hidden mask-[linear-gradient(to_bottom,black_75%,transparent)] md:max-h-none md:overflow-visible md:mask-none"
          >
            <CornerTicks edges={['top', 'bottom']} />
            <PhoneSketch model={model} zoom={1.5} />
          </div>
          <p className={`${captionStyles} text-center`}>{SKETCH_CAPTION.walkthrough}</p>
        </div>
      </div>

      <div
        ref={beatsRef}
        className="flex flex-col gap-8 p-column max-md:pt-6 md:col-span-3 md:col-start-1"
      >
        {beats}
        {actions}
      </div>
    </div>
  )
}
