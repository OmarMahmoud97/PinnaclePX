import { HowItWorksTrack } from '@/app/_components/how-it-works-track'
import { CTA } from '@/app/_components/nav-links'
import { HOW_IT_WORKS } from '@/app/_components/section-copy'
import { titleHeading } from '@/app/_components/section-styles'
import { BUILT_STAGE } from '@/app/_components/walkthrough-brand'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { cn } from '@/lib/cn'

// The room a beat takes, by how many stages it paints: about a quarter of a screen each, so every
// stage has its own stretch of scrolling beside the frame, and less on a phone, where the frame
// takes half the screen and a flick covers several. Literal classes so Tailwind can see them.
const ROOM: Readonly<Record<number, string>> = {
  1: 'min-h-[18vh] md:min-h-[25vh]',
  2: 'min-h-[36vh] md:min-h-[50vh]',
}

// One question at a time. The questions themselves are never listed here: the three beats are
// the section's paragraphs, and each paints its stages into the frame beside it as it scrolls
// past. The finished page arrives with the button.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16">
      <HowItWorksTrack
        heading={
          <div className="flex flex-col gap-3">
            <h2 className={titleHeading}>{HOW_IT_WORKS.heading}</h2>
            <p className="text-lead text-pretty text-on-surface-muted">{HOW_IT_WORKS.lead}</p>
          </div>
        }
        beats={
          <ol className="flex flex-col gap-8">
            {HOW_IT_WORKS.beats.map((beat) => (
              <li
                key={beat.text}
                data-stages={beat.stages.join(' ')}
                className={cn(ROOM[beat.stages.length])}
              >
                <p className="text-body text-pretty text-on-surface-muted">{beat.text}</p>
              </li>
            ))}
          </ol>
        }
        actions={
          <div data-stages={String(BUILT_STAGE)}>
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="how-it-works"
              className={buttonStyles({ size: 'lg', className: 'w-full sm:w-fit' })}
            >
              {CTA.label}
            </TrackedLink>
          </div>
        }
      />
    </section>
  )
}
