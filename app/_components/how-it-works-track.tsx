'use client'

import dynamic from 'next/dynamic'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { BUILT_STAGE, EMPTY_STAGE, WALKTHROUGH_ANSWERS } from '@/app/_components/walkthrough-brand'
import { HIDDEN_WHEN_EMPTY, WalkthroughFrame } from '@/app/_components/walkthrough-frame'
import { WALKTHROUGH_FILES } from '@/app/_components/walkthrough-photos'
import { stageAt, stagesFrom } from '@/app/_components/walkthrough-stops'
import { buildWalkthrough, type Walkthrough } from '@/app/_components/walkthrough-timeline'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { SketchChips } from '@/components/sketch/sketch-chips'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { answeredAt, FINAL_STAGE } from '@/lib/brief/example-brief'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { cn } from '@/lib/cn'
import { CONFIG } from '@/lib/config'
import { loadGsap } from '@/lib/motion/gsap'
import { whenIdle } from '@/lib/motion/idle'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// The finished page the sketch builds into. Never server-rendered: only a client that allows
// motion ever shows it, and the chunk, its font and its photographs load with it.
const WalkthroughBuilt = dynamic(
  () => import('@/app/_components/walkthrough-built').then((module) => module.WalkthroughBuilt),
  { ssr: false },
)

// The frame is drawn with every answer in and its colour set, and the timeline hides whatever a
// stop has not reached, so its variables never change.
const MODEL = sketchModelFrom(WALKTHROUGH_ANSWERS, FINAL_STAGE, WALKTHROUGH_FILES)
const { walkthrough } = CONFIG

type Status = 'waiting' | 'playing' | 'unavailable'

type Props = { heading: ReactNode; steps: ReactNode; actions: ReactNode }

