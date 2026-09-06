import 'client-only'
import {
  addBuild,
  clearBuild,
  type Layers,
  layersIn,
  seconds,
  type Timeline,
  WRITTEN,
} from '@/app/_components/sketch-build'
import { DEMO_STAGES, EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import { typingOffsets } from '@/lib/brief/typing'
import { CONFIG } from '@/lib/config'
import type { Gsap } from '@/lib/motion/gsap'

export type Frame = Readonly<{ stage: number; chars: number }>

const FULL = EXAMPLE_ANSWERS.description.length

export const FINISHED: Frame = { stage: FINAL_STAGE, chars: FULL }
export const EMPTY: Frame = { stage: 1, chars: 0 }

type Hooks = Readonly<{
  setFrame: (frame: Frame) => void
  setBuilt: (built: boolean) => void
  onStart: () => void
}>

export type Loop = Readonly<{ pause: () => void; play: () => void; revert: () => void }>

const { demo } = CONFIG

// Act one, the brief, driven through React: the sentence types, the company lands, the style
// fills, the colour sweeps, each beat waiting its hold.
function briefAct(
  gsap: Gsap,
  hooks: Hooks,
  delayMs: number,
  typedChars: number,
  onDone: () => void,
): Timeline {
  const tl = gsap.timeline({ delay: seconds(delayMs), onStart: hooks.onStart, onComplete: onDone })
  // The frame is empty from the first tick, in the same render as the live state, so the first
  // pass never shows the finished sketch for the frame before its first character.
  tl.call(
    () => {
      hooks.setFrame(EMPTY)
    },
    undefined,
    0,
  )
  // One moment per character, at a hand's rhythm rather than a metronome's. A frame that shows
  // only part of the sentence types only that part, then takes the rest in one step.
  const typed = EXAMPLE_ANSWERS.description.slice(0, typedChars)
  const offsets = typingOffsets(typed, demo.typing)
  for (const [index, offset] of offsets.entries()) {
    tl.call(
      () => {
        hooks.setFrame({ stage: 1, chars: index + 1 })
      },
      undefined,
      seconds(offset),
    )
  }
  if (typed.length < FULL) {
    tl.call(
      () => {
        hooks.setFrame({ stage: 1, chars: FULL })
      },
      undefined,
      seconds(offsets.at(-1) ?? 0),
    )
  }
  let wait: number = demo.holdMs
  for (const stage of DEMO_STAGES.slice(1)) {
    tl.call(
      () => {
        hooks.setFrame({ stage, chars: FULL })
      },
      undefined,
      `+=${String(seconds(wait))}`,
    )
    wait = demo.beatMs
  }
  tl.to({}, { duration: seconds(wait) })
  return tl
}

// Act two, the build and the hold, measured afresh from the frames as they are now
// (sketch-build.ts).
function buildAct(
  gsap: Gsap,
  layers: readonly Layers[],
  hooks: Hooks,
  onDone: () => void,
): Timeline {
  const tl = gsap.timeline({ onComplete: onDone })
  for (const frame of layers) addBuild(tl, frame, demo.build)
  tl.call(
    () => {
      hooks.setBuilt(true)
    },
    undefined,
    seconds(demo.build.doneAt),
  )
  tl.to({}, { duration: seconds(demo.builtHoldMs) }, seconds(demo.buildMs))
  return tl
}

// Act three, the reset. The finished page fades, lifts and settles back. Part way through that
// fade, under the hidden sketch layer, the build is stopped, the sketch's parts have every
// property it wrote cleared by name, and the frame is set to empty; then the blank sketch fades
// in while the finished page is still going, so the two cross and no frame is ever empty. The
// build is stopped rather than reverted because a revert would also take back the fade in
// progress. What the finished page carries is cleared when the reset completes, so the next
// build measures a clean frame.
function resetAct(
  gsap: Gsap,
  layers: readonly Layers[],
  hooks: Hooks,
  build: Timeline,
  onDone: () => void,
): Timeline {
  const reset = seconds(demo.resetMs)
  const fade = reset * demo.reset.fadeShare
  const swapAt = fade * demo.reset.swapShare
  const dissolveAt = fade * demo.reset.dissolveShare
  const builtParts = layers.flatMap((frame) => [
    ...frame.built.querySelectorAll<HTMLElement>('[data-part]'),
  ])
  const builtWritten = layers.flatMap((frame) => [
    ...frame.built.querySelectorAll<HTMLElement>('[data-part], [data-part] *'),
  ])
  const sketchParts = layers.flatMap((frame) => [
    ...frame.sketch.querySelectorAll<HTMLElement>('[data-part]'),
  ])
  const builtRoots = layers.map((frame) => frame.built)
  const sketches = layers.map((frame) => frame.sketch)
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(builtWritten, { clearProps: WRITTEN })
      gsap.set(builtRoots, { clearProps: 'transform,transformOrigin' })
      gsap.set(sketches, { clearProps: 'opacity,visibility' })
      onDone()
    },
  })
  tl.to(builtParts, { autoAlpha: 0, duration: fade, ease: 'power2.in' }, 0)
  tl.to(
    builtRoots,
    {
      scale: 0.985,
      y: -demo.reset.liftPx,
      transformOrigin: '50% 50%',
      duration: fade,
      ease: 'power2.in',
    },
    0,
  )
  tl.set(sketches, { autoAlpha: 0 }, swapAt)
  tl.call(
    () => {
      build.kill()
      gsap.set(sketchParts, { clearProps: WRITTEN })
      hooks.setFrame(EMPTY)
      hooks.setBuilt(false)
    },
    undefined,
    swapAt,
  )
  tl.to(sketches, { autoAlpha: 1, duration: reset - dissolveAt, ease: 'power2.out' }, dissolveAt)
  return tl
}

// The whole loop: the brief, the build with its hold, the reset, then the brief again. Each act
// is one timeline that plays forward once and hands over when it completes. Nothing is ever
// rewound: a repeating timeline would render every tween back to its recorded start values and
// fire every callback again on the way, which leaves the next pass starting from this pass's
// leftovers. Everything is created inside one GSAP context, so `revert` clears whatever the loop
// wrote and stops it for good.
export function buildLoop(
  gsap: Gsap,
  roots: readonly HTMLElement[],
  hooks: Hooks,
  typedChars: number,
): Loop {
  // A function is required: gsap.context() with none returns the context currently active.
  const ctx = gsap.context(() => undefined)
  const layers = layersIn(roots)
  let current: Timeline | null = null
  let paused = false
  let stopped = false

  function run(make: () => Timeline): Timeline | null {
    if (stopped) return null
    const act = ctx.add(make)
    if (paused) act.pause()
    current = act
    return act
  }
  function brief(delayMs: number): void {
    run(() => briefAct(gsap, hooks, delayMs, typedChars, build))
  }
  function build(): void {
    const act = run(() =>
      buildAct(gsap, layers, hooks, () => {
        if (act !== null) reset(act)
      }),
    )
  }
  function reset(built: Timeline): void {
    run(() =>
      resetAct(gsap, layers, hooks, built, () => {
        brief(demo.loopDelayMs)
      }),
    )
  }

  brief(demo.startDelayMs)
  return {
    pause: () => {
      paused = true
      current?.pause()
    },
    play: () => {
      paused = false
      current?.play()
    },
    revert: () => {
      stopped = true
      current?.kill()
      ctx.revert()
      clearBuild(gsap, layers)
    },
  }
}
