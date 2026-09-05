import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'
import { paragraph } from '../styles'

type Props = { partners: NonNullable<AtlasContent['partners']> }

// The source's Partners: a rounded band on the faint haze, a heading and a line flipping down
// as they arrive, and a wrapping row of logos.
export function AtlasPartners({ partners }: Props) {
  return (
    <section className="atlas-band relative my-24 max-w-full overflow-hidden shadow sm:mx-6 sm:rounded-2xl">
      <div className="flex w-full flex-col items-center justify-center px-6 py-16 text-center sm:px-0 [&>*+*]:mt-4">
        <h3 data-fade="flip" className="text-2xl font-semibold text-on-surface">
          {partners.heading}
        </h3>
        <p data-fade="flip" className={paragraph}>
          {partners.lead}
        </p>
        <div data-fade="up" className="flex flex-wrap items-center justify-center">
          {partners.logos.map((logo) => (
            <div key={logo.src}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="mx-auto sm:w-1/2 lg:w-72"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
