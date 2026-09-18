import 'client-only'
import { type Box, flipDelta } from '@/lib/motion/flip'
import type { Gsap } from '@/lib/motion/gsap'

// The build: a sketch's parts travel to their places on the finished page laid under it and
// become the real thing on arrival. One routine, run by the walkthrough on its frame
// (walkthrough-timeline.ts) with its own beats; it was written for the hero's loop as well
// (ADR 0006), which ADR 0031 removed. FLIP on GSAP core, hand-rolled: every sketch part and its
// finished counterpart share a data-part name; both are measured, and lib/motion/flip.ts gives
// the transform that lays one over the other.

export type Timeline = ReturnType<Gsap['timeline']>

type Beat = Readonly<{ at: number; for: number; step?: number }>

// When each beat starts, in ms from the build's start, how long it takes, and the wait between
// siblings that move one after another. CONFIG.walkthrough.beats.build is this shape. `cross` is the share of a travel each half of a crossfade takes: the sketch
// part fades out over the first share, the finished part fades in over the last, and the stretch
// between, the fastest, shows neither.
export type BuildPlan = Readonly<{
  cross: number
  label: Beat
  bg: Beat
  nav: Beat
  photo: Beat
  text: Beat
  cards: Beat
  footer: Beat
  arrows: Beat
  // The photograph arrives wearing the sketch's treatment and returns to itself as it lands.
  photoFilter: Readonly<{ from: string; to: string }>
  // A finished part that barely travels (under `underPx`) rises `byPx` into place instead.
  rise: Readonly<{ underPx: number; byPx: number }>
  // The headline's words arrive one after another, each rising, inside its crossfade.
  words: Readonly<{ step: number; risePx: number }>
  // A pill's label fades in over only the last share of the travel, once the pill has shape.
  labelShare: number
  // A card's icon and title resolve this long after the card starts to show, for this long.
  card: Readonly<{ after: number; for: number; risePx: number }>
}>

type BeatKey = 'nav' | 'photo' | 'text' | 'cards' | 'footer' | 'arrows'

// power3.inOut peaks at three times the average speed; expo.inOut peaks at seven and snaps
// through the middle of a travel.
const TRAVEL = 'power3.inOut'
const FADE = 'power2.inOut'
// Everything a build writes inline. Cleared by name, never with `clearProps: 'all'`, which wipes
// an element's whole inline style, including what React put there.
export const WRITTEN = 'transform,transformOrigin,opacity,visibility,filter'

// Every named part on both frames, the beat it moves on, and its place in a beat that steps its
// members. A part with several elements (links, cards, arrows) steps through them in order.
const PARTS: readonly Readonly<{ part: string; beat: BeatKey; index?: number }>[] = [
  { part: 'wordmark', beat: 'nav' },
  { part: 'nav-link', beat: 'nav' },
  { part: 'nav-cta', beat: 'nav' },
  { part: 'menu', beat: 'nav' },
  { part: 'image', beat: 'photo' },
  { part: 'eyebrow', beat: 'text', index: 0 },
  { part: 'headline', beat: 'text', index: 1 },
  { part: 'paragraph', beat: 'text', index: 2 },
  { part: 'cta', beat: 'text', index: 3 },
  { part: 'card', beat: 'cards' },
  { part: 'footer', beat: 'footer' },
  { part: 'arrow', beat: 'arrows' },
]

// Sketch parts that are bars or boxes, so they scale into their counterpart's box; text only
// travels, because scaled type smears.
const SCALED_FROM = new Set(['nav-link', 'nav-cta', 'eyebrow', 'cta', 'card', 'footer', 'menu'])
// Finished parts that are boxes and arrive scaling up out of the sketch's box.
const SCALED_TO = new Set(['nav-cta', 'cta', 'card', 'footer', 'menu'])

export const seconds = (ms: number): number => ms / 1000

function partsIn(layer: Element, part: string): HTMLElement[] {
  return [...layer.querySelectorAll<HTMLElement>(`[data-part="${part}"]`)]
}

function boxOf(element: HTMLElement): Box {
  const rect = element.getBoundingClientRect()
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
}

// Visual pixels per layout pixel, so a frame under CSS zoom (the phone) moves by the right
// amount.
function zoomOf(element: HTMLElement): number {
  const width = element.offsetWidth
  return width === 0 ? 1 : element.getBoundingClientRect().width / width
}

