export type Box = Readonly<{ left: number; top: number; width: number; height: number }>

type Delta = Readonly<{ x: number; y: number; scaleX: number; scaleY: number }>

// FLIP's inverse step as arithmetic: the transform that makes an element laid out at `to`
// appear exactly where `from` is, so it can then tween back to identity. Scale is about the
// top-left corner, so the caller sets transform-origin 0 0. `zoom` is visual pixels per layout
// pixel when an ancestor uses CSS zoom (the phone strip does): translations are measured in
// visual pixels but applied in the element's own, so they are divided back; ratios need no
// correction. A zero-sized target keeps scale 1 rather than dividing by zero.
export function flipDelta(from: Box, to: Box, zoom = 1): Delta {
  return {
    x: (from.left - to.left) / zoom,
    y: (from.top - to.top) / zoom,
    scaleX: to.width === 0 ? 1 : from.width / to.width,
    scaleY: to.height === 0 ? 1 : from.height / to.height,
  }
}
