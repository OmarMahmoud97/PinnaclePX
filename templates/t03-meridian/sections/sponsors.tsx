import { Cookie, Crown, Drama, Ghost, Puzzle, Squirrel, Vegan } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'

type Props = Pick<MeridianContent, 'sponsors'>

// The source's seven sponsor icons, in its order, taken by position.
const ICONS = [Crown, Vegan, Ghost, Puzzle, Squirrel, Cookie, Drama] as const

// The source's SponsorsSection: a small centred heading over a marquee of names beside icons,
// held to three quarters of the width, fading at both edges and pausing under the pointer
// (meridian.css). The row is rendered twice so it can slide without a gap.
export function MeridianSponsors({ sponsors }: Props) {
  const row = (hidden: boolean) => (
    <div className="meridian-marquee-inner" aria-hidden={hidden || undefined}>
      {sponsors.items.map((name, index) => {
        const Icon = ICONS[index % ICONS.length] ?? Crown
        return (
          <div key={name} className="flex items-center text-xl font-medium md:text-2xl">
            <Icon size={32} className="mr-2 text-on-surface" />
            {name}
          </div>
        )
      })}
    </div>
  )
  return (
    <section id="sponsors" className="mx-auto max-w-[75%] pb-24 sm:pb-32">
      <h2 className="mb-6 text-center text-lg md:text-xl">{sponsors.heading}</h2>

      <div className="mx-auto">
        <div className="meridian-marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  )
}
