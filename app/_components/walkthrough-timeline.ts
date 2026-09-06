import 'client-only'
import {
  addBuild,
  clearBuild,
  type Layers,
  layersOf,
  seconds,
  type Timeline,
  WRITTEN,
} from '@/app/_components/sketch-build'
import { BUILT_STAGE, EMPTY_STAGE, WALKTHROUGH_ANSWERS } from '@/app/_components/walkthrough-brand'
import { typingOffsets } from '@/lib/brief/typing'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import type { Gsap } from '@/lib/motion/gsap'

export type Walkthrough = Readonly<{
  // Glides to a stop from wherever the frame is, forwards or back.
  goTo: (stage: number) => void
  // Measures the frame afresh and places it at a stop with no motion, after a resize.
  rebuild: (stage: number) => void
  // Removes everything the timeline wrote and stops it for good.
  revert: () => void
}>

const { beats, catchUp } = CONFIG.walkthrough
const TEXT = WALKTHROUGH_ANSWERS.description

// Entrances start fast and settle, leavings gather speed, and crossfades meet in the middle.
const ENTER = 'power3.out'
const LEAVE = 'power2.in'
const FADE = 'power2.inOut'

type Scrub = ReturnType<Timeline['tweenTo']>

const labelFor = (stage: number): string => `s${String(stage)}`

function wires(root: Element, name: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`[data-wire="${name}"]`)]
}

// One named element of the frame; a frame without it is a programmer error.
function wire(root: Element, name: string): HTMLElement {
  const [element] = wires(root, name)
  if (element === undefined) throw new AppError(`The walkthrough frame has no "${name}".`)
  return element
}

// The empty frame, written inline: what data-phase="empty" shows through CSS, so the attribute
// can go without a change on screen. Every slot in, everything else out.
function rewind(gsap: Gsap, root: HTMLElement, typed: HTMLElement): void {
  const slots = [...root.querySelectorAll<HTMLElement>('[data-wire$="-slot"]')]
  const rest = [...root.querySelectorAll<HTMLElement>('[data-wire]')].filter(
    (element) => !slots.includes(element) && element !== typed,
  )
  gsap.set(slots, { autoAlpha: 1 })
  gsap.set(rest, { autoAlpha: 0 })
  typed.textContent = ''
}

// 0 to 1, the sentence. The slot gives way to a caret, and the sentence types at the hand's
// rhythm the hero uses, one tween per character on a counter, so scrubbing back deletes it at
// the same rhythm.
function sentence(tl: Timeline, root: HTMLElement, typed: HTMLElement, at: number): number {
  const lead = seconds(beats.sentence.lead)
  const caret = wire(root, 'caret')
  tl.to(wire(root, 'paragraph-slot'), { autoAlpha: 0, duration: lead, ease: FADE }, at)
  tl.to(wire(root, 'paragraph'), { autoAlpha: 1, duration: lead, ease: FADE }, at)
  tl.to(caret, { autoAlpha: 1, duration: lead / 2 }, at + lead / 2)

  const start = at + lead
  const counter = { chars: 0 }
  const write = () => {
    typed.textContent = TEXT.slice(0, Math.round(counter.chars))
  }
  let previous = 0
  for (const [index, offset] of typingOffsets(TEXT, CONFIG.demo.typing).entries()) {
    tl.fromTo(
      counter,
      { chars: index },
      {
        chars: index + 1,
        duration: seconds(offset - previous),
        ease: 'none',
        onUpdate: write,
        immediateRender: false,
      },
      start + seconds(previous),
    )
    previous = offset
  }
  const end = start + seconds(previous)
  tl.to(caret, { autoAlpha: 0, duration: lead, ease: FADE }, end + lead)
  return end + seconds(beats.sentence.tail)
}