// The walkthrough: five steps of copy scroll past a sticky phone frame that paints an example
// brand's answers one question at a time, then builds them into a finished page, so "one
// question at a time" is something the visitor does with their own scrolling. Each step carries
// data-stages, the stops it paints spread down its height (walkthrough-stops.ts); the scroll
// picks the stop and a GSAP timeline glides to it, forwards or back (walkthrough-timeline.ts).
// The server renders the finished sketch; a client that allows motion rewinds it to empty in
// its first render and plays from there once GSAP and the finished page have loaded, which
// starts when the section is a viewport away. Reduced motion, JavaScript off and a GSAP chunk
// that never arrives all keep the finished sketch.
export function HowItWorksTrack({ heading, steps, actions }: Props) {
  const motionAllowed = useMotionAllowed()
  const [stage, setStage] = useState(EMPTY_STAGE)
  const [status, setStatus] = useState<Status>('waiting')
  const [builtReady, setBuiltReady] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const walkthroughRef = useRef<Walkthrough | null>(null)
  const targetRef = useRef(EMPTY_STAGE)

  const markBuiltReady = useCallback(() => {
    setBuiltReady(true)
  }, [])

  // The scroll picks the stop: the furthest stage whose line has passed the reading line under
  // the frame. One read per frame, on a passive listener; Lenis scrolls the window, so its
  // glides arrive here as ordinary scroll events.
  useEffect(() => {
    const stageElement = stageRef.current
    const column = stepsRef.current
    if (!motionAllowed || stageElement === null || column === null) return
    const stepElements = [...column.querySelectorAll<HTMLElement>('[data-stages]')]
    let frame: number | undefined
    const measure = () => {
      frame = undefined
      const anchor = Math.min(
        stageElement.getBoundingClientRect().bottom + walkthrough.anchorGapPx,
        window.innerHeight * walkthrough.anchorShare,
      )
      const next = stageAt(
        anchor,
        stepElements.map((step) => {
          const box = step.getBoundingClientRect()
          return { top: box.top, height: box.height, stages: stagesFrom(step.dataset.stages) }
        }),
      )
      if (next === targetRef.current) return
      targetRef.current = next
      setStage(next)
      walkthroughRef.current?.goTo(next)
    }
    const schedule = () => {
      frame ??= requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [motionAllowed])

  // The timeline, built once the finished page is in the DOM, the section is a viewport away, the
  // browser is idle and GSAP and the fonts have arrived; then it glides to wherever the scroll
  // already is. The timeline's module is imported statically: as a dynamic import Turbopack
  // folded it back into the page's shared chunk (measured 6 September 2026, ADR 0025), so the
  // split bought nothing. A resize measures the frame afresh once the window has settled.
  useEffect(() => {
    const stageElement = stageRef.current
    if (!motionAllowed || !builtReady || stageElement === null) return
    let cancelled = false
    let cancelIdle: (() => void) | undefined
    let settle: number | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) return
        observer.disconnect()
        cancelIdle = whenIdle(() => {
          Promise.all([loadGsap(), document.fonts.ready])
            .then(([gsap]) => {
              if (cancelled) return
              const built = buildWalkthrough(gsap, stageElement)
              walkthroughRef.current = built
              setStatus('playing')
              built.goTo(targetRef.current)
            })
            .catch(() => {
              if (!cancelled) setStatus('unavailable')
            })
        })
      },
      { rootMargin: `${String(walkthrough.loadAheadViewports * 100)}% 0px` },
    )
    observer.observe(stageElement)
    const onResize = () => {
      window.clearTimeout(settle)
      settle = window.setTimeout(() => {
        walkthroughRef.current?.rebuild(targetRef.current)
      }, walkthrough.resizeSettleMs)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelled = true
      observer.disconnect()
      cancelIdle?.()
      window.clearTimeout(settle)
      window.removeEventListener('resize', onResize)
      walkthroughRef.current?.revert()
      walkthroughRef.current = null
    }
  }, [motionAllowed, builtReady])

  // What is shown: the stop the scroll has reached, or the finished sketch for a visitor whose
  // frame never moves.
  const shown = !motionAllowed || status === 'unavailable' ? FINAL_STAGE : stage
  const captionKey = shown === BUILT_STAGE ? 'walkthroughBuilt' : 'walkthrough'
  const phase = motionAllowed && status === 'waiting' ? 'empty' : undefined

  return (
    <div className="grid md:grid-cols-6 md:grid-rows-[auto_1fr]">
      <div className="p-column max-md:pb-3 md:col-span-3">{heading}</div>

      <div
        ref={stageRef}
        data-phase={phase}
        style={MODEL.vars}
        className="sticky top-16 z-10 md:top-24 md:col-span-3 md:col-start-4 md:row-span-2 md:self-start md:border-l md:border-border"
      >
        {/* Isolated, so the dots and the glow (-z-1) paint over this block's own background
            rather than under it. */}
        <div className="relative isolate flex flex-col items-center gap-3 overflow-hidden border-y border-border bg-surface-muted px-6 pt-4 pb-3 md:min-h-[60vh] md:justify-center md:border-y-0 md:py-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-1 bg-[radial-gradient(var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_72%)] bg-[size:22px_22px]"
          />
          {/* The brand's glow, in from the colour stage. */}
          <div
            aria-hidden="true"
            data-wire="glow"
            className={cn(
              HIDDEN_WHEN_EMPTY,
              'absolute inset-0 -z-1 bg-radial-[at_50%_72%] from-(--sketch-glow) to-transparent to-78%',
            )}
          />
          <div className="w-full max-w-64">
            <ProgressSteps
              current={Math.min(Math.max(shown, 1), FINAL_STAGE)}
              total={QUESTION_IDS.length}
            />
          </div>
          <div aria-hidden="true" className="relative">
            <CornerTicks edges={['top', 'bottom']} />
            <WalkthroughFrame
              className="[zoom:1.1] md:[zoom:1.5]"
              built={motionAllowed ? <WalkthroughBuilt onReady={markBuiltReady} /> : undefined}
            />
          </div>
          {/* Tall enough for the longer caption, so the swap never moves what is below. */}
          <p
            key={captionKey}
            className={cn(
              captionStyles,
              'min-h-9 max-w-80 text-center',
              status === 'playing' && 'animate-sketch-in',
            )}
          >
            {SKETCH_CAPTION[captionKey]}
          </p>
          {/* The brief in words for a screen reader, in place of the drawing; the chips
              themselves stay out, since the progress line already counts. */}
          <SketchChips
            answers={WALKTHROUGH_ANSWERS}
            answered={answeredAt(shown)}
            prefix="An example brief so far"
            chipsClassName="hidden"
          />
        </div>
      </div>

      <div
        ref={stepsRef}
        className="flex flex-col gap-8 p-column max-md:pt-6 md:col-span-3 md:col-start-1"
      >
        {steps}
        {actions}
      </div>
    </div>
  )
}
