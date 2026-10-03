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

// names: the copy's brand name, then the company name; either may be missing.
export declare function measureTextFit(args: {
  names: readonly (string | null | undefined)[]
}): TextFitFinding[]
