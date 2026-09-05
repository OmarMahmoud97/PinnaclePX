import { Check, Circle } from 'lucide-react'
import { HowItWorksTrack } from '@/app/_components/how-it-works-track'
import { CTA } from '@/app/_components/nav-links'
import { HOW_IT_WORKS } from '@/app/_components/section-copy'
import { titleHeading } from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'

// One question at a time. The questions themselves are never listed here: the three beats are
// the section's paragraphs, and each paints one more answer into the frame beside it.
export function HowItWorks() {
  const [first, second, third] = HOW_IT_WORKS.beats
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
            <li data-beat={first.stage}>
              <p className="text-body text-pretty text-on-surface-muted">{first.text}</p>
            </li>
            <li data-beat={second.stage}>
              <p className="text-body text-pretty text-on-surface-muted">{second.text}</p>
            </li>
            <li data-beat={third.stage}>
              <div className="flex flex-col gap-4">
                <p className="text-body text-pretty text-on-surface-muted">{third.text}</p>
                <ul className="flex flex-col gap-2 text-small">
                  {HOW_IT_WORKS.legend.map(({ label, state, done }) => (
                    <li key={label} className="flex items-center gap-3">
                      {done ? (
                        <Check aria-hidden="true" className="size-4 text-success" />
                      ) : (
                        <Circle aria-hidden="true" className="size-4 text-on-surface-muted" />
                      )}
                      <span className="font-medium">{label}</span>
                      <span className="text-on-surface-muted">{state}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
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
