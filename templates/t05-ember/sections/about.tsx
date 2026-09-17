import Image from 'next/image'
import type { EmberContent } from '../copy-slots'
import { anchored, delay, pad } from '../styles'
import { Ornament } from './ornament'

type Props = Pick<EmberContent, 'about'>

// The source's About: the picture at the left, rounded, and at the right the eyebrow between
// two laurel marks, the heading, the paragraph and a small coloured card naming the place with
// a thumbnail and a link to a map. The picture and the eyebrow scale up as they arrive; the
// rest rises. Without a picture a block of the quieter surface holds its place.
export function EmberAbout({ about }: Props) {
  const { image, location } = about
  return (
    <section id="about" className={`${pad} ${anchored} mt-44`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-14 md:flex-row md:gap-18">
        <div data-fade="scale">
          {image === null ? (
            <div className="aspect-[550/432] w-full max-w-137 rounded-3xl bg-surface-muted" />
          ) : (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 548px, 100vw"
              className="h-full w-full max-w-137 rounded-3xl object-cover"
            />
          )}
        </div>
        <div>
          <div data-fade="scale" className="flex items-center gap-2">
            <Ornament side="left" />
            <span className="font-medium uppercase">{about.eyebrow}</span>
            <Ornament side="right" />
          </div>
          <div data-fade>
            <h2 className="mt-5 text-4xl text-balance md:text-5xl">{about.heading}</h2>
          </div>
          <div data-fade style={delay(0.2)}>
            <p className="mt-4.5 max-w-sm text-on-surface-muted">{about.body}</p>
          </div>
          {location !== null && (
            <div
              data-fade
              className="mt-9 flex w-fit items-center gap-3 rounded-lg bg-brand-deeper p-2 pr-8 text-on-brand"
            >
              {location.image !== null && (
                <Image
                  src={location.image.src}
                  alt={location.image.alt}
                  width={location.image.width}
                  height={location.image.height}
                  sizes="60px"
                  className="size-15 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="flex flex-col gap-2">
                <p className="font-medium">{location.name}</p>
                <a href={location.link.href}>{location.link.label}</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
