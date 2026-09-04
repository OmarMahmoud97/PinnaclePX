import type { AuroraContent } from '../copy-slots'
import { button, container } from '../styles'
import { AuroraField } from './aurora-field'

type Props = Pick<AuroraContent, 'cta'>

// The closing ask, in a panel lit from below by the same light as the hero, so the page ends
// where it began.
export function AuroraCta({ cta }: Props) {
  return (
    <section id="start" className="border-t border-border py-section">
      <div className={container}>
        <div className="relative isolate overflow-hidden rounded-3xl border border-border px-6 py-16 text-center md:px-16 md:py-24">
          <AuroraField variant="glow" />
          <h2 className="mx-auto max-w-3xl font-display text-display font-semibold tracking-tight text-balance">
            {cta.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lead text-pretty text-on-surface-muted">
            {cta.body}
          </p>
          <a href={cta.action.href} className={`${button.primary} mt-8`}>
            {cta.action.label}
          </a>
          <p className="mt-4 text-small text-on-surface-muted">{cta.reassurance}</p>
        </div>
      </div>
    </section>
  )
}
