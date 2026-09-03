import 'client-only'
import { DEMO_STAGES, EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import { typingOffsets } from '@/lib/brief/typing'
import { CONFIG } from '@/lib/config'
import { type Box, flipDelta } from '@/lib/motion/flip'
import type { Gsap } from '@/lib/motion/gsap'

export type Frame = Readonly<{ stage: number; chars: number }>

const FULL = EXAMPLE_ANSWERS.description.length

export const FINISHED: Frame = { stage: FINAL_STAGE, chars: FULL }
export const EMPTY: Frame = { stage: 1, chars: 0 }

type Timeline = ReturnType<Gsap['timeline']>

type Hooks = Readonly<{
  setFrame: (frame: Frame) => void
  setBuilt: (built: boolean) => void
  onStart: () => void
}>

export type Loop = Readonly<{ pause: () => void; play: () => void; revert: () => void }>

const { demo } = CONFIG
// power3.inOut peaks at three times the average speed; expo.inOut peaks at seven and snaps
// through the middle of a travel.
const TRAVEL = 'power3.inOut'
const FADE = 'power2.inOut'
const CROSS = demo.build.cross
// Everything the build and the reset write inline. Cleared by name, never with `clearProps:
// 'all'`, which wipes an element's whole inline style, including what React put there.
const WRITTEN = 'transform,transformOrigin,opacity,visibility,filter'

type Beat = Readonly<{ at: number; for: number; step?: number }>

// Every named part on both frames, the beat it moves on, and its place in a beat that steps its
// members. A part with several elements (links, cards, arrows) steps through them in order.
const PARTS: readonly Readonly<{ part: string; beat: Beat; index?: number }>[] = [
  { part: 'wordmark', beat: demo.build.nav },
  { part: 'nav-link', beat: demo.build.nav },
  { part: 'nav-cta', beat: demo.build.nav },
  { part: 'menu', beat: demo.build.nav },
  { part: 'image', beat: demo.build.photo },
  { part: 'eyebrow', beat: demo.build.text, index: 0 },
  { part: 'headline', beat: demo.build.text, index: 1 },
  { part: 'paragraph', beat: demo.build.text, index: 2 },
  { part: 'cta', beat: demo.build.text, index: 3 },
  { part: 'card', beat: demo.build.cards },
  { part: 'footer', beat: demo.build.footer },
  { part: 'arrow', beat: demo.build.arrows },
]

// Sketch parts that are bars or boxes, so they scale into their counterpart's box; text only
// travels, because scaled type smears.
const SCALED_FROM = new Set(['nav-link', 'nav-cta', 'eyebrow', 'cta', 'card', 'footer', 'menu'])
// Finished parts that are boxes and arrive scaling up out of the sketch's box.
const SCALED_TO = new Set(['nav-cta', 'cta', 'card', 'footer', 'menu'])

const seconds = (ms: number) => ms / 1000

function partsIn(layer: Element, part: string): HTMLElement[] {
  return [...layer.querySelectorAll<HTMLElement>(`[data-part="${part}"]`)]
}

function boxOf(element: HTMLElement): Box {
  const rect = element.getBoundingClientRect()
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

// Visual pixels per layout pixel, so a frame under CSS zoom (the phone strip) moves by the
// right amount.
function zoomOf(element: HTMLElement): number {
  const width = element.offsetWidth
  return width === 0 ? 1 : element.getBoundingClientRect().width / width
}

type Layers = Readonly<{ root: HTMLElement; sketch: HTMLElement; built: HTMLElement }>

// A frame's two layers, or null for a frame with no finished page under it.
function layersOf(root: HTMLElement): Layers | null {
  const sketch = root.querySelector<HTMLElement>('[data-layer="sketch"]')
  const built = root.querySelector<HTMLElement>('[data-layer="built"]')
  return sketch === null || built === null ? null : { root, sketch, built }
}

function layersIn(roots: readonly HTMLElement[]): Layers[] {
  return roots.map(layersOf).filter((layers): layers is Layers => layers !== null)
}

type Move = Readonly<{
  part: string
  from: HTMLElement | undefined
  to: HTMLElement | undefined
  fromBox: Box | undefined
  toBox: Box | undefined
  at: number
  duration: number
}>

// Pairs every sketch part with its counterpart on the finished page and measures both, all reads
// before any write so layout is computed once.
function movesIn(sketch: Element, built: Element): Move[] {
  const moves: Move[] = []
  for (const { part, beat, index } of PARTS) {
    const froms = partsIn(sketch, part)
    const tos = partsIn(built, part)
    const count = Math.max(froms.length, tos.length)
    for (let i = 0; i < count; i += 1) {
      const from = froms[i]
      const to = tos[i]
      moves.push({
        part,
        from,
        to,
        fromBox: from === undefined ? undefined : boxOf(from),
        toBox: to === undefined ? undefined : boxOf(to),
        at: seconds(beat.at + (index ?? i) * (beat.step ?? 0)),
        duration: seconds(beat.for),
      })
    }
  }
  return moves
}

// The build inside one frame: the sketch's parts travel to their places on the finished page and
// the finished parts arrive from the sketch's, crossing in flight. The photograph is one
// element that swaps for the sketch's copy of the same picture and then travels. Parts with no
// counterpart rise in or pop.
function addBuild(tl: Timeline, { root, sketch, built }: Layers): void {
  // A frame that is not displayed at this size has nothing to measure.
  if (root.offsetWidth === 0) return
  const zoom = zoomOf(root)
  const moves = movesIn(sketch, built)
  const labels = partsIn(sketch, 'image-label')
  const background = partsIn(built, 'bg')

  if (labels.length > 0) {
    tl.to(
      labels,
      { autoAlpha: 0, duration: seconds(demo.build.label.for) },
      seconds(demo.build.label.at),
    )
  }
  tl.to(
    background,
    { autoAlpha: 1, duration: seconds(demo.build.bg.for), ease: FADE },
    seconds(demo.build.bg.at),
  )

  for (const { part, from, to, fromBox, toBox, at, duration } of moves) {
    if (from !== undefined && to !== undefined && fromBox !== undefined && toBox !== undefined) {
      const delta = flipDelta(fromBox, toBox, zoom)
      const inverse = flipDelta(toBox, fromBox, zoom)
      if (part === 'image') {
        tl.set(from, { autoAlpha: 0 }, at)
        tl.set(to, { ...delta, transformOrigin: '0 0', autoAlpha: 1, filter: 'saturate(0.75)' }, at)
        tl.to(
          to,
          { x: 0, y: 0, scaleX: 1, scaleY: 1, filter: 'saturate(1)', duration, ease: TRAVEL },
          at,
        )
        continue
      }
      const scaleTo = SCALED_TO.has(part)
      const scaleFrom = SCALED_FROM.has(part)
      const fadeAt = at + duration * (1 - CROSS)
      const fadeFor = duration * CROSS
      // A part that barely travels rises into place instead, so it still arrives.
      const lift = Math.hypot(delta.x, delta.y) < demo.build.rise.underPx ? demo.build.rise.byPx : 0
      tl.fromTo(
        to,
        {
          x: delta.x,
          y: delta.y + lift,
          scaleX: scaleTo ? delta.scaleX : 1,
          scaleY: scaleTo ? delta.scaleY : 1,
          transformOrigin: '0 0',
        },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration, ease: TRAVEL, immediateRender: false },
        at,
      )
      const words = [...to.querySelectorAll<HTMLElement>('[data-word]')]
      if (words.length > 0) {
        // The block shows at once and its words carry the fade, one after another.
        tl.set(to, { autoAlpha: 1 }, fadeAt)
        tl.fromTo(
          words,
          { autoAlpha: 0, y: demo.build.words.risePx },
          {
            autoAlpha: 1,
            y: 0,
            duration: fadeFor,
            ease: 'power3.out',
            stagger: seconds(demo.build.words.step),
            immediateRender: false,
          },
          fadeAt,
        )
      } else {
        tl.fromTo(
          to,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: fadeFor, ease: FADE, immediateRender: false },
          fadeAt,
        )
      }
      const label = to.querySelector<HTMLElement>('[data-label]')
      if (label !== null) {
        // The label waits until the pill has its shape; scaled type would smear.
        tl.set(label, { autoAlpha: 0 }, at)
        tl.to(
          label,
          { autoAlpha: 1, duration: duration * demo.build.labelShare, ease: FADE },
          at + duration * (1 - demo.build.labelShare),
        )
      }
      const icon = to.querySelector<HTMLElement>('[data-icon]')
      const title = to.querySelector<HTMLElement>('[data-title]')
      if (icon !== null && title !== null) {
        // A card's icon and title resolve a beat after the card itself shows.
        const innerAt = fadeAt + seconds(demo.build.card.after)
        const innerFor = seconds(demo.build.card.for)
        tl.set(icon, { scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%' }, at)
        tl.set(title, { y: demo.build.card.risePx, autoAlpha: 0 }, at)
        tl.to(icon, { scale: 1, autoAlpha: 1, duration: innerFor, ease: 'power3.out' }, innerAt)
        tl.to(title, { y: 0, autoAlpha: 1, duration: innerFor, ease: 'power3.out' }, innerAt)
      }
      tl.to(
        from,
        {
          x: inverse.x,
          y: inverse.y,
          scaleX: scaleFrom ? inverse.scaleX : 1,
          scaleY: scaleFrom ? inverse.scaleY : 1,
          transformOrigin: '0 0',
          duration,
          ease: TRAVEL,
        },
        at,
      )
      tl.to(from, { autoAlpha: 0, duration: fadeFor, ease: FADE }, at)
    } else if (to !== undefined) {
      if (part === 'arrow') {
        tl.fromTo(
          to,
          { autoAlpha: 0, scale: 0.6 },
          { autoAlpha: 1, scale: 1, duration, ease: 'back.out(1.7)', immediateRender: false },
          at,
        )
      } else {
        tl.fromTo(
          to,
          { autoAlpha: 0, y: 6 },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration * CROSS,
            ease: 'power2.out',
            immediateRender: false,
          },
          at + duration * (1 - CROSS),
        )
      }
    } else if (from !== undefined) {
      tl.to(from, { autoAlpha: 0, duration: duration * CROSS, ease: FADE }, at)
    }
  }
}

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

// Act two, the build and the hold, measured afresh from the frames as they are now.
function buildAct(
  gsap: Gsap,
  layers: readonly Layers[],
  hooks: Hooks,
  onDone: () => void,
): Timeline {
  const tl = gsap.timeline({ onComplete: onDone })
  for (const frame of layers) addBuild(tl, frame)
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

// Removes everything the acts may have written, whatever state they were in.
function clearWritten(gsap: Gsap, layers: readonly Layers[]): void {
  for (const { sketch, built } of layers) {
    const parts = [
      ...sketch.querySelectorAll('[data-part]'),
      ...built.querySelectorAll('[data-part], [data-part] *'),
    ]
    gsap.set(parts, { clearProps: WRITTEN })
    gsap.set(built, { clearProps: 'transform,transformOrigin' })
    gsap.set(sketch, { clearProps: 'opacity,visibility' })
  }
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
      clearWritten(gsap, layers)
    },
  }
}
