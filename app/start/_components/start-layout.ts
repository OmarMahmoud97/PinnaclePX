// The questionnaire's page shell, shared by the flow and the skeleton so the server's first
// paint and the hydrated page lay out the same boxes (brief-flow.tsx, start-skeleton.tsx).
// Plain strings, never cn(), as in app/_components/section-styles.ts.

// One grid under the fixed island, which takes no space. main comes first in the DOM and the
// region "Your brief so far" second; below lg the region takes the first row (its own order),
// and main fills the rest of the screen, so the wash always reaches the foot. From lg the two
// sit side by side as the question and the sketch.
export const startGrid = 'grid min-h-dvh max-lg:grid-rows-[auto_1fr] lg:grid-cols-[46fr_54fr]'

// The question's pane, without its ground or its top padding below lg, which the two states
// below add. From lg the question is centred in its pane. Between lg and xl the gutter is 2.5rem,
// not 4rem: at 1024 the pane is 471 px, and a 4rem gutter left the question 343 px, where the
// style cards broke word by word and question five's heading ran to four lines. From xl the 4rem
// gutter returns, so 1280 and wider are as before. The pane clips sideways: the ask reaches out
// to its edges on a phone, and a question entering from the right would otherwise leave the page
// 8 px wider until the next layout, which a finished animation does not trigger. A clip is not a
// scroller, so the ask still sticks.
export const startMain =
  'relative flex flex-col items-center overflow-x-clip px-4 pb-10 transition-colors duration-(--motion-settle) sm:px-8 lg:items-start lg:justify-center lg:px-10 lg:pt-20 lg:pb-12 xl:px-16'

// While the visitor answers, and in the skeleton that stands in for that state: the wash, and
// below lg a top padding that clears the pooled curve the region hangs over the pane. The
// skeleton takes it too, so the server's first paint keeps the hydrated question's box.
export const startMainAsking = 'bg-surface-wash max-lg:pt-[calc(var(--pool)+1.5rem)]'

// Once the brief is sent: the ink, as the home page ends. The region draws no curve at this
// state (sketch-pane.tsx), so below lg the pane sits only 1.5rem under it, which brings the call
// into the first screen of a 664 px phone. From lg the pane is at least one screen tall rather
// than as tall as the grid's row. The finished sketch beside it runs past the fold on a laptop
// (829 px at 1024 by 768), and the pane centred in that taller row slid its slots down with it,
// 30 px under the fold at 1366 by 657. One screen tall, it centres in what the visitor sees. The
// row under it is the body's ink, the same colour as the pane's ground.
export const startMainDone = 'bg-surface max-lg:pt-6 lg:min-h-dvh lg:self-start'
