import { Radar } from 'lucide-react'
import type { MonolithContent } from '../copy-slots'
import { container } from '../styles'

type Props = Pick<MonolithContent, 'sponsors'>

// The source's Sponsors: a small bold heading in the brand colour over a wrapping row of names,
// each beside a radar icon at sixty percent of the muted text colour.
export function MonolithSponsors({ sponsors }: Props) {
  return (
    <section id="sponsors" className={`${container} pt-24 sm:py-32`}>
      <h2 className="mb-8 text-center font-bold text-brand-deeper lg:text-xl">
        {sponsors.heading}
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
        {sponsors.items.map((name) => (
          <div key={name} className="flex items-center gap-1 text-on-surface-muted/60">
            <span>
              <Radar size={34} />
            </span>
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
        ))}
      </div>
    </section>
  )
}
