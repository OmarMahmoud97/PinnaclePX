import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { buttonStyles } from '@/components/ui/button'
import { GlowBackdrop } from '@/components/ui/glow-backdrop'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

export function ClosingCta() {
  return (
    <section id="cta" className="relative overflow-hidden px-4 py-20 md:py-32">
      <GlowBackdrop />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl lg:text-5xl">
          Your three designs are five questions away.
        </h2>
        <p className="max-w-2xl font-medium text-balance text-on-surface-muted">
          {SITE.reassurance}
        </p>
        <TrackedLink
          href={CTA.href}
          event="cta_click"
          location="closing"
          className={buttonStyles({ variant: 'cta', size: 'lg', className: 'mt-2' })}
        >
          {CTA.label}
        </TrackedLink>
        <p className="text-sm text-on-surface-muted">
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
    </section>
  )
}
