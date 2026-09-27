// What the scroll choreography (app/_components/motion/index.ts) reads of a Work switch's flight
// (ADR 0039): the attribute <html> carries while any flight lives, which holds its refresh, and
// the event on window when the last one ends, which runs it once. A module of its own rather
// than CONFIG, which rides every route's initial bundle, and rather than the switch's numbers
// (lib/motion/work-tuning.ts), so the choreography's chunk carries these two names and nothing
// else of the switch.
export const WORK_FLIGHT = { attribute: 'data-work-morph', endEvent: 'work:morph-end' } as const
