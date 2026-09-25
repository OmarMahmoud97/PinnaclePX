'use client'

import dynamic from 'next/dynamic'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { BUILT_STAGE, EMPTY_STAGE, WALKTHROUGH_ANSWERS } from '@/app/_components/walkthrough-brand'
import { HIDDEN_WHEN_EMPTY, WalkthroughFrame } from '@/app/_components/walkthrough-frame'
import { WALKTHROUGH_FILES } from '@/app/_components/walkthrough-photos'
import {
  answeredAt,
  questionNumberAt,
  SKETCHED_STAGE,
  WALKTHROUGH_LABELS,
  WALKTHROUGH_STEPS,
} from '@/app/_components/walkthrough-steps'
import { stackedBeats, stageAt, stagesFrom } from '@/app/_components/walkthrough-stops'
import { buildWalkthrough, type Walkthrough } from '@/app/_components/walkthrough-timeline'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { SketchChips } from '@/components/sketch/sketch-chips'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { FINAL_STAGE } from '@/lib/brief/example-brief'
import { cn } from '@/lib/cn'
import { CONFIG } from '@/lib/config'
import { loadGsap } from '@/lib/motion/gsap'
import { whenIdle } from '@/lib/motion/idle'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'

// The dock on a phone (ADR 0036): below md, where the steps run under the phone rather than
// beside it. The sheet's own query; the fit's zooms, air and lead are CONFIG.walkthrough.dock.
const DOCK_MEDIA = '(width < 48rem)'

