import {
  AFTER_LAUNCH,
  BUILD_STEPS,
  careLines,
  REAL_BUILD,
  timelineLine,
} from '@/app/_components/build-items'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import {
  cardBody,
  cardHeading,
  commercialBand,
  headingColumn,
  sectionGrid,
  sectionLead,
  stepNumber,
  stepRow,
  titleHeading,
} from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { tapLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CONFIG } from '@/lib/config'

// The Taster's third step, opened out: who does what, what the studio needs, and where it ends.
// The counter restarts at 01 because a visitor may arrive here by the footer link and the
// section must read whole. Steps use the Taster's own row recipe so the two read as one system.
export function RealBuild() {
  return (
    <section id="real-build" className={`scroll-mt-16 ${commercialBand}`}>
      <div className={sectionGrid}>
        <div className={headingColumn}>
          <h2 className={titleHeading}>{REAL_BUILD.heading}</h2>
          <p className={sectionLead}>{REAL_BUILD.lead}</p>
          <p className={`${captionStyles} pt-3`}>{timelineLine(CONFIG.build.weeks)}</p>
        </div>

        <div className="md:col-span-4">
          {/* The section's own bottom hairline comes from <main>'s divide-y, so none here. */}
          <ol data-reveal className="divide-y divide-border border-t border-border md:border-t-0">
            {BUILD_STEPS.map(({ title, body }, index) => (
              <li key={title} style={revealDelay(index)} className={stepRow}>
                <span className={stepNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-2">
                  <h3 className={cardHeading}>{title}</h3>
                  <p className={cardBody}>{body}</p>
                </div>
              </li>
            ))}
          </ol>

          {AFTER_LAUNCH !== null && (
            <div className="flex flex-col gap-3 border-t border-border bg-surface p-5 md:p-cell">
              <h3 className={cardHeading}>{AFTER_LAUNCH.heading}</h3>
              <p className={cardBody}>{AFTER_LAUNCH.body}</p>
              {CONFIG.care !== null && (
                <ul className="flex flex-col gap-1 text-body text-on-surface-muted">
                  {careLines(CONFIG.care).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* The process, then the ask: a visitor who read to the end has a question to bring. */}
          <p className="border-t border-border p-5 text-small text-on-surface-muted md:p-cell">
            {REAL_BUILD.ask}{' '}
            <TrackedLink
              href={BOOK_CALL.href}
              event="call_click"
              location="real-build"
              className={tapLinkStyles}
            >
              {BOOK_CALL.label}
            </TrackedLink>
          </p>
        </div>
      </div>
    </section>
  )
}
