import Link from 'next/link'
import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import { cardHeading, titleHeading } from '@/app/_components/section-styles'
import { TASTER, TASTER_STEPS } from '@/app/_components/taster-items'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CALL_AGENDA, SITE } from '@/lib/site'

// Turns "they did that in five minutes" into "imagine what an hour does". This section books the
// call, so the call itself is shown minute by minute under the step that asks for it, and the
// step that follows the call opens into the build section.
function CallAgenda() {
  return (
    <ol aria-label="What happens on the call" className="flex flex-col gap-2 pt-1">
      <li aria-hidden="true" className="flex h-1 gap-0.5 overflow-hidden rounded-full">
        {CALL_AGENDA.map(({ from, to }) => (
          <span key={from} style={{ flexGrow: to - from }} className="bg-brand-deeper/70" />
        ))}
      </li>
      {CALL_AGENDA.map(({ from, to, what }) => (
        <li key={from} className="flex gap-3 text-small">
          <span
            className={`${captionStyles} w-[9ch] shrink-0 pt-0.5 whitespace-nowrap tabular-nums`}
          >
            {from} to {to}
          </span>
          <span className="text-on-surface-muted">{what}</span>
        </li>
      ))}
    </ol>
  )
}

// Steps on the left and the heading with the call button on the right at md and up. The DOM
// order stays heading, steps, actions, so a phone reads what the call is before being asked to
// book it.
export function Taster() {
  return (
    <section id="taster" className="scroll-mt-16">
      <div className="grid md:grid-cols-6 md:grid-rows-[auto_1fr]">
        <div className="flex flex-col gap-3 p-column max-md:pb-3 md:col-span-3 md:col-start-4">
          <h2 className={titleHeading}>{TASTER.heading}</h2>
          <p className="text-lead text-pretty text-on-surface-muted">{TASTER.lead}</p>
        </div>

        <ol
          data-reveal
          className="divide-y divide-border border-y border-border md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-1 md:border-y-0 md:border-r"
        >
          {TASTER_STEPS.map((step, index) => (
            <li key={step.title} style={revealDelay(index)} className="flex gap-5 p-5 md:p-cell">
              <span
                className={`${captionStyles} w-[2ch] shrink-0 pt-1 text-brand-deeper tabular-nums`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className={cardHeading}>{step.title}</h3>
                <p className="text-body text-pretty text-on-surface-muted">{step.body}</p>
                {step.agenda === true && <CallAgenda />}
                {step.buildLink === true && (
                  <p className="text-small">
                    <Link href="/#real-build" className={`${textLinkStyles} inline-block py-1`}>
                      {TASTER.buildLink}
                    </Link>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-4 p-column max-md:pt-6 md:col-span-3 md:col-start-4">
          <div className="flex flex-col gap-2">
            <TrackedLink
              href={BOOK_CALL.href}
              event="call_click"
              location="taster"
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
          <p className="text-small text-on-surface-muted">
            {TASTER.doNothing}{' '}
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="taster"
              className={`${textLinkStyles} inline-block py-1`}
            >
              {TASTER.notStarted}
            </TrackedLink>
          </p>
        </div>
      </div>
    </section>
  )
}
