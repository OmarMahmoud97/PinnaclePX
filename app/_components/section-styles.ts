// The page's heading recipes and its sticky column, in one place, so every section sets type
// the same way. The caption register lives in components/ui/caption.ts and the inline link in
// components/ui/text-link.ts.

// The first heading and the last: the H1 and the closing H2.
export const displayHeading = 'text-display font-semibold text-balance'

// Every section H2.
export const titleHeading = 'text-title font-medium text-balance'

// Card and step titles.
export const cardHeading = 'text-heading font-medium'

// A left column pins only when its neighbour is taller than a viewport, at one offset.
export const stickyColumn = 'md:sticky md:top-24 md:self-start'
