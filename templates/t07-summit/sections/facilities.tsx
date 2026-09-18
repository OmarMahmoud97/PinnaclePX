import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, gap, pad, title } from '../styles'

type Props = Pick<SummitContent, 'facilities'>

// The source's Facilities: an eyebrow and heading over a twelve-column grid of four
// photographs, the first and last seven columns wide and the middle two five, each rounded and
// as tall as the source's. Under the pointer from md a photograph swells over seven tenths of
// a second and a frosted caption slides up from below it over three tenths, holding a title, a
// line and a bordered link whose arrow nudges right and which fills white under the pointer;
// below md the caption is always up. Only the eyebrow and the heading rise as they arrive.
// Without a photograph the cell is the quieter surface.
export function SummitFacilities({ facilities }: Props) {
  return (
    <section id="facilities" className={`${pad} ${anchored} ${gap}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <p data-fade style={delay(0.2)} className={`${eyebrow} font-medium`}>
          {facilities.eyebrow}
        </p>
        <h2
          data-fade
          data-spring="soft"
          className={`${title} mt-6 max-w-2xl text-center text-4xl md:text-5xl`}
        >
          {facilities.heading}
        </h2>
        <div className="mt-16 grid w-full grid-cols-1 gap-4 md:grid-cols-12">
          {facilities.items.map((item, index) => (
            <div
              key={item.title}
              className={`group relative h-75 w-full overflow-hidden rounded-2xl sm:h-85 md:h-94.75 ${index === 0 || index === 3 ? 'md:col-span-7' : 'md:col-span-5'} ${item.image === null ? 'bg-surface-muted' : ''}`}
            >
              {item.image !== null && (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="pointer-events-auto absolute right-0 bottom-0 left-0 w-full bg-scrim/30 p-6 opacity-100 backdrop-blur transition-all duration-300 md:pointer-events-none md:-bottom-full md:p-8 md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:bottom-0 md:group-hover:opacity-100">
                <h3 className="text-xl font-medium text-on-scrim">{item.title}</h3>
                <p className="mt-2 max-w-84 text-sm text-on-scrim">{item.body}</p>
                <a
                  href={facilities.link.href}
                  className="group/btn mt-5 inline-flex items-center gap-2 rounded-sm border border-on-scrim px-4 py-2 text-xs text-on-scrim transition-all duration-300 hover:border-on-scrim hover:bg-on-scrim hover:text-scrim md:text-sm"
                >
                  {facilities.link.label}
                  <ArrowRight
                    size={20}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
