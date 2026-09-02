import { ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { WORKFLOW_FEATURES } from '@/app/_components/workflow-features'
import { Badge } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button'
import { CornerTicks } from '@/components/ui/corner-ticks'

export function Workflow() {
  return (
    <section id="workflow">
      <div className="border-b border-border p-6 md:p-24">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
          <Badge Icon={Sparkles}>How it works</Badge>
          <h2 className="text-3xl font-medium tracking-tighter text-balance md:text-4xl lg:text-6xl">
            From a short brief to a{' '}
            <span className="bg-radial from-brand-deep to-glow-secondary/40 bg-clip-text text-transparent">
              shareable page
            </span>
          </h2>
          <p className="text-balance text-on-surface-muted md:text-lg">
            PinnaclePX turns five answers into a template match, generated copy, and a preview link.
            Nothing to install and nothing to design.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-6">
        <div className="flex flex-col gap-7 p-8 md:sticky md:top-20 md:col-span-2 md:self-start md:p-10 lg:p-14">
          <h3 className="text-3xl font-medium tracking-tighter text-balance lg:text-4xl">
            A preview in minutes, not a project in weeks
          </h3>
          <p className="text-balance text-on-surface-muted">
            Answer five questions about your business. PinnaclePX matches one of ten templates,
            writes every section, and hands you a link to share.
          </p>
          <Link href="/#demo" className={buttonStyles({ variant: 'outline', className: 'w-fit' })}>
            See it in action
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="relative border-t border-border md:col-span-4 md:border-t-0 md:border-l">
          <CornerTicks edges={['top', 'bottom']} />
          <div className="divide-y divide-border">
            {WORKFLOW_FEATURES.map(({ label, description, Icon, Mockup }, index) => (
              <article key={label} className="relative">
                {index > 0 && <CornerTicks edges={['top']} />}
                <div className="flex min-h-100 items-center justify-center p-6 md:min-h-125 md:p-12">
                  <Mockup />
                </div>
                <div className="max-w-xl p-6">
                  <p className="flex items-center gap-3 text-sm text-on-surface-muted">
                    <Icon aria-hidden="true" className="size-4" />
                    {label}
                  </p>
                  <p className="mt-2 leading-relaxed">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