export type Layers = Readonly<{ root: HTMLElement; sketch: HTMLElement; built: HTMLElement }>

// A frame's two layers, or null for a frame with no finished page under it.
export function layersOf(root: HTMLElement): Layers | null {
  const sketch = root.querySelector<HTMLElement>('[data-layer="sketch"]')
  const built = root.querySelector<HTMLElement>('[data-layer="built"]')
  return sketch === null || built === null ? null : { root, sketch, built }
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
function movesIn(sketch: Element, built: Element, plan: BuildPlan): Move[] {
  const moves: Move[] = []
  for (const { part, beat: key, index } of PARTS) {
    const beat = plan[key]
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

// The build inside one frame, added to `tl` from its time zero: the sketch's parts travel to
// their places on the finished page and the finished parts arrive from the sketch's, crossing in
// flight. The photograph is one element that swaps for the sketch's copy of the same picture and
// then travels. Parts with no counterpart rise in or pop. Every tween is a plain tween, so a
// timeline holding the build can be played, scrubbed or reversed.
export function addBuild(tl: Timeline, { root, sketch, built }: Layers, plan: BuildPlan): void {
  // A frame that is not displayed at this size has nothing to measure.
  if (root.offsetWidth === 0) return
  const zoom = zoomOf(root)
  const moves = movesIn(sketch, built, plan)
  const labels = partsIn(sketch, 'image-label')
  const background = partsIn(built, 'bg')
  const cross = plan.cross

  if (labels.length > 0) {
    tl.to(labels, { autoAlpha: 0, duration: seconds(plan.label.for) }, seconds(plan.label.at))
  }
  tl.to(
    background,
    { autoAlpha: 1, duration: seconds(plan.bg.for), ease: FADE },
    seconds(plan.bg.at),
  )

  for (const { part, from, to, fromBox, toBox, at, duration } of moves) {
    if (from !== undefined && to !== undefined && fromBox !== undefined && toBox !== undefined) {
      const delta = flipDelta(fromBox, toBox, zoom)
      const inverse = flipDelta(toBox, fromBox, zoom)
      if (part === 'image') {
        tl.set(from, { autoAlpha: 0 }, at)
        tl.set(
          to,
          { ...delta, transformOrigin: '0 0', autoAlpha: 1, filter: plan.photoFilter.from },
          at,
        )
        tl.to(
          to,
          { x: 0, y: 0, scaleX: 1, scaleY: 1, filter: plan.photoFilter.to, duration, ease: TRAVEL },
          at,
        )
        continue
      }
      const scaleTo = SCALED_TO.has(part)
      const scaleFrom = SCALED_FROM.has(part)
      const fadeAt = at + duration * (1 - cross)
      const fadeFor = duration * cross
      // A part that barely travels rises into place instead, so it still arrives.
      const lift = Math.hypot(delta.x, delta.y) < plan.rise.underPx ? plan.rise.byPx : 0
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
          { autoAlpha: 0, y: plan.words.risePx },
          {
            autoAlpha: 1,
            y: 0,
            duration: fadeFor,
            ease: 'power3.out',
            stagger: seconds(plan.words.step),
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
          { autoAlpha: 1, duration: duration * plan.labelShare, ease: FADE },
          at + duration * (1 - plan.labelShare),
        )
      }
      const icon = to.querySelector<HTMLElement>('[data-icon]')
      const title = to.querySelector<HTMLElement>('[data-title]')
      if (icon !== null && title !== null) {
        // A card's icon and title resolve a beat after the card itself shows.
        const innerAt = fadeAt + seconds(plan.card.after)
        const innerFor = seconds(plan.card.for)
        tl.set(icon, { scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%' }, at)
        tl.set(title, { y: plan.card.risePx, autoAlpha: 0 }, at)
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
            duration: duration * cross,
            ease: 'power2.out',
            immediateRender: false,
          },
          at + duration * (1 - cross),
        )
      }
    } else if (from !== undefined) {
      tl.to(from, { autoAlpha: 0, duration: duration * cross, ease: FADE }, at)
    }
  }
}

// Removes everything a build may have written, whatever state it was in.
export function clearBuild(gsap: Gsap, layers: readonly Layers[]): void {
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
