import { HowItWorksTrack } from '@/app/_components/how-it-works-track'
import { CTA } from '@/app/_components/nav-links'
import { HOW_IT_WORKS } from '@/app/_components/section-copy'
import { cardBody, cardHeading, sectionLead, titleHeading } from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'

// The room a step takes, by how many stages it paints: about a quarter of a screen each, so every
// stage has its own stretch of scrolling beside the frame, and less on a phone, where the frame
// takes half the screen and a flick covers several. Literal classes so Tailwind can see them.
const ROOM: Readonly<Record<number, string>> = {
  1: 'min-h-[18vh] md:min-h-[25vh]',
  2: 'min-h-[36vh] md:min-h-[50vh]',
}

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
                className={cn('flex flex-col gap-2', ROOM[step.stages.length])}
              >
                <h3 className={cardHeading}>{step.title}</h3>
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
