// An inline link inside a sentence, for the quieter of two actions. Its focus is authored, the
// same colour every button rings with, rather than left to each browser's default: brand-ink
// clears 3:1 on white, on the wash and inside the dark scope, and .over-ink re-declares it.
export const textLinkStyles =
  'rounded-sm font-medium text-on-surface underline underline-offset-4 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink'

// The same link where it ends a paragraph and a thumb has to hit it: the padding gives it the
// height a tap target needs, and inline-block is what lets the padding count.
export const tapLinkStyles = `${textLinkStyles} inline-block py-1`
