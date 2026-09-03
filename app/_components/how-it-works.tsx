import { CTA } from '@/app/_components/nav-links'
import { ProgressPanel } from '@/app/_components/progress-panel'
import { buttonStyles } from '@/components/ui/button'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { TrackedLink } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// One question at a time. The questions themselves are never listed here.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16">
      <div className="grid md:grid-cols-6">
        <div className="flex flex-col gap-6 p-8 md:sticky md:top-20 md:col-span-3 md:self-start md:p-10 lg:p-14">
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl lg:text-5xl">
            One question at a time.
          </h2>
          <p className="text-lg text-balance text-on-surface-muted">
            You see one question, answer it, and the next one appears. While you answer, we&apos;re
            already working.
          </p>
          <div className="flex flex-col gap-2 text-on-surface-muted">
            <p>
              Five short questions. The first is a sentence or two about your business. The rest
              appear one at a time.
            </p>
            <p>
              No phone number. No budget question. No account. Skip anything you don&apos;t have.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="how-it-works"
              className={buttonStyles({ variant: 'primary', className: 'w-fit' })}
            >
              {CTA.label}
            </TrackedLink>
            <p className="text-sm text-on-surface-muted">{SITE.reassurance}</p>
          </div>
        </div>

        <div className="relative border-t border-border md:col-span-3 md:border-t-0 md:border-l">
          <CornerTicks edges={['top', 'bottom']} />
          <div className="flex items-center justify-center p-6 md:p-12 lg:p-16">
            <ProgressPanel />
          </div>
          <p className="max-w-md px-6 pb-8 text-sm leading-relaxed text-on-surface-muted md:px-12 lg:px-16">
            By your fourth answer, we&apos;ve already started on your copy. When your designs are
            ready, the link appears on screen and lands in your inbox.
          </p>
        </div>
      </div>
    </section>
  )
}
