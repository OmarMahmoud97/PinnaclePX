// Whether the visitor points with a mouse or a trackpad rather than a finger. Keyboard shortcuts
// are offered, and shown, only then: a phone's keyboard has no use for "Enter to go on" or for
// digits that choose (docs/start-page-journey-plan.md, 4.7). Read when needed, in the browser.
export function finePointer(): boolean {
  return window.matchMedia('(pointer: fine)').matches
}
