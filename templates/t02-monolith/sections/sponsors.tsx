import type { MonolithContent } from '../copy-slots'
import { container } from '../styles'

type Props = Pick<MonolithContent, 'sponsors'>

// The source's Sponsors: a small bold heading in the brand colour over a wrapping row of names,
// each beside a radar icon. Here the names are what the business covers, so the radar, which
// meant nothing beside "Bradford" or "Landlords", is gone and the labels stand alone (decision 1,
// t02-L3). The source set them at sixty percent of the muted text colour, which read at 2.79:1
// on a light page; here they are the muted text colour itself, a checked pair. Each was a
// heading in the source; they are labels, so they are set as text with the same look.
export function MonolithSponsors({ sponsors }: Props) {
  return (
    <section id="sponsors" className={`${container} pt-24 sm:py-32`}>
      <h2 className="mb-8 text-center font-bold text-brand-deeper lg:text-xl">
        {sponsors.heading}
      </h2>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
        {sponsors.items.map((name) => (
          <p key={name} className="text-xl font-bold text-on-surface-muted">
            {name}
          </p>
        ))}
      </div>
    </section>
  )
}
