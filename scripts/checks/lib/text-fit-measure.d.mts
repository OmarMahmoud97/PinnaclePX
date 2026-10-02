// The text-fit measure's types, for TypeScript that runs it in a page
// (e2e/reduced-motion-template-fit.spec.ts); text-fit-measure.mjs holds what it does.

export type TextFitFinding = Readonly<{
  kind:
    'clipped' | 'past-screen' | 'broken-word' | 'header-outside' | 'header-wrap' | 'header-overlap'
  section: string
  el: string
  text?: string
  word?: string
  px?: number
  by?: string
  with?: string
}>

export declare function measureTextFit(args: { company: string }): TextFitFinding[]
