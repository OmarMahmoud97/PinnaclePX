// An inline link inside a sentence, for the quieter of two actions.
export const textLinkStyles =
  'font-medium text-on-surface underline underline-offset-4 hover:text-brand-deeper'

// The same link where it ends a paragraph and a thumb has to hit it: the padding gives it the
// height a tap target needs, and inline-block is what lets the padding count.
export const tapLinkStyles = `${textLinkStyles} inline-block py-1`
