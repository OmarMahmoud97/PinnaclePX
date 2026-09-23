import { BUILD_STEPS, REAL_BUILD } from '@/app/_components/build-items'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import {
  card,
  cardBody,
  cardHeading,
  cardPad,
  headingColumn,
  numeral,
  sectionGrid,
  sectionLead,
  shell,
  titleHeading,
} from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CALL_AGENDA, SITE } from '@/lib/site'

// The row: on a phone the numeral stands above its card; from md the two share a grid whose
// first column is the numeral's, narrower at md where the figures sit at the clamp's floor.
const STEP_ROW =
  'flex flex-col gap-2 md:grid md:grid-cols-[4.5rem_1fr] md:items-start md:gap-x-6 lg:grid-cols-[5.5rem_1fr]'

// The numeral. It ships reached (data-reached in the server markup), so reduced motion, no
// JavaScript and phones all show the finished, blue state; only the scroll module un-reaches the
// rows the visitor has not passed yet, and the colour change itself is this CSS transition. On a
// phone it drops to the title size so the figure never outweighs its card.
const STEP_NUMERAL = `step-numeral ${numeral} text-on-surface-muted transition-colors duration-(--motion-settle) data-reached:text-brand-ink max-md:text-title`

// What the call is spent on, in order, under the step that asks for it, so the feared sales call
// has a known shape. The minutes are on the button, so the lines say what happens, not when.
function CallAgenda() {
  return (
    <ul
      aria-label="What happens on the call"
      className="flex list-disc flex-col gap-1 pt-1 pl-4 text-small text-on-surface-muted marker:text-on-surface-muted"
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
//
// The steps are five white cards on the wash with a numeral beside each and, from md, a rail
// drawn behind the numeral column (ADR 0034): the one object that separates the rows, in place
// of the rules the band used to carry. The rail is a sibling of the list rather than a child, so
// the list holds only its items and the reveal never moves the rail.
export function RealBuild() {
  return (
    <section id="real-build" className="scroll-mt-16 bg-surface-wash py-band">
      <div className={shell}>
        <div className={sectionGrid}>
          <div data-reveal className={headingColumn}>
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

          <div className="relative md:col-span-4">
            {/* The rail fills as the steps are passed. Its finished state is the server default:
                no stylesheet sets the fill, so it ships full and reduced motion, no JavaScript
                and phones (where the rail is hidden anyway) all see the finished line. The scroll
                module (motion/real-build.ts) alone sets it to 0 before scrubbing it in, and the
                scrub is the only thing that ever transforms it. */}
            <div
              aria-hidden="true"
              className="rail absolute top-4 bottom-4 left-[2.6rem] hidden w-0.5 rounded-full bg-on-surface/10 md:block"
            >
              <div className="rail-fill absolute inset-0 origin-top rounded-full bg-brand-ink" />
            </div>
            <ol data-reveal data-choreo="steps" className="relative flex flex-col gap-4">
              {BUILD_STEPS.map(({ title, body }, index) => (
                <li key={title} style={revealDelay(index)} className={STEP_ROW}>
                  <span aria-hidden="true" data-reached="" className={STEP_NUMERAL}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className={`flex flex-col gap-2 ${card} ${cardPad}`}>
                    <h3 className={cardHeading}>{title}</h3>
                    <p className={cardBody}>{body}</p>
                    {index === 0 && <CallAgenda />}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
