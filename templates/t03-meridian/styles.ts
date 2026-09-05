// The source's shadcn primitives (button, card, badge, input, label, separator) and its
// Tailwind container, class for class, painted with the tokens. Class strings stay literal so
// Tailwind can see them.
//
// Token map from the source's theme: background and popover -> surface, foreground ->
// on-surface, card -> accent, muted, secondary and accent -> surface-muted, muted-foreground ->
// on-surface-muted, border and input -> border, primary -> brand-deeper, primary-foreground ->
// on-brand, ring -> brand-deepest. Tailwind 4 orders conflicting utilities by name rather than
// by position in a class string, so every variant the source reaches by overriding is written
// out whole here.

// Tailwind 3's container as the source configured it: centred, 1.5rem of padding, and one
// breakpoint, since a container's screens replace the theme's: full width until 1400px, then
// 1400px.
export const container = 'mx-auto w-full px-6 min-[1400px]:max-w-[1400px]'

export const card = 'rounded-lg border border-border bg-accent text-on-surface shadow-xs'
// Tailwind 3's space-y put its margin above every child but the first; Tailwind 4 puts it below
// every child but the last, which moves a row's contents, so the source's spacing is written
// out as the older rule.
export const cardHeader = 'flex flex-col p-6 [&>*+*]:mt-1.5'
// The team cards' header: the source overrides its padding away and keeps its spacing.
export const cardHeaderBare = 'flex flex-col gap-0 p-0 [&>*+*]:mt-1.5'
export const cardTitle = 'text-2xl leading-none font-semibold tracking-tight'
// The title at text-lg. The source's class merger drops leading-none with a new size, so the
// line height is text-lg's own.
export const cardTitleLg = 'text-lg font-semibold tracking-tight'
export const cardDescription = 'text-sm text-on-surface-muted'
export const cardContent = 'p-6 pt-0'
export const cardFooter = 'flex items-center p-6 pt-0'

// The source opens every section with a small tracked line in the brand colour over a bold
// heading and, often, a lead at half width.
export const eyebrow = 'mb-2 text-lg tracking-wider text-brand-deeper'
export const sectionTitle = 'mb-4 text-3xl font-bold md:text-4xl'
export const sectionLead = 'mx-auto mb-8 text-xl text-on-surface-muted md:w-1/2'

// The phrase the hero and the ask set in a gradient from the first glow to the brand colour.
export const gradientText = 'bg-linear-to-r from-glow to-brand-deeper bg-clip-text text-transparent'

const BADGE =
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:ring-2 focus:ring-brand-deepest focus:ring-offset-2 focus:outline-none'
export const badge = {
  default: `${BADGE} border-transparent bg-brand-deeper px-2.5 py-0.5 text-xs text-on-brand hover:bg-brand-deeper/80`,
  secondary: `${BADGE} border-transparent bg-surface-muted px-2.5 py-0.5 text-xs text-on-surface hover:bg-surface-muted/80`,
  // The hero's outer badge: outline, at text-sm with py-2.
  outlineLg: `${BADGE} border-border px-2.5 py-2 text-sm text-on-surface`,
} as const

// The radius is left to each variant: the carousel's buttons are round.
const BUTTON =
  'inline-flex items-center justify-center text-sm font-medium whitespace-nowrap ring-offset-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand-deepest focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
export const button = {
  default: `${BUTTON} h-10 rounded-md bg-brand-deeper px-4 py-2 text-on-brand hover:bg-brand-deeper/90`,
  secondary: `${BUTTON} h-10 rounded-md bg-surface-muted px-4 py-2 text-on-surface hover:bg-surface-muted/80`,
  outline: `${BUTTON} h-10 rounded-md border border-border bg-surface px-4 py-2 hover:bg-surface-muted hover:text-on-surface`,
  ghost: `${BUTTON} h-10 rounded-md px-4 py-2 hover:bg-surface-muted hover:text-on-surface`,
  ghostSm: `${BUTTON} h-9 rounded-md px-3 hover:bg-surface-muted hover:text-on-surface`,
  // The carousel's arrows: outline, icon-sized, round and 32px.
  outlineRound: `${BUTTON} h-8 w-8 rounded-full border border-border bg-surface hover:bg-surface-muted hover:text-on-surface`,
} as const

export const input =
  'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-surface placeholder:text-on-surface-muted focus-visible:ring-2 focus-visible:ring-brand-deepest focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
export const textarea =
  'flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-surface placeholder:text-on-surface-muted focus-visible:ring-2 focus-visible:ring-brand-deepest focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
export const label = 'text-sm leading-none font-medium'
export const separator = 'h-[1px] w-full shrink-0 bg-border'
