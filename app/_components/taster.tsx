import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import { cardHeading, titleHeading } from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CONFIG } from '@/lib/config'
import { CALL_AGENDA, SITE } from '@/lib/site'

// Turns "they did that in five minutes" into "imagine what an hour does". This section books the
// call, so the call itself is shown minute by minute under the step that asks for it.
const STEPS = [
  {
    title: 'You look at your three designs',
    body: 'Open it on your phone, sleep on it, come back to it. Nobody chases you.',
  },
  {
    title: 'You book a call if you like one',
    body: `${String(CONFIG.call.minutes)} minutes. We go through your designs together. You tell us what's wrong and what's missing.`,
    agenda: true,
  },
  {
    title: 'We build the site',
    body: 'You get a fixed quote and a timeline on the call. Then we build it from the design you chose.',
  },
] as const

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
          <h2 className={titleHeading}>
            Five answers get you three designs. Imagine what an hour does.
          </h2>
          <p className="text-lead text-pretty text-on-surface-muted">
            Your three designs are a first look, made in five minutes from almost nothing. They are
            not the finished site. Give us an hour. Tell us what you sell, who you want more of, and
            what customers ask before they book. Then we take the time to design and build the real
            thing, properly.
          </p>
        </div>

        <ol
          data-reveal
          className="divide-y divide-border border-y border-border md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-1 md:border-y-0 md:border-r"
        >
          {STEPS.map(({ title, body, ...step }, index) => (
            <li key={title} style={revealDelay(index)} className="flex gap-5 p-5 md:p-cell">
              <span
                className={`${captionStyles} w-[2ch] shrink-0 pt-1 text-brand-deeper tabular-nums`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className={cardHeading}>{title}</h3>
                <p className="text-body text-pretty text-on-surface-muted">{body}</p>
                {'agenda' in step && <CallAgenda />}
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
            You can also keep the link and do nothing. The designs are free either way.{' '}
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="taster"
              className={`${textLinkStyles} inline-block py-1`}
            >
              Not started yet? Answer the five questions first.
            </TrackedLink>
          </p>
        </div>
      </div>
    </section>
  )
}
