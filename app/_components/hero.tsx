import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { buttonStyles } from '@/components/ui/button'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { GlowBackdrop } from '@/components/ui/glow-backdrop'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

export function Hero() {
  return (
    <section id="hero" className="relative px-4 py-16 md:py-24">
      <CornerTicks />
      <GlowBackdrop />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tighter text-balance md:text-5xl lg:text-6xl">
          {SITE.tagline}
        </h1>
        <p className="max-w-2xl text-lg text-balance text-on-surface-muted">
          Tell us what your business does in a sentence or two. Four short questions and about five
          minutes later, you&apos;ll see three first-look homepage designs in your logo and colours.
          A taste of how we work, free. Then decide whether to talk to us.
        </p>

        <div className="flex flex-col items-center gap-3">
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="hero"
            className={buttonStyles({ variant: 'cta', size: 'lg' })}
          >
            {CTA.label}
          </TrackedLink>
          <p className="text-sm text-on-surface-muted">{SITE.reassurance}</p>
        </div>

        <p className="text-sm text-on-surface-muted">
          Rather talk first?{' '}
          <TrackedLink
            href={BOOK_CALL.href}
            event="call_click"
            location="hero"
            className={textLinkStyles}
          >
            {BOOK_CALL.label}
          </TrackedLink>
        </p>
      </div>
    </section>
  )
}
