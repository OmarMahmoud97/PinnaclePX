import { BUILD_STEPS, REAL_BUILD } from '@/app/_components/build-items'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import {
  bandEdge,
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
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CALL_AGENDA, SITE } from '@/lib/site'

// What the call is spent on, in order, under the step that asks for it, so the feared sales call
// has a known shape. The minutes are on the button, so the lines say what happens, not when.
function CallAgenda() {
  return (
    <ul
      aria-label="What happens on the call"
      className="flex list-disc flex-col gap-1 pt-1 pl-4 text-small text-on-surface-muted marker:text-border"
    >
      {CALL_AGENDA.map(({ from, what }) => (
        <li key={from}>{what}</li>
      ))}
    </ul>
  )
}

// The build, step by step: who does what, what the studio needs, and where it ends. The band
// books the call, so the call button sits in the heading column beside the steps, with the
// promise about the call under it. The counter restarts at 01 because a visitor may arrive here
// from the footer and the section must read whole.
export function RealBuild() {
  return (
    <section id="real-build" className={`scroll-mt-16 ${commercialBand}`}>
      {/* Opens the tinted stretch that runs to the end of Your options. */}
      <div aria-hidden="true" className={bandEdge} />
      <div className={sectionGrid}>
        <div className={headingColumn}>
          <h2 className={titleHeading}>{REAL_BUILD.heading}</h2>
          <p className={sectionLead}>{REAL_BUILD.lead}</p>
          <div className="flex flex-col gap-2 pt-2">
            <TrackedLink
              href={BOOK_CALL.href}
              event="call_click"
              location="real-build"
              className={buttonStyles({
                variant: 'contrast',
                size: 'lg',
                className: 'w-full sm:w-fit',
              })}
            >
              {BOOK_CALL.label}
            </TrackedLink>
            <p className="text-small text-on-surface-muted">{SITE.callPromise}</p>
          </div>
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
                  {index === 0 && <CallAgenda />}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
