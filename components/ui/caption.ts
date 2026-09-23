// Captions, dates, counters and progress text: the body family with lining, tabular figures, so
// a column of numbers never shifts as it counts. Never headings or body copy.
export const captionStyles = 'text-label tabular-nums text-on-surface-muted'

// Eyebrows: the caption register set in small caps. CSS uppercase leaves textContent alone, so
// a test that reads the label by name still finds the string as written.
//
// Both carry text-on-surface-muted, and Tailwind emits that class after the other text colours,
// so `${eyebrowStyles} text-on-surface` keeps the muted colour: a consumer that needs another
// colour builds the string with cn() (lib/cn.ts), which drops the losing class.
export const eyebrowStyles = `${captionStyles} font-medium tracking-eyebrow uppercase`