// The visitor's first touch, wheel, key or pointer lets a fragment they arrived on go: from then
// on the page is theirs, and the dock no longer puts the fragment back on its line.
const RELEASE = ['touchstart', 'wheel', 'keydown', 'pointerdown'] as const

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
//
// On a phone the steps cannot sit beside the phone, so they dock under it (ADR 0036): the panel
// is sticky under the header, the phone takes the largest zoom that leaves the longest step whole
// above the fold, and each step holds still in one slot under the panel while it is the one
// being painted, so the words and the change they cause are on screen together. Every 9rem of
// scroll is one stop. The dock needs the timeline: under reduced motion, with JavaScript off,
// when GSAP never arrives or when no zoom fits (large text, a very short screen), the panel
// stays in the flow above a plain list of all five steps. Docking grows the section after the
// browser has seated a fragment the visitor arrived on below it (a shared /#faq, or /#real-build
// from another page), so the fit holds that fragment on its line until their first input.
export function HowItWorksTrack({ heading, steps, actions }: Props) {
  const motionAllowed = useMotionAllowed()
  const [stage, setStage] = useState(EMPTY_STAGE)
  const [status, setStatus] = useState<Status>('waiting')
  const [builtReady, setBuiltReady] = useState(false)
  const unavailable = status === 'unavailable'
  const dockRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const walkthroughRef = useRef<Walkthrough | null>(null)
  const targetRef = useRef(EMPTY_STAGE)

  const markBuiltReady = useCallback(() => {
    setBuiltReady(true)
    // The finished page changes the stage's height, so every scroll line below it moves: the
    // page choreography listens for this and refreshes its triggers (app/_components/motion).
    window.dispatchEvent(new CustomEvent('walkthrough:ready'))
  }, [])

  // The scroll picks the stop: the furthest stage whose line has passed the reading line under
  // the frame. One read per frame, on a passive listener; Lenis scrolls the window, so its
  // glides arrive here as ordinary scroll events. Below md, undocked, the stage is in the flow
  // (app/_styles/how-it-works.css), so its bottom would drag the reading line above the screen
  // and freeze the current step's mark; the line then sits at its share of the viewport.
  useEffect(() => {
    const wrapper = dockRef.current
    const stageElement = stageRef.current
    const column = stepsRef.current
    if (!motionAllowed || wrapper === null || stageElement === null || column === null) return
    const list = column.querySelector('ol')
    const panel = stageElement.firstElementChild
    if (list === null || !(panel instanceof HTMLElement)) return
    const root = document.documentElement
    const stepElements = [...column.querySelectorAll<HTMLElement>('[data-stages]')]
    // Where the docked steps sit (a viewport y) and the phone's zoom; null while undocked.
    let dock: number | null = null
    let zoom: number | null = null
    let frame: number | undefined
    let fitFrame: number | undefined
    let width = window.innerWidth
    let height = root.clientHeight
    // A fragment the visitor arrived on below the section. The browser seats it (or glides to it)
    // before the dock grows the section above it, and no engine's scroll anchoring held it: on
    // 24 September 2026 at 390 by 844, /#real-build ended 134 px low (the growth) in Chromium
    // and WebKit, and 159 px low in Firefox. The fit puts it back until the visitor's first
    // input (RELEASE). Exactly "following", not "contains": the section's own top never moves
    // when it grows. The id is read as it stands, never decoded: the site's ids are ASCII, and a
    // malformed shared hash would throw.
    const hashed = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null
    let arrival =
      hashed !== null &&
      wrapper.compareDocumentPosition(hashed) === Node.DOCUMENT_POSITION_FOLLOWING
        ? hashed
        : null
    const release = () => {
      arrival = null
    }
    // The scroll at the last measure. The fit's frame was requested in the frame before (by the
    // observer or the resize), so it runs ahead of the measure a scroll requests; a scroll that
    // has gone further down since then is a glide still under way. Were the order ever reversed,
    // the fit would only see a still page, and a glide far from its target is never put back.
    let lastY = window.scrollY

    const measure = () => {
      frame = undefined
      lastY = window.scrollY
      const share = window.innerHeight * walkthrough.anchorShare
      // Docked, the reading line is the dock and the beats come from the list's layout: a docked
      // step's own box sits at the dock, so the last one's second stage would never pass it.
      const anchor =
        dock ??
        (getComputedStyle(stageElement).position === 'sticky'
          ? Math.min(stageElement.getBoundingClientRect().bottom + walkthrough.anchorGapPx, share)
          : share)
      const beats =
        dock === null
          ? stepElements.map((step) => {
              const box = step.getBoundingClientRect()
              return { top: box.top, height: box.height, stages: stagesFrom(step.dataset.stages) }
            })
          : stackedBeats(
              list.getBoundingClientRect().top,
              stepElements.map((step) => ({
                height: step.offsetHeight,
                stages: stagesFrom(step.dataset.stages),
              })),
            )
      const next = stageAt(anchor, beats)
      if (next === targetRef.current) return
      targetRef.current = next
      // The step the frame is currently painting says so, in colour, on its title alone. The
      // inactive ones are never dimmed (opacity-60 on --on-surface-muted is 2.6:1) and no rule
      // grows, so the only thing that changes is the one line the visitor is being answered on.
      // Docked on a phone, it is also the one step showing.
      for (const step of stepElements) {
        step.toggleAttribute('data-current', stagesFrom(step.dataset.stages).includes(next))
      }
      setStage(next)
      walkthroughRef.current?.goTo(next, dock === null ? 0 : walkthrough.dock.leadMs)
    }
    const schedule = () => {
      frame ??= requestAnimationFrame(measure)
    }

    // The words a step docks: its title's top to its body's foot. Layout, not paint, so the
    // rise's translate never enters it.
    const wordsOf = (step: HTMLElement) => {
      const title = step.querySelector('h3')
      const body = step.querySelector('p')
      return title === null || body === null
        ? 0
        : body.offsetTop + body.offsetHeight - title.offsetTop
    }

    // The fit: below md, the largest zoom at which the panel, the gap and the longest step end
    // the air above the fold of the small viewport (clientHeight, which a phone's sliding
    // toolbar never changes, so the zoom holds mid-scroll). Nothing fits, and the dock is off.
    const fit = () => {
      fitFrame = undefined
      // Where things stand before the dock writes anything: the arrival's line (its own scroll
      // margin under the root's scroll padding, the place a fragment jump seats it) and how far
      // it sits from it, whether the page is still gliding down, and whether the visitor is
      // reading below the whole section.
      const arrivalLine =
        arrival === null
          ? 0
          : parseFloat(getComputedStyle(arrival).scrollMarginTop) +
            parseFloat(getComputedStyle(root).scrollPaddingTop)
      const drift = arrival === null ? 0 : arrival.getBoundingClientRect().top - arrivalLine
      const gliding = window.scrollY > lastY
      const above = wrapper.getBoundingClientRect().bottom <= 0
      const before = wrapper.offsetHeight
      let next: number | null = null
      dock = null
      if (!unavailable && window.matchMedia(DOCK_MEDIA).matches) {
        // The docked top (4.5rem) and the steps' docked boxes must apply before they are read.
        wrapper.setAttribute('data-dock', '')
        const top = parseFloat(getComputedStyle(stageElement).top)
        const words = Math.max(...stepElements.map(wordsOf))
        for (const candidate of walkthrough.dock.zooms) {
          stageElement.style.setProperty('--walk-zoom', String(candidate))
          const line = top + panel.offsetHeight + walkthrough.anchorGapPx
          if (line + words + walkthrough.dock.airPx <= root.clientHeight) {
            next = candidate
            dock = line
            break
          }
        }
      }
      if (dock === null) {
        wrapper.removeAttribute('data-dock')
        stageElement.style.removeProperty('--walk-zoom')
        list.style.removeProperty('--walk-dock')
      } else {
        list.style.setProperty('--walk-dock', `${String(dock)}px`)
      }
      // A new zoom leaves the build's measures at the old size: seat the timeline afresh.
      if (next !== zoom) {
        zoom = next
        walkthroughRef.current?.rebuild(targetRef.current)
      }
      // Docking changes the section's height, which moves everything below it.
      const grew = wrapper.offsetHeight - before
      if (
        grew !== 0 &&
        arrival !== null &&
        !gliding &&
        Math.abs(drift) <= walkthrough.dock.arrivalSlackPx
      ) {
        // The arrival had landed: put it back on its line before the frame paints, so nothing
        // is seen to move. Where the engine's anchoring held it, it is already there and this
        // does nothing.
        arrival.scrollIntoView({ behavior: 'instant' })
      } else if (grew !== 0 && arrival !== null && gliding && drift > 0) {
        // The browser's own glide to the arrival aims where it was before the growth, so aim it
        // again at where it is now.
        arrival.scrollIntoView({ behavior: 'smooth' })
      } else if (grew !== 0 && above && !CSS.supports('overflow-anchor', 'auto')) {
        // Where the browser has no scroll anchoring, keep what a visitor below the whole section
        // is reading where it was, judged by where the section stood before it grew. Instant,
        // since html is scroll-behavior: smooth on a phone, where Lenis leaves touch native.
        window.scrollBy({ top: grew, behavior: 'instant' })
      }
      schedule()
    }
    const refit = () => {
      fitFrame ??= requestAnimationFrame(fit)
    }
    // Text that grows without a resize (a font landing, a larger text setting, a spacing
    // override) refits: the observer watches every step's title and body, and its first report
    // is the mount call. Docking never changes their size, so it never feeds itself.
    const observer = new ResizeObserver(refit)
    for (const part of column.querySelectorAll('[data-stages] > *')) observer.observe(part)
    const onResize = () => {
      schedule()
      if (window.innerWidth === width && root.clientHeight === height) return
      width = window.innerWidth
      height = root.clientHeight
      refit()
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize)
    // Captured, so a handler that stops the event on its way down cannot hide the input.
    for (const type of RELEASE) {
      window.addEventListener(type, release, { capture: true, passive: true })
    }
    return () => {
      observer.disconnect()
      if (frame !== undefined) cancelAnimationFrame(frame)
      if (fitFrame !== undefined) cancelAnimationFrame(fitFrame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      for (const type of RELEASE) window.removeEventListener(type, release, { capture: true })
      wrapper.removeAttribute('data-dock')
      stageElement.style.removeProperty('--walk-zoom')
      list.style.removeProperty('--walk-dock')
    }
  }, [motionAllowed, unavailable])

  // The timeline, built once the finished page is in the DOM, the section is a viewport away, the
  // browser is idle and GSAP and the fonts have arrived; then it glides to wherever the scroll
  // already is. The timeline's module is imported statically: as a dynamic import Turbopack
  // folded it back into the page's shared chunk (measured 6 September 2026, ADR 0025), so the
  // split bought nothing. A change of width measures the frame afresh once the window has
  // settled. A height-only resize, which a phone's sliding toolbar fires mid-scroll, would only
  // snap a glide: the build's measures are taken inside the frame, so the viewport's height never
  // enters them, and the dock's fit rebuilds on its own when it changes the zoom.
  useEffect(() => {
    const stageElement = stageRef.current
    if (!motionAllowed || !builtReady || stageElement === null) return
    let cancelled = false
    let cancelIdle: (() => void) | undefined
    let settle: number | undefined
    let width = window.innerWidth
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
      if (window.innerWidth === width) return
      window.clearTimeout(settle)
      settle = window.setTimeout(() => {
        width = window.innerWidth
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
  const shown = !motionAllowed || unavailable ? SKETCHED_STAGE : stage
  const captionKey = shown === BUILT_STAGE ? 'walkthroughBuilt' : 'walkthrough'
  const phase = motionAllowed && status === 'waiting' ? 'empty' : undefined

  return (
    <div className="grid md:grid-cols-6 md:grid-rows-[auto_1fr_auto]">
      <div className="max-md:pb-3 md:col-span-3 md:pr-10 lg:pr-14">{heading}</div>

      {/* The dock's range on a phone: the stage is sticky inside this box, so it lets go where
          the steps end and the button, outside it, arrives in the clear. From md the box lays
          out as its children (md:contents) and the stage spans every row beside the steps and
          the button. */}
      <div ref={dockRef} className="md:contents">
        <div
          ref={stageRef}
          data-phase={phase}
          style={MODEL.vars}
          className="walkthrough-stage sticky z-10 md:top-24 md:col-span-3 md:col-start-4 md:row-span-3 md:self-start"
        >
          {/* The panel: a white rounded card with a still cyan halo (--shadow-panel), never
              animated, at every width, so the phone on a phone is the desktop's own card, docked
              or not; from md it gains the room it has beside the steps. Isolated, so the resting
              glow and the brand's glow (-z-1) paint over this block's own background rather than
              under it. */}
          <div className="relative isolate flex flex-col items-center gap-2 overflow-hidden rounded-(--radius-panel) bg-surface px-2 py-3 shadow-panel md:min-h-[60vh] md:justify-center md:gap-3 md:px-6 md:py-12">
            {/* The resting glow, low under the frame, in place of the old dot grid. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-1 bg-radial-[at_50%_75%] from-glow/14 to-transparent to-70%"
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
              <ProgressSteps current={questionNumberAt(shown)} total={WALKTHROUGH_STEPS.length} />
            </div>
            {/* The dock's fit sets --walk-zoom on the stage; undocked on a phone it is 1.1. */}
            <div aria-hidden="true" className="relative">
              <WalkthroughFrame
                className="[zoom:var(--walk-zoom,1.1)] md:[zoom:1.5]"
                built={motionAllowed ? <WalkthroughBuilt onReady={markBuiltReady} /> : undefined}
              />
            </div>
            {/* Tall enough for the longer caption, so the swap never moves what is below. Not
                through cn(): tailwind-merge reads text-label and the caption's colour as one
                group and drops the size, which left the caption at 16px on 24px lines. */}
            <p
              key={captionKey}
              className={`${captionStyles} min-h-9 max-w-80 text-center ${status === 'playing' ? 'animate-sketch-in' : ''}`}
            >
              {SKETCH_CAPTION[captionKey]}
            </p>
            {/* The brief in words for a screen reader, in place of the drawing, in the
                walkthrough's own steps; the chips themselves stay out, since the progress line
                already counts. */}
            <SketchChips
              answers={WALKTHROUGH_ANSWERS}
              answered={answeredAt(shown)}
              labels={WALKTHROUGH_LABELS}
              prefix="An example brief so far"
              chipsClassName="hidden"
            />
          </div>
        </div>

        <div ref={stepsRef} className="max-md:pt-6 md:col-span-3 md:col-start-1 md:pr-10 lg:pr-14">
          {steps}
        </div>
      </div>

      {/* The button and its bridge line: their own grid item, after the dock's range, with the
          room they had in the steps' column. */}
      <div className="mt-8 md:col-span-3 md:col-start-1 md:pr-10 lg:pr-14">{actions}</div>
    </div>
  )
}
