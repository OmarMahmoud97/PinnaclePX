import {
  AFTER_LAUNCH,
  BUILD_STEPS,
  careLines,
  REAL_BUILD,
  timelineLine,
} from '@/app/_components/build-items'
import { revealDelay } from '@/app/_components/reveal'
import { cardHeading, stickyColumn, titleHeading } from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { CONFIG } from '@/lib/config'

// The Taster's third step, opened out: who does what, what the studio needs, and where it ends.
// The counter restarts at 01 because a visitor may arrive here by the footer link and the
// section must read whole. Steps use the Taster's own row recipe so the two read as one system.
export function RealBuild() {
  return (
    <section id="real-build" className="scroll-mt-16">
      <div className="grid md:grid-cols-6 md:divide-x md:divide-border">
        <div className={`flex flex-col gap-3 p-column max-md:pb-3 md:col-span-2 ${stickyColumn}`}>
          <h2 className={titleHeading}>{REAL_BUILD.heading}</h2>
          <p className="text-lead text-pretty text-on-surface-muted">{REAL_BUILD.lead}</p>
          <p className={`${captionStyles} pt-3`}>{timelineLine(CONFIG.build.weeks)}</p>
        </div>

        <div className="md:col-span-4">
          {/* The section's own bottom hairline comes from <main>'s divide-y, so none here. */}
          <ol data-reveal className="divide-y divide-border border-t border-border md:border-t-0">
            {BUILD_STEPS.map(({ title, body, more }, index) => (
              <li key={title} style={revealDelay(index)} className="flex gap-5 p-5 md:p-cell">
                <span
                  className={`${captionStyles} w-[2ch] shrink-0 pt-1 text-brand-deeper tabular-nums`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className={cardHeading}>{title}</h3>
                  <p className="text-body text-pretty text-on-surface-muted">{body}</p>
                  {more !== undefined && (
                    <p className="text-body text-pretty text-on-surface-muted">{more}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {AFTER_LAUNCH !== null && (
            <div className="flex flex-col gap-3 border-t border-border bg-surface-muted p-5 md:p-cell">
              <h3 className={cardHeading}>{AFTER_LAUNCH.heading}</h3>
              <p className="text-body text-pretty text-on-surface-muted">{AFTER_LAUNCH.body}</p>
              {CONFIG.care !== null && (
                <ul className="flex flex-col gap-1 text-body text-on-surface-muted">
                  {careLines(CONFIG.care).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