// 1 to 2, the name. Each slot gives way to its answer, one part after another, the headline
// first; the sentence steps back from full ink.
function name(tl: Timeline, root: HTMLElement, at: number): number {
  const { step, arrive, mutedOpacity } = beats.name
  const rise = seconds(arrive)
  const pairs = [
    ['headline-slot', 'headline'],
    ['name-slot', 'name'],
    ['mark-slot', 'mark-initials'],
    ['cta-label-slot', 'cta-label'],
    ['footer-slot', 'footer-name'],
  ] as const
  for (const [index, [slot, answer]] of pairs.entries()) {
    const t = at + index * seconds(step)
    tl.to(
      wire(root, slot),
      { autoAlpha: 0, scale: 0.96, transformOrigin: '0 50%', duration: rise * 0.6, ease: LEAVE },
      t,
    )
    tl.fromTo(
      wire(root, answer),
      { autoAlpha: 0, y: 4 },
      { autoAlpha: 1, y: 0, duration: rise, ease: ENTER, immediateRender: false },
      t + rise * 0.15,
    )
  }
  tl.to(
    wire(root, 'paragraph'),
    { opacity: mutedOpacity, duration: rise, ease: FADE },
    at + seconds(step),
  )
  return at + seconds(beats.name.for)
}

// 2 to 3, the logo. The initials shrink away as the mark scales up out of the tile.
function logo(tl: Timeline, root: HTMLElement, at: number): number {
  const arrive = seconds(beats.logo.arrive)
  tl.to(
    wire(root, 'mark-initials'),
    { autoAlpha: 0, scale: 0.7, transformOrigin: '50% 50%', duration: arrive * 0.6, ease: LEAVE },
    at,
  )
  tl.fromTo(
    wire(root, 'mark-logo'),
    { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' },
    { autoAlpha: 1, scale: 1, duration: arrive, ease: ENTER, immediateRender: false },
    at + arrive * 0.2,
  )
  return at + seconds(beats.logo.for)
}

// 3 to 4, the look. The photograph settles in over the hatch, the ground warms, the style's chip
// rises, and the cards take their pictures one after another.
function look(tl: Timeline, root: HTMLElement, at: number): number {
  const { photo, chipAt, cardsAt, step, arrive } = beats.look
  const settle = seconds(photo)
  tl.to(wire(root, 'label-slot'), { autoAlpha: 0, duration: seconds(chipAt) / 2, ease: FADE }, at)
  tl.fromTo(
    wire(root, 'photo'),
    { autoAlpha: 0, scale: 1.06, transformOrigin: '50% 50%' },
    { autoAlpha: 1, scale: 1, duration: settle, ease: ENTER, immediateRender: false },
    at + 0.05,
  )
  tl.to(wire(root, 'ground'), { autoAlpha: 1, duration: settle, ease: FADE }, at + 0.1)
  tl.fromTo(
    wire(root, 'label-style'),
    { autoAlpha: 0, y: 4 },
    { autoAlpha: 1, y: 0, duration: seconds(arrive), ease: ENTER, immediateRender: false },
    at + seconds(chipAt),
  )
  tl.fromTo(
    wires(root, 'card-photo'),
    { autoAlpha: 0, scale: 0.85, transformOrigin: '50% 50%' },
    {
      autoAlpha: 1,
      scale: 1,
      duration: seconds(arrive),
      ease: ENTER,
      stagger: seconds(step),
      immediateRender: false,
    },
    at + seconds(cardsAt),
  )
  return at + seconds(beats.look.for)
}

// 4 to 5, the colour. The coloured twins fade in over their grey bases, top to bottom, and the
// glow behind the phone breathes in.
function colour(tl: Timeline, root: HTMLElement, at: number): number {
  const { each, step, glow } = beats.colour
  tl.to(
    wires(root, 'colour'),
    { autoAlpha: 1, duration: seconds(each), ease: FADE, stagger: seconds(step) },
    at,
  )
  tl.to(wire(root, 'glow'), { autoAlpha: 1, duration: seconds(glow), ease: FADE }, at + 0.1)
  return at + seconds(beats.colour.for)
}

// 5 to 6, the build: the hero's, on this frame (sketch-build.ts), as one nested timeline so it
// scrubs and reverses with the rest. The warm ground goes with the sketch.
function build(gsap: Gsap, tl: Timeline, root: HTMLElement, layers: Layers, at: number): number {
  const plan = beats.build
  const inner = gsap.timeline({ defaults: { lazy: false } })
  addBuild(inner, layers, plan)
  inner.to(
    wire(root, 'ground'),
    { autoAlpha: 0, duration: seconds(plan.bg.for), ease: FADE },
    seconds(plan.bg.at),
  )
  tl.add(inner, at)
  return at + seconds(plan.doneAt)
}

// The whole story as one paused timeline with a label per stop. Nothing in it is a callback, so
// it plays the same forwards and backwards. Built with the frame rewound to empty, and every
// tween's start recorded on its first render, in order, so a scrub back restores what was there.
function make(gsap: Gsap, root: HTMLElement, layers: Layers, typed: HTMLElement): Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { lazy: false } })
  rewind(gsap, root, typed)
  let at = 0
  tl.addLabel(labelFor(EMPTY_STAGE), at)
  at = sentence(tl, root, typed, at)
  tl.addLabel(labelFor(1), at)
  at = name(tl, root, at)
  tl.addLabel(labelFor(2), at)
  at = logo(tl, root, at)
  tl.addLabel(labelFor(3), at)
  at = look(tl, root, at)
  tl.addLabel(labelFor(4), at)
  at = colour(tl, root, at)
  tl.addLabel(labelFor(5), at)
  at = build(gsap, tl, root, layers, at)
  tl.addLabel(labelFor(BUILT_STAGE), at)
  return tl
}

