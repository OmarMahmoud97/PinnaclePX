import { BriefSketch } from '@/components/sketch/brief-sketch'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { SketchChips } from '@/components/sketch/sketch-chips'
import type { SketchModel } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import type { Answers } from '@/lib/brief/schema'

type Props = {
  model: SketchModel
  answers: Answers
  // How many questions the chips tick: the question reached, or all five once the brief is sent.
  answered: number
  // The brief is sent: the pool behind the frames brightens, the closing line shows and the
  // curve below lg goes.
  done: boolean
}

// The region "Your brief so far": the visitor's sketch on the hero's ink, with a pool of light
// behind the frames. No client directive, so the flow draws it from the live answers and the
// skeleton from a blank brief at the first question, and the server's HTML, the page without
// JavaScript and the page after hydration all show the same picture in the same box.
//
// It follows main in the DOM, so a screen reader hears the question before the drawing. Below lg
// it comes first on screen: the whole phone beside the brief as a list of chips, centred together
// at every width, because the pool reaches 70 per cent of the phone's width past each side
// (app/_styles/start.css) and from the gutter would fall off the screen's left edge. While the
// visitor answers it ends in the home page's pooled curve over the wash. On a screen under 760
// tall the phone is half size and the padding tighter (app/_styles/start.css, which finds the
// section by its start-region class). From lg it is the right-hand pane: the browser frame with
// the phone over its corner, the caption and the chips under them, clipped to the pane.
export function SketchPane({ model, answers, answered, done }: Props) {
  return (
    <section
      aria-label="Your brief so far"
      // The sketch's --sketch-* variables sit here, outside every dark scope. The light scheme
      // (components/sketch/sketch-model.ts) reads var(--surface) on the element that declares
      // it, so data-theme="dark" on this section or any ancestor would paint every light-style
      // sketch ink. The ink is therefore a ground layer inside, the caption block and the curve
      // carry scopes of their own, and the board sits between them in neither. The section is
      // not clipped below lg, so the curve can hang from it over the wash, and it is raised one
      // level, which also makes it the ground layer's stacking context: grid items paint in their
      // visual order, so main, which follows it on screen, would otherwise paint over the curve.
      style={model.vars}
      data-coloured={model.coloured ? '' : undefined}
      data-done={done ? '' : undefined}
      className="start-region relative z-1 flex items-center justify-center gap-5 px-4 pt-18 pb-6 max-lg:order-first sm:px-8 lg:flex-col lg:gap-6 lg:overflow-clip lg:px-12 lg:pt-24 lg:pb-16"
    >
      <div aria-hidden="true" data-theme="dark" className="absolute inset-0 -z-1 bg-surface" />

      {/* The pool of light's anchor (app/_styles/start.css). */}
      <div className="start-stage lg:w-full lg:max-w-2xl">
        <BriefSketch model={model} />
      </div>

      <div data-theme="dark" className="flex min-w-0 flex-col gap-3 lg:items-center">
        {/* A plain string: cn() would drop the caption's size in favour of its colour. */}
        <p className={`${captionStyles} hidden text-center lg:block`}>{SKETCH_CAPTION.yours}</p>
        {done && (
          <p className="hidden max-w-sm text-center text-sm font-medium text-balance lg:block">
            This is a sketch from five answers. Imagine what an hour does.
          </p>
        )}
        <SketchChips
          answers={answers}
          answered={answered}
          chipsClassName="max-lg:flex-col max-lg:items-start"
        />
      </div>

      {/* The home page's pooled curve, copied from app/page.tsx, where the geometry is explained:
          a circle segment --pool deep, hung under the region by .ink-pool in app/globals.css.
          Copied rather than shared because app/page.tsx is outside this build; one component
          for both waits for a later pass. It is a dark scope of its own, so the island reads the
          ink where the curve passes under it. Static here: nothing on this page moves it. The
          hide from lg is important because .ink-pool is an unlayered rule whose display beats
          any utility. It is drawn only while the visitor answers. Once the brief is sent main is
          the ink too, so the curve would be ink on ink with nothing to separate; with main's
          clearance gone (start-layout.ts) it would hang over the done pane's heading; and under
          forced colours its fill is kept while main turns to the system's ground, so it would
          stay a dark shape there. */}
      {!done && (
        <svg
          data-theme="dark"
          className="ink-pool lg:hidden!"
          viewBox="0 0 1000 140"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 -2H1000V0A962.857 962.857 0 0 1 0 0Z" />
        </svg>
      )}
    </section>
  )
}
