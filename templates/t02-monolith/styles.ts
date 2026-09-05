// The source's shadcn primitives (button, card, badge, input) and its Tailwind container, class
// for class, painted with the tokens. Class strings stay literal so Tailwind can see them.
//
// Token map from the source's theme: background -> surface, foreground -> on-surface, card ->
// accent, muted and secondary -> surface-muted, muted-foreground -> on-surface-muted, border and
// input -> border, primary -> brand-deeper, primary-foreground -> on-brand, ring ->
// brand-deepest.

// Tailwind 3's container as the source configured it: centred, 1.5rem of padding, and one
// breakpoint, since a container's screens replace the theme's: full width until 1400px, then
// 1400px.
export const container = 'mx-auto w-full px-6 min-[1400px]:max-w-[1400px]'

export const card = 'rounded-lg border border-border bg-accent text-on-surface shadow-xs'
// Tailwind 3's space-y put its margin above every child but the first; Tailwind 4 puts it below
// every child but the last, which moves a row's contents, so the source's spacing is written
// out as the older rule.
export const cardHeader = 'flex flex-col p-6 [&>*+*]:mt-1.5'
// The source's service cards override the header's spacing to space-y-1.
export const cardHeaderTight = 'flex flex-col p-6 [&>*+*]:mt-1'
export const cardTitle = 'text-2xl leading-none font-semibold tracking-tight'
// The title at text-lg. The source's class merger drops leading-none with a new size, so the
// line height is text-lg's own.
export const cardTitleLg = 'text-lg font-semibold tracking-tight'
// The source writes text-md, which is no class; its merger still drops text-sm for it, so the
// description falls back to the base size.
export const cardDescriptionBase = 'text-base text-on-surface-muted'
export const cardDescription = 'text-sm text-on-surface-muted'
// The description set in the brand colour, as the team cards and the hero's profile card do.
export const cardDescriptionBrand = 'text-sm text-brand-deeper'
export const cardContent = 'p-6 pt-0'
export const cardFooter = 'flex items-center p-6 pt-0'

// Every heading sets one phrase in the brand gradient, top to bottom.
export const gradientText =
  'bg-linear-to-b from-brand-deeper/60 to-brand-deeper bg-clip-text text-transparent'

// The badge is text-xs in shadcn; every badge in the source overrides it to text-sm, and two set
// the text in the brand colour, so those are the variants here. Tailwind 4 orders conflicting
// utilities by name, not by position in a class string, so a variant never relies on an
// override winning.
const BADGE =
  'inline-flex items-center rounded-full border border-transparent bg-surface-muted px-2.5 py-0.5 text-sm font-semibold transition-colors hover:bg-surface-muted/80 focus:ring-2 focus:ring-brand-deepest focus:ring-offset-2 focus:outline-none'
export const badge = {
  secondary: `${BADGE} text-on-surface`,
  secondaryBrand: `${BADGE} text-brand-deeper`,
} as const

const BUTTON =
  'inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap ring-offset-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand-deepest focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
export const button = {
  default: `${BUTTON} h-10 bg-brand-deeper px-4 py-2 text-on-brand hover:bg-brand-deeper/90`,
  outline: `${BUTTON} h-10 border border-border bg-surface px-4 py-2 hover:bg-surface-muted hover:text-on-surface`,
  secondary: `${BUTTON} h-10 bg-surface-muted px-4 py-2 text-on-surface hover:bg-surface-muted/80`,
  ghost: `${BUTTON} h-10 px-4 py-2 hover:bg-surface-muted hover:text-on-surface`,
  ghostSm: `${BUTTON} h-9 rounded-md px-3 hover:bg-surface-muted hover:text-on-surface`,
  icon: `${BUTTON} h-10 w-10 bg-brand-deeper text-on-brand hover:bg-brand-deeper/90`,
} as const

export const input =
  'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-surface placeholder:text-on-surface-muted focus-visible:ring-2 focus-visible:ring-brand-deepest focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