// How many stops a glide from `from` to `to` passes, counting the one it lands on.
function stopsBetween(labels: Record<string, number>, from: number, to: number): number {
  const times = Object.values(labels)
  const crossed =
    from < to
      ? times.filter((time) => time > from && time <= to)
      : times.filter((time) => time >= to && time < from)
  return Math.max(1, crossed.length)
}

// The walkthrough on one stage: the element holding the phone (with the finished page under its
// sketch) and the glow. Everything lives in one GSAP context, so `revert` clears whatever was
// written.
export function buildWalkthrough(gsap: Gsap, root: HTMLElement): Walkthrough {
  const frame = root.querySelector<HTMLElement>('[data-frame="phone"]')
  const found = frame === null ? null : layersOf(frame)
  if (found === null) {
    throw new AppError('The walkthrough stage has no phone with a finished page under it.')
  }
  const layers: Layers = found
  const typed = wire(root, 'typed')
  // A function is required: gsap.context() with none returns the context currently active.
  let ctx = gsap.context(() => undefined)
  let tl: Timeline = ctx.add(() => make(gsap, root, layers, typed))
  let scrub: Scrub | null = null

  function clear(): void {
    scrub?.kill()
    scrub = null
    ctx.revert()
    clearBuild(gsap, [layers])
    gsap.set([...root.querySelectorAll('[data-wire]')], { clearProps: WRITTEN })
    typed.textContent = TEXT
  }

  return {
    goTo: (stage) => {
      const target = tl.labels[labelFor(stage)]
      if (target === undefined) return
      scrub?.kill()
      scrub = null
      const now = tl.time()
      if (target === now) return
      // The next stop plays at its own speed; a jump over several is capped, so a flick to the
      // bottom watches the page assemble in one pass.
      const stops = stopsBetween(tl.labels, now, target)
      const natural = Math.abs(target - now)
      const cap = seconds(
        Math.min(catchUp.maxMs, catchUp.firstMs + catchUp.perStageMs * (stops - 1)),
      )
      const duration = stops === 1 ? natural : Math.min(natural, cap)
      scrub = tl.tweenTo(target, { duration, ease: 'none' })
    },
    rebuild: (stage) => {
      clear()
      ctx = gsap.context(() => undefined)
      tl = ctx.add(() => make(gsap, root, layers, typed))
      tl.seek(labelFor(stage))
    },
    revert: clear,
  }
}
