import { CTA } from '@/app/_components/nav-links'
import { cardBody, cardInk, cardPad, stepHeading } from '@/app/_components/section-styles'
import { CallActions } from '@/app/contact/_components/book-call'
import { CALL } from '@/app/contact/_components/contact-copy'
import { eyebrowStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// The call's route: the ink card beside the paper one (ADR 0040), with the cyan top light the
// Work tiles carry (app/_styles/contact.css, .contact-call), which warms once a message has gone.
// It takes the dark tokens through .contact-ink rather than data-theme, so the header's observer
// never counts a card narrower than the bar. Its heading is the build's own first sentence and
// the promise under it the site's, so the call is described in words the home page already
// keeps. The foot sends a visitor with nothing to show yet to the five questions, its link kept
// whole on a line of its own rather than broken across two.
export function CallCard() {
  return (
    <section
      id="call"
      aria-labelledby="call-heading"
      className={`contact-call contact-ink ${cardInk} ${cardPad}`}
    >
      <div className="contact-call-body flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className={eyebrowStyles}>{CALL.eyebrow}</p>
          <h2 id="call-heading" className={stepHeading}>
            {CALL.heading}
          </h2>
          <p className={cardBody}>{SITE.callPromise}</p>
        </div>
        {/* The ask, with what it costs beside it, as the hero prompt's caption sits by its ask. */}
        <div className="contact-call-ask">
          <p className="text-sm text-balance text-on-surface-muted">{CALL.free}</p>
          {/* The booking control, which opens the calendar's sheet, and the booking page under
              it; without JavaScript the control is that page, in a new tab. */}
          <CallActions />
        </div>
        <p className="text-sm text-on-surface-muted">
          {CALL.noDesigns}{' '}
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="contact-call"
            className={`${textLinkStyles} whitespace-nowrap`}
          >
            {CTA.label}
          </TrackedLink>
        </p>
      </div>
    </section>
  )
}
