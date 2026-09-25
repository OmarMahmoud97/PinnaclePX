import { WALKTHROUGH_ANSWERS } from '@/app/_components/walkthrough-brand'
import { paletteFor } from '@/lib/brief/palettes'
import { styleFor } from '@/lib/brief/styles'
import type { CONFIG } from '@/lib/config'

// One answer landing in the frame, as walkthrough-timeline.ts plays it at the speeds in
// CONFIG.walkthrough.beats.
export type Beat = keyof typeof CONFIG.walkthrough.beats

// The walkthrough's own steps, in /start's order (docs/start-page-journey-plan.md, D29 and 8.1):
// the sentence, the name, the look, the colour and the send. Neither the steps nor their stops
// read the questionnaire's ids, so a change there cannot move a stop here unseen. Two things
// still count from its FINAL_STAGE: the sketch model's gates, and walkthrough-brand.ts's
// BUILT_STAGE, which walkthrough-steps.test.ts holds to the last stop below. The steps' words, and
// the stages each writes into the page, are HOW_IT_WORKS.steps (section-copy.ts), in this order;
// the same test holds those stages to the ones below and the titles to /start's.
export const WALKTHROUGH_STEPS = ['sentence', 'brand', 'look', 'colour', 'send'] as const

type WalkthroughStep = (typeof WALKTHROUGH_STEPS)[number]

// The stops each step paints, spread evenly down its height (walkthrough-stops.ts), and the beats
// a glide to each one plays. The name and the logo are one question on /start, so they share a
// stop. The email is never drawn, so the send's first stop holds the finished sketch while its
// words are read and its second builds the page, halfway down the step, while the frame is still
// whole on screen (ADR 0025, decision 2). Only the last step may have two: on a phone, the dock's
// list keeps one extra stop of room at its end (app/_styles/how-it-works.css, ADR 0036).
const STOPS: Readonly<Record<WalkthroughStep, readonly (readonly Beat[])[]>> = {
  sentence: [['sentence']],
  brand: [['name', 'logo']],
  look: [['look']],
  colour: [['colour']],
  send: [[], ['build']],
}

// Every stop in order, from stop 1: stop 0 is the empty frame.
export const WALKTHROUGH_STOPS: readonly (readonly Beat[])[] = WALKTHROUGH_STEPS.flatMap(
  (step) => STOPS[step],
)

// The finished sketch, every answer in and the page not yet built: the stop before the build,
// which is the last. A frame that never moves shows this one.
export const SKETCHED_STAGE = WALKTHROUGH_STOPS.length - 1

// The stops a step paints, numbered as the timeline labels them.
export function stagesOf(step: WalkthroughStep): number[] {
  const before = WALKTHROUGH_STEPS.slice(0, WALKTHROUGH_STEPS.indexOf(step))
  const first = before.reduce((count, earlier) => count + STOPS[earlier].length, 0) + 1
  return STOPS[step].map((_, offset) => first + offset)
}

// How many answers the frame has at a stop, for the sentence a screen reader hears: every step
// with a stop at or before it, the one being painted included.
export function answeredAt(stage: number): number {
  return WALKTHROUGH_STEPS.filter((step) => stagesOf(step).some((painted) => painted <= stage))
    .length
}

// The question number the progress line shows at a stop: the step being painted, and the first
// while the frame is still empty.
export function questionNumberAt(stage: number): number {
  return Math.max(answeredAt(stage), 1)
}

const { company, imagery, colours } = WALKTHROUGH_ANSWERS

// The example brand's answers in words, one per step and in the steps' order, for the sentence a
// screen reader hears in place of the drawing (SketchChips' labels). walkthrough-brand.test.ts
// holds the brand to a logo file, photographs and a preset colour.
const LABELS: Readonly<Record<WalkthroughStep, string>> = {
  sentence: 'Sentence',
  brand: `${company}, logo`,
  look: `${styleFor(imagery.style).label}, ${String(imagery.photos.length)} photos`,
  colour: colours.kind === 'palette' ? paletteFor(colours.paletteId).label : colours.hex,
  send: 'Your details',
}

export const WALKTHROUGH_LABELS: readonly string[] = WALKTHROUGH_STEPS.map((step) => LABELS[step])
