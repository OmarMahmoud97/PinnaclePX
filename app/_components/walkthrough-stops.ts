export type Beat = Readonly<{ top: number; height: number; stages: readonly number[] }>

// Which stop the scroll has reached. Each beat paints one or more stages, spread evenly down its
// height: the first at its top, the next a share of the way down, and so on. A stage is reached
// once its line has passed the anchor (the reading line under the sticky frame), and the stop is
// the furthest stage reached; before the first beat's top it is 0, the empty frame. Measured in
// the same coordinates as the anchor, so viewport pixels from getBoundingClientRect will do.
export function stageAt(anchorY: number, beats: readonly Beat[]): number {
  let stop = 0
  for (const { top, height, stages } of beats) {
    for (const [index, stage] of stages.entries()) {
      const line = top + (height * index) / stages.length
      if (line <= anchorY) stop = Math.max(stop, stage)
    }
  }
  return stop
}

// The beats of a list whose steps dock in one place (the walkthrough on a phone, ADR 0036): a
// docked step's own box sits at the dock, so its beat comes from where it lies in the list,
// below the steps before it, and it holds one step's height of scroll for each stage it paints.
// Only the last step paints more than one stage; the list's ::after
// (app/_styles/how-it-works.css) gives it the room.
export function stackedBeats(
  top: number,
  steps: readonly Readonly<{ height: number; stages: readonly number[] }>[],
): Beat[] {
  let y = top
  return steps.map(({ height, stages }) => {
    const beat = { top: y, height: height * stages.length, stages }
    y += height
    return beat
  })
}

// The stages a beat paints, from its data-stages attribute ("4 5 6").
export function stagesFrom(attribute: string | undefined): number[] {
  return (attribute ?? '')
    .split(/\s+/)
    .filter((part) => part !== '')
    .map(Number)
    .filter((stage) => Number.isInteger(stage))
}
