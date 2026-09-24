import { HowItWorksTrack } from '@/app/_components/how-it-works-track'
import { CTA } from '@/app/_components/nav-links'
import { HOW_IT_WORKS } from '@/app/_components/section-copy'
import {
  cardBody,
  headingBlock,
  sectionLead,
  shell,
  stepHeading,
  titleHeading,
} from '@/app/_components/section-styles'
import { emphasised } from '@/app/_components/words'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'

// The room a step takes beside the frame: its words, then a share of a screen below them, so
// every stage has its own stretch of scrolling and less on a phone, where the frame takes half
// the screen and a flick covers several. It is room under each step rather than a floor under all
// of them, so the space to the next step is the same one everywhere — the same five times over,
// whatever the copy runs to and whatever the screen — and the ask sits on that rhythm too. The
// last step paints two stages rather than one; they share its height, so the build lands halfway
// down it, with the frame still whole on screen and still in view as it leaves the sticky.
// This is the room of the list as it stands: on a phone with the steps docked under the phone
// (ADR 0036) a step takes --walk-rest of scroll instead (app/_styles/how-it-works.css).
const STEP_ROOM = 'pb-[7vh] md:pb-[14vh]'

// One question at a time. Five steps, one per answer, each saying what the answer does to the
// design and painting it into the frame beside it as it scrolls past; the last paints the colour
// and then the finished page. The questions themselves are never headed "Question N": the
// frame's progress line already counts.
//
// The band is the first light ground after the hero's ink (ADR 0034): the dark stretch above
// ends in a pooled curve hung over this band's top, so `under-ink` carries the extra padding
// that keeps the heading clear of it at the curve's fullest stretch (app/globals.css), and
// `walkthrough-band` (app/_styles/how-it-works.css) runs
// the wash from its deep top stop to flat before the first step, where the active title's blue
// needs the lighter ground. The H2 sets "look" in the serif italic, the one emphasis the section
// carries; the sentence itself is unchanged, so a test reading the heading by name still finds
// it. The heading block reveals by CSS alone: nothing else in the band may move (D8), because
// the walkthrough's stage measures its own geometry from the scroll. From md the block carries
// the band recipe's gap to its content (4.2, `md:gap-14`) as its own padding, since it shares the
// track's grid column with the steps and the grid has no row gap; on a phone the stage sits
// between them, with its own room.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="walkthrough-band under-ink scroll-mt-16 pb-band">
      <div className={shell}>
        <HowItWorksTrack
          heading={
            <div data-reveal="" className={`${headingBlock} md:pb-14`}>
              <h2 className={`${titleHeading} emphasis`}>
                {emphasised(HOW_IT_WORKS.heading, HOW_IT_WORKS.emphasis)}
              </h2>
              <p className={sectionLead}>{HOW_IT_WORKS.lead}</p>
            </div>
          }
          steps={
            <ol className="flex flex-col gap-8">
              {HOW_IT_WORKS.steps.map((step) => (
                <li
                  key={step.title}
                  data-stages={step.stages.join(' ')}
                  className={`flex flex-col gap-3 ${STEP_ROOM}`}
                >
                  <h3 className={stepHeading}>{step.title}</h3>
                  <p className={cardBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          }
          actions={
            <div className="flex flex-col items-start gap-3">
              <TrackedLink
                href={CTA.href}
                event="cta_click"
                location="how-it-works"
                className={buttonStyles({ size: 'lg', className: 'w-full sm:w-fit' })}
              >
                {CTA.label}
              </TrackedLink>
              {/* What the designs lead to, after the button rather than inside the steps: the
                  five beats are about the sketch, and this is the one line about the site. */}
              <p className="text-small text-pretty text-on-surface-muted">{HOW_IT_WORKS.bridge}</p>
            </div>
          }
        />
      </div>
    </section>
  )
}
