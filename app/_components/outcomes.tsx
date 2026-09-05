import { CTA } from '@/app/_components/nav-links'
import { OUTCOME_ITEMS, OUTCOMES } from '@/app/_components/outcome-items'
import { revealDelay } from '@/app/_components/reveal'
import { stickyColumn, titleHeading } from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'

// What a real site does for the owner, told in four rows so the reader recognises their own
// situation without a picker. Text and hairlines only: it sits between two framed sections and
// is the rest the eye needs. No icons, because the 2x2 icon grid belongs to Straight answers.
export function Outcomes() {
  return (
    <section id="outcomes" className="scroll-mt-16">
      <div className="grid md:grid-cols-6 md:divide-x md:divide-border">
        <div className={`flex flex-col gap-3 p-column max-md:pb-3 md:col-span-2 ${stickyColumn}`}>
          <h2 className={titleHeading}>{OUTCOMES.heading}</h2>
          <p className="text-lead text-pretty text-on-surface-muted">{OUTCOMES.lead}</p>
        </div>

        <div className="md:col-span-4">
          <ol
            data-reveal
            className="divide-y divide-border border-y border-border md:border-y-0 md:border-b"
          >
            {OUTCOME_ITEMS.map(({ label, body }, index) => (
              <li key={label} style={revealDelay(index)} className="flex gap-3 p-5 md:p-cell">
                <span className={`${captionStyles} w-[14ch] shrink-0 pt-1`}>{label}</span>
                <p className="text-body text-pretty">{body}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2 p-5 text-small text-on-surface-muted md:p-cell">
            <p>{OUTCOMES.bridge}</p>
            <p>
              <TrackedLink
                href={CTA.href}
                event="cta_click"
                location="outcomes"
                className={`${textLinkStyles} inline-block py-1`}
              >
                {CTA.label}
              </TrackedLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
