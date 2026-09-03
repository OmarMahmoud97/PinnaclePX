import { Check, Circle } from 'lucide-react'
import { HowItWorksTrack } from '@/app/_components/how-it-works-track'
import { CTA } from '@/app/_components/nav-links'
import { titleHeading } from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'

// What has already happened by the fourth answer. The ticks match when each stage of the build
// starts; the third line stays a plain circle until the pipeline runs.
const LEGEND = [
  { label: 'Your sentence', state: 'received', done: true },
  { label: 'Three designs', state: 'picked for you', done: true },
  { label: 'Your wording', state: 'started by your fourth answer', done: false },
] as const

// One question at a time. The questions themselves are never listed here: the three beats are
// the section's paragraphs, and each paints one more answer into the frame beside it.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16">
      <HowItWorksTrack
        heading={
          <div className="flex flex-col gap-3">
            <h2 className={titleHeading}>One question at a time.</h2>
            <p className="text-lead text-pretty text-on-surface-muted">
              You see one question, answer it, and the next one appears. While you answer,
              we&apos;re already working.
            </p>
          </div>
        }
        beats={
          <ol className="flex flex-col gap-8">
            <li data-beat="2">
              <p className="text-body text-pretty text-on-surface-muted">
                Five short questions. The first is a sentence or two about your business. The rest
                appear one at a time.
              </p>
            </li>
            <li data-beat="3">
              <p className="text-body text-pretty text-on-surface-muted">
                No phone number. No budget question. Skip anything you don&apos;t have.
              </p>
            </li>
            <li data-beat="5">
              <div className="flex flex-col gap-4">
                <p className="text-body text-pretty text-on-surface-muted">
                  By your fourth answer, we&apos;ve already started on your wording. When your
                  designs are ready, the link appears on screen and lands in your inbox.
                </p>
                <ul className="flex flex-col gap-2 text-small">
                  {LEGEND.map(({ label, state, done }) => (
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
