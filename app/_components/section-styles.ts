// The page's shared recipes — type, section shell, cards and wells — in one place, so every
// section is built the same way. The caption register lives in components/ui/caption.ts and the
// inline link in components/ui/text-link.ts. Plain strings, hand-ordered, never cn(): a colour
// utility appended after a recipe that already sets one does not win (Tailwind emits the
// recipe's class later in the sheet), so a variant that changes a colour is written out in full.
//
// The hairline recipes that once lived here (commercialBand, bandEdge, cellGrid, hairlineCell,
// stepRow, stepNumber, trailingNote) went with ADR 0034: every separation below the hero is now
// a ground, a card, air or one of two shapes, never a rule.

// Type. Mona Sans at 500 reads light on the dark and tinted grounds, so every heading is 600.

// The first heading and the last: the H1 and the closing H2.
export const displayHeading = 'text-display font-semibold text-balance'

// Every section H2.
export const titleHeading = 'text-title font-semibold text-balance'

// The walkthrough's step titles. They are beats in a scrolling story rather than cards in a
// grid — one to a screenful, alone in a wide column beside the frame — so they take the step
// under the section H2 and carry the reading on their own.
export const stepHeading = 'text-subtitle font-semibold text-balance'

// Card titles.
export const cardHeading = 'text-heading font-semibold'

// Real build's 01 to 05: the heaviest weight, so the page's one set of big figures is a shape,
// and tabular so the column keeps its edge as it counts.
export const numeral = 'text-numeral font-extrabold tabular-nums'

// Included's four job words: the largest text in the band and its colour moment.
export const jobWord = 'text-jobword font-bold'

// The line under a section H2: one step up from the body, quieter than it, wrapped kindly.
export const sectionLead = 'text-lead text-pretty text-on-surface-muted'

// The paragraph under a card, step or answer title.
export const cardBody = 'text-body text-pretty text-on-surface-muted'

// Shell. Every band paints its own ground edge to edge; its content sits in the shell.
export const shell = 'mx-auto w-full max-w-7xl px-6 md:px-10'

// A heading block: the H2, its lead, and whatever else stands with them, at reading width.
export const headingBlock = 'flex max-w-3xl flex-col gap-3'

// A left column pins only when its neighbour is taller than a viewport, at one offset.
export const stickyColumn = 'md:sticky md:top-24 md:self-start'

// The six-column band a section splits into from md: a narrow heading column and a wide body,
// with air between them and no rule. Below md it is one column.
export const sectionGrid = 'grid gap-10 md:grid-cols-6 md:gap-x-10 lg:gap-x-14'

// The narrow column of a sectionGrid band: the H2, its lead, and whatever else pins there.
export const headingColumn = `flex flex-col gap-3 md:col-span-2 ${stickyColumn}`

// Surfaces. Elevation on light is the shadow; on dark it is the surface step plus the inset
// top light. No card has a border.

// A white card, on the wash or on white.
export const card = 'rounded-(--radius-card) bg-surface shadow-card'

// The wash as a card on white (Straight answers, a closed FAQ entry).
export const cardWash = 'rounded-(--radius-card) bg-surface-wash'

// A card inside the dark scope, where bg-surface-muted is --ink-card.
export const cardInk = 'rounded-(--radius-card) bg-surface-muted shadow-card-ink'

// A card's padding; phones use p-4 where a section says so.
export const cardPad = 'p-5 md:p-7'

// A cell inside a card that takes the ground colour: a darker well in the dark scope, a white
// cell on white.
export const well = 'rounded-2xl bg-surface p-4 md:p-5'

// The disc behind a card's icon.
export const iconDisc =
  'grid size-12 shrink-0 place-items-center rounded-full bg-surface text-brand-ink'
