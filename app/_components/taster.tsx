import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { buttonStyles } from '@/components/ui/button'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// Turns "they did that in five minutes" into "imagine an hour". This section books the call.
const STEPS = [
  {
    title: 'You look at your three designs',
    body: `Share the link with whoever helps you decide. It stays live for ${String(CONFIG.retention.days)} days, and nobody chases you.`,
  },
  {
    title: 'You book a call if you like one',
    body: "Twenty minutes. We go through your designs together. You tell us what's wrong and what's missing.",
  },
  {
    title: 'We build the site',
    body: 'You get a fixed quote and a timeline on the call. Then we build it from the design you chose.',
  },
] as const

export function Taster() {
  return (
    <section id="taster" className="scroll-mt-16">
      <div className="grid divide-border md:grid-cols-6 md:divide-x">
        <div className="flex flex-col gap-4 p-8 md:col-span-3 md:p-14">
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl">
            Five answers get you three designs. Imagine what an hour does.
          </h2>
          <p className="text-balance text-on-surface-muted">
            Your three designs come from five short answers. They show how we work, not the finished
            site. The real one comes from a proper conversation. What you sell, who you want to
            reach, and what customers ask before they book. That&apos;s what the call is for.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <TrackedLink
              href={BOOK_CALL.href}
              event="call_click"
              location="taster"
              className={buttonStyles({ variant: 'contrast', className: 'w-fit' })}
            >
              {BOOK_CALL.label}
            </TrackedLink>
            <p className="text-sm text-on-surface-muted">{SITE.callPromise}</p>
          </div>
          <p className="text-sm text-on-surface-muted">
            You can also just keep the link and do nothing. The designs are free either way.{' '}
            <TrackedLink
              href={CTA.href}
              event="cta_click"
              location="taster"
              className={textLinkStyles}
            >
              or start the five questions first
            </TrackedLink>
          </p>
        </div>

        <ol className="divide-y divide-border md:col-span-3">
          {STEPS.map(({ title, body }, index) => (
            <li key={title} className="flex gap-6 p-6 md:p-8">
              <span className="font-mono text-sm text-brand-deeper">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
