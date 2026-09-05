// The source's recipes (its BaseSection, BaseButton, paragraph and gradient classes and its
// Poppins-set text), class for class, painted with the tokens. Class strings stay literal so
// Tailwind can see them.
//
// Token map from the source's fixed colours, its hex codes written bare because no file under
// templates/ may hold a hex literal: white -> surface, FAFAFA -> surface-muted, gray-100 ->
// accent, neutral-800 -> on-surface, gray-700 and 666666 -> on-surface-muted, DDDDDD and
// gray-200 -> border, 468ef9 (the gradient's start) -> brand, 0c66ee (its end, and every border
// and link) -> brand-deeper, the header gradient's cyan -> glow and its first blue ->
// glow-secondary.

// The source's BaseSection: a twelve-column grid at the xl breakpoint's width.
export const section =
  'relative mx-auto grid max-w-(--breakpoint-xl) grid-cols-12 gap-x-6 overflow-hidden px-4 sm:px-8'

// The source's .paragraph.
export const paragraph = 'leading-relaxed tracking-wide text-on-surface-muted'

// The source's .text-gradient and .text-header-gradient (atlas.css), and its eyebrows.
const gradientText = 'atlas-text-gradient'
export const headerGradientText = 'atlas-header-gradient'
export const eyebrow = `${gradientText} text-base font-semibold uppercase`

// The source's BaseButton, and the three ways it fills one: the blue gradient with white
// text, an outline in the deeper blue with gradient text, and a plain underlined word.
const BUTTON =
  'inline-flex cursor-pointer items-center justify-center rounded-full text-center text-sm transition duration-300 outline-none hover:shadow-md hover:shadow-brand-deeper/50 focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
export const button = {
  gradient: `${BUTTON} bg-linear-to-r from-brand to-brand-deeper text-on-brand`,
  outline: `${BUTTON} ${gradientText} border border-brand-deeper bg-inherit`,
  outlineBrand: `${BUTTON} ${gradientText} border border-brand bg-inherit`,
  quiet: `${BUTTON} bg-inherit text-brand underline hover:shadow-none`,
} as const

// The source's NavLink, in the header and the footer.
export const navLink =
  'rounded-lg bg-transparent py-2 text-sm text-on-surface-muted outline-none hover:text-on-surface focus-visible:ring-2 focus-visible:ring-brand-deeper md:px-4'
