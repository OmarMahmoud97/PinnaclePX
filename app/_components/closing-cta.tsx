import { ClosingSketch } from '@/app/_components/closing-sketch'
import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { displayHeading } from '@/app/_components/section-styles'
import { buttonStyles } from '@/components/ui/button'
import { GlowBackdrop } from '@/components/ui/glow-backdrop'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// The last heading is the first heading's echo, and the page ends on the thing it promised: the
// phone frame, still, with the visitor's sentence or the example brief in it.
export function ClosingCta() {
  return (
    <section id="cta" className="relative isolate overflow-hidden px-6 py-section">
      <GlowBackdrop />
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
          <h2 className={displayHeading}>Your three designs are five questions away.</h2>
          <div className="flex flex-col items-center gap-3 md:items-start">
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="closing"
              className={buttonStyles({ variant: 'cta', size: 'lg' })}
            >
              {CTA.label}
            </TrackedLink>
            <p className="text-small text-on-surface-muted">{SITE.reassurance}</p>
          </div>
          <p className="text-small text-on-surface-muted">
            or{' '}
            <TrackedLink
              href={BOOK_CALL.href}
              event="call_click"
              location="closing"
              className={textLinkStyles}
            >
              {BOOK_CALL.label.toLowerCase()}
            </TrackedLink>
          </p>
        </div>
        <div className="max-md:order-first">
          <ClosingSketch />
        </div>
      </div>
    </section>
  )
}
