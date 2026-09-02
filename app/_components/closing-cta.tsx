import Link from 'next/link'
import { CTA } from '@/app/_components/nav-links'
import { buttonStyles } from '@/components/ui/button'
import { GlowBackdrop } from '@/components/ui/glow-backdrop'

export function ClosingCta() {
  return (
    <section
      id="cta"
      className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-20 md:py-32"
    >
      <GlowBackdrop />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl lg:text-5xl">
          Your next landing page is five questions away
        </h2>
        <p className="mx-auto max-w-2xl font-medium text-balance text-on-surface-muted">
          Skip the blank canvas. Answer a short brief and share a branded preview today, free.
        </p>
        <Link
          href={CTA.href}
          className={buttonStyles({ variant: 'cta', size: 'lg', className: 'mt-2' })}
        >
          {CTA.label}
        </Link>
      </div>
    </section>
  )
}
