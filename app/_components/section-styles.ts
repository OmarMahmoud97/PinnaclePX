// The page's shared recipes — type, section shell, cells and rows — in one place, so every
// section is built the same way. The caption register lives in components/ui/caption.ts and the
// inline link in components/ui/text-link.ts.

import { captionStyles } from '@/components/ui/caption'

// The first heading and the last: the H1 and the closing H2.
export const displayHeading = 'text-display font-semibold text-balance'

// Every section H2.
export const titleHeading = 'text-title font-medium text-balance'

// Card and step titles.
export const cardHeading = 'text-heading font-medium'

// A left column pins only when its neighbour is taller than a viewport, at one offset.
export const stickyColumn = 'md:sticky md:top-24 md:self-start'

// The line under a section H2: one step up from the body, quieter than it, wrapped kindly.
export const sectionLead = 'text-lead text-pretty text-on-surface-muted'

// The paragraph under a card, step or answer title.
export const cardBody = 'text-body text-pretty text-on-surface-muted'

// The six-column band a section splits into from md: a narrow heading column and a wide body,
// with the hairline between them. Below md it is one column and the rule never draws.
export const sectionGrid = 'grid md:grid-cols-6 md:divide-x md:divide-border'

// The narrow column of a sectionGrid band: the H2, its lead, and whatever else pins there. On a
// phone the body follows underneath, so the column drops its own bottom padding.
export const headingColumn = `flex flex-col gap-3 p-column max-md:pb-3 md:col-span-2 ${stickyColumn}`

// A grid of cells with a hairline between them: gap-px over a border-coloured background draws
// the rules, so no cell draws its own edges. Two across from the smallest screen; the section
// says how many it widens to.
export const cellGrid = 'grid grid-cols-2 gap-px bg-border'

// One cell of a cellGrid: its own surface painted back over the border colour, and tighter
// padding on a phone than the cell step gives it.
export const hairlineCell = 'flex flex-col gap-3 bg-surface p-4 sm:p-cell'

// A numbered step: the counter beside the words, on the cell's padding.
export const stepRow = 'flex gap-5 p-5 md:p-cell'

// Its counter. Two characters wide so 01 and 09 line up, and lining figures so the column does
// not shift as the list counts on. It takes the caption register's own muted colour: a
// `text-brand-deeper` sat here for a while but never applied, because captionStyles' own
// `text-on-surface-muted` is emitted later at the same specificity and won. Removing it keeps
// what the page has always shown; to make the counters brand instead, build this with `cn()`,
// which drops the losing class, rather than adding the utility back.
export const stepNumber = `${captionStyles} w-[2ch] shrink-0 pt-1 tabular-nums`

// The quiet block a list ends on: the bridge to what follows and the ask, on the rows' padding.
export const trailingNote = 'flex flex-col gap-2 p-5 text-small text-on-surface-muted md:p-cell'
