// The questionnaire's page shell, shared by the flow and the skeleton so the server's first
// paint and the hydrated page lay out the same boxes (brief-flow.tsx, start-skeleton.tsx).
// Plain strings, never cn(), as in app/_components/section-styles.ts.
//
// The hooks the three /start sheets read (docs/start-page-journey-plan.md, 11.3): start-flow on
// the grid, which the ramp is sized to (100cqw); start-ground-main on main while the visitor
// answers, and start-ground-region on the region's ground layer, the two layers the hero's ramp is
// painted across from lg (app/_styles/start.css, plan 5.3); and startHeading on every /start H1.
// The ramp's dark band takes the visitor's hue from --start-hue, a number set on start-flow, and
// its light stops move with --ramp-shift; both are registered in start.css.

// One grid under the fixed island, which takes no space. main comes first in the DOM and the
// region "Your brief so far" second; below lg the region takes the first row (its own order),
// and main fills the rest of the screen, so the wash always reaches the foot. From lg the two
// sit side by side as the question and the sketch, each column's minimum 0 rather than its
// content's: a bare fr track grows to fit an ask that will not wrap, and at 1024 the last
// question's did, which moved the split and the board 17 px on the way to it.
export const startGrid =
  'start-flow grid min-h-dvh max-lg:grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)]'

// The question's pane, without its ground or its top padding below lg, which the two states
// below add. From lg what it holds is centred in the pane, which the done view keeps; a question
// sets its title high instead (startMainAsking). Between lg and xl the gutter is 2.5rem,
// not 4rem: at 1024 the pane is 471 px, and a 4rem gutter left the question 343 px, where the
// style cards broke word by word and question five's heading ran to four lines. From xl the 4rem
// gutter returns, so 1280 and wider are as before. The pane clips sideways: the ask reaches out
// to its edges on a phone, and a question entering from the right would otherwise leave the page
// 8 px wider until the next layout, which a finished animation does not trigger. A clip is not a
// scroller, so the ask still sticks.
export const startMain =
  'relative flex flex-col items-center overflow-x-clip px-4 pb-10 transition-colors duration-(--motion-settle) sm:px-8 lg:items-start lg:justify-center lg:px-10 lg:pt-20 lg:pb-12 xl:px-16'

// While the visitor answers, and in the skeleton that stands in for that state: the ground (the
// wash below lg, the ramp from lg, and from lg the title set high rather than centred, start.css),
// and below lg a top padding that clears the pooled curve the region hangs over the pane. The
// skeleton takes it too, so the server's first paint keeps the hydrated question's box.
export const startMainAsking = 'start-ground-main max-lg:pt-[calc(var(--pool)+1.5rem)]'

// Once the brief is sent: the questions' own ground under the ink, as the home page ends, which
// lifts when the designs can be opened, so ready rises to the same light (app/_styles/
// start-done.css). The heading stands where a question's does from lg. The region draws no curve
// at this state (sketch-pane.tsx), so below lg the pane sits only 1.5rem under it, which brings
// the heading into the first screen of a 664 px phone. From lg the pane is at least one screen
// tall rather than as tall as the grid's row, and the row under it is the body's ink.
export const startMainDone = 'start-ground-main max-lg:pt-6 lg:min-h-dvh lg:self-start'

// Every /start H1 (plan 5.1): the hero's size, capped at the size it reaches 1440 wide
// (start.css), with the one payoff word in the serif italic through .emphasis em
// (app/globals.css). Balanced, and broken anywhere, since a title can hold the visitor's name.
// Never blended or transformed; the question fades it in with the form, by opacity alone.
export const startHeading = 'start-heading emphasis font-semibold text-balance wrap-anywhere'

// The done view's H1 (brief-done.tsx, and its stand-in in done-boundary.tsx): the same recipe
// without the balance. Balanced lines are set again when the payoff phrase swaps at ready ("on
// their way." to "ready."), which moved "are" between lines at the moment the plan says the
// heading never moves (6.2); filled lines keep "your designs are" on its own line in both states.
export const doneHeading = 'start-heading emphasis font-semibold wrap-anywhere'
