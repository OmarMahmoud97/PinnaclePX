import { HowItWorksTrack } from '@/app/_components/how-it-works-track'
import { CTA } from '@/app/_components/nav-links'
import { HOW_IT_WORKS } from '@/app/_components/section-copy'
import { cardBody, sectionLead, stepHeading, titleHeading } from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'

// The room a step takes beside the frame: its words, then a share of a screen below them, so
// every stage has its own stretch of scrolling and less on a phone, where the frame takes half
// the screen and a flick covers several. It is room under each step rather than a floor under all
// of them, so the space to the next step is the same one everywhere — the same five times over,
// whatever the copy runs to and whatever the screen — and the ask sits on that rhythm too. The
// last step paints two stages rather than one; they share its height, so the build lands halfway
// down it, with the frame still whole on screen and still in view as it leaves the sticky.
const STEP_ROOM = 'pb-[7vh] md:pb-[14vh]'

// One question at a time. Five steps, one per answer, each saying what the answer does to the
// design and painting it into the frame beside it as it scrolls past; the last paints the colour
// and then the finished page. The questions themselves are never headed "Question N": the
// frame's progress line already counts.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16">
      <HowItWorksTrack
        heading={
          <div className="flex flex-col gap-3">
            <h2 className={titleHeading}>{HOW_IT_WORKS.heading}</h2>
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
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="how-it-works"
            className={buttonStyles({ size: 'lg', className: 'w-full sm:w-fit' })}
          >
            {CTA.label}
          </TrackedLink>
        }
      />
    </section>
  )
}
