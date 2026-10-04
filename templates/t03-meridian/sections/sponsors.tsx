import type { MeridianContent } from '../copy-slots'

type Props = Pick<MeridianContent, 'sponsors'>

// The source's SponsorsSection: a small centred heading over a marquee of names, held to three
// quarters of the width, fading at both edges and pausing under the pointer (meridian.css). The
// row is rendered twice so it can slide without a gap. The source set a sponsor's icon beside
// each name, taken here by position; a crown or a vegan leaf read as a claim about a visitor's
// work, and numerals would restart with the row, so the labels stand alone (decision 1). Its
// address is #labels, since the row names no sponsor (t03-L10).
export function MeridianSponsors({ sponsors }: Props) {
  const row = (hidden: boolean) => (
    <div className="meridian-marquee-inner" aria-hidden={hidden || undefined}>
      {sponsors.items.map((name) => (
        <div key={name} className="flex items-center text-xl font-medium md:text-2xl">
          {name}
        </div>
      ))}
    </div>
  )
  return (
    <section id="labels" className="mx-auto max-w-[75%] pb-24 sm:pb-32">
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
