import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { EmberContent, EmberImage } from '../copy-slots'
import { anchored, delay } from '../styles'

type Props = Pick<EmberContent, 'cta'> & { pictures: readonly (EmberImage | null)[] }

// Where the source pinned the first four dishes: the corners of the band, growing with the
// screen, each swelling a little under the pointer.
const CORNERS = [
  'top-6 left-4 md:top-10 md:left-[6%] lg:left-[10%]',
  'bottom-6 left-6 md:bottom-10 md:left-[10%] lg:left-[14%]',
  'top-6 right-4 md:top-10 md:right-[6%] lg:right-[10%]',
  'bottom-6 right-6 md:bottom-10 md:right-[10%] lg:right-[14%]',
] as const

// The source's closing band: a tall block of the brand colour with round pictures of the
// first four dishes at its corners, and in the middle the heading in the display face, a line
// under it and a pale round button ending in a dark disc with an arrow. The heading and the
// button rise; the line rises a little.
export function EmberCta({ cta, pictures }: Props) {
  return (
    <section
      id="cta"
      className={`${anchored} relative mt-44 flex min-h-100 flex-col items-center justify-center overflow-hidden bg-brand-deeper px-6 md:min-h-110`}
    >
      <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-7xl">
        {pictures.map((picture, index) =>
          picture === null ? null : (
            <Image
              key={`${picture.src} ${String(index)}`}
              src={picture.src}
              alt=""
              width={picture.width}
              height={picture.height}
              sizes="140px"
              className={`pointer-events-auto absolute size-20 rounded-full object-cover transition-all duration-300 hover:scale-105 md:size-28 lg:size-35 ${CORNERS[index] ?? ''}`}
            />
          ),
        )}
      </div>
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div data-fade>
          <h2 className="font-display text-3xl font-medium text-balance text-on-brand md:text-[40px]">
            {cta.heading}
          </h2>
        </div>
        <div data-fade="up-sm" style={delay(0.2)}>
          <p className="mx-auto mt-4 max-w-sm text-on-brand">{cta.body}</p>
        </div>
        <div data-fade style={delay(0.2)} className="flex items-center justify-center">
          <a
            href={cta.button.href}
            className="mt-5.5 flex items-center gap-2.5 rounded-full bg-surface py-2 pr-2 pl-5 text-on-surface transition"
          >
            {cta.button.label}
            <span className="grid size-7 place-content-center rounded-full bg-on-surface text-surface">
              <ArrowRight aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
