import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, gap, pad, title } from '../styles'

type Props = Pick<SummitContent, 'cta'>

// The source's closing band: a wide rounded block of the quieter surface, brightening from
// two fifths as it arrives, with the heading, a line and a dark button at the left (centred
// below lg), each rising on the softer spring, and from lg a picture at the right whose foot
// runs off the band's bottom edge. Without a picture the band holds its words alone.
export function SummitCta({ cta }: Props) {
  const { image } = cta
  return (
    <section id="cta" className={`${pad} ${anchored} ${gap}`}>
      <div
        data-fade="brighten"
        className="mx-auto flex w-full max-w-270 flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl bg-surface-muted p-8 md:p-12 lg:flex-row lg:p-16"
      >
        <div className="flex flex-col items-center lg:items-start">
          <h2
            data-fade
            data-spring="soft"
            className={`${title} max-w-md text-center text-4xl md:text-5xl lg:text-left`}
          >
            {cta.heading}
          </h2>
          <p
            data-fade
            data-spring="soft"
            style={delay(0.2)}
            className="mt-4 max-w-80 text-center text-sm leading-relaxed text-on-surface/55 lg:text-left"
          >
            {cta.body}
          </p>
          <a
            href={cta.button.href}
            data-fade
            data-spring="soft"
            style={delay(0.2)}
            className="group mt-8 flex items-center gap-2 rounded-sm bg-brand-deeper px-4 py-3 text-sm font-medium text-on-brand hover:bg-brand-deepest"
          >
            {cta.button.label}
            <ArrowRight
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="transition group-hover:translate-x-1"
            />
          </a>
        </div>
        {image !== null && (
          <div className="-mb-8 hidden w-full shrink-0 self-end md:-mb-12 md:w-123.25 lg:-mb-16 lg:block">
            <Image
              src={image.src}
              alt={image.alt}
              width={493}
              height={338}
              sizes="493px"
              priority
              className="block h-auto w-full object-cover"
            />
          </div>
        )}
      </div>
    </section>
  )
}
