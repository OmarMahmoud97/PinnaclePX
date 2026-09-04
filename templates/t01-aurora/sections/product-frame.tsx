import Image from 'next/image'
import type { AuroraContent, AuroraImage } from '../copy-slots'

type Props = {
  name: string
  frame: AuroraContent['hero']['frame']
  rail: readonly string[]
  image: AuroraImage | null
}

// How far along each of the three rows is: the first done, the last barely started.
const PROGRESS = ['w-full', 'w-3/5', 'w-1/5'] as const

// A window onto the product, drawn from the brand's own words: its name in the title bar, the
// feature titles down the rail, the screen title and three rows from the hero slot, and the
// photograph if there is one. Tokens only, so it takes the brand's colours, and translucent, so
// the light shows through it. An illustration, so it is hidden from assistive technology; the
// same words are read in the sections below.
export function ProductFrame({ name, frame, rail, image }: Props) {
  return (
    <div
      aria-hidden="true"
      className="min-h-[28rem] overflow-hidden rounded-t-2xl border border-b-0 border-on-surface/12 bg-surface/70 shadow-[0_-24px_80px_-32px_var(--glow)] backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 border-b border-on-surface/8 px-4 py-3">
        <span className="size-2.5 rounded-full bg-on-surface/15" />
        <span className="size-2.5 rounded-full bg-on-surface/15" />
        <span className="size-2.5 rounded-full bg-on-surface/15" />
        <span className="mx-auto rounded-md bg-on-surface/6 px-3 py-1 text-label text-on-surface-muted">
          {name}
        </span>
        <span className="w-12" />
      </div>

      <div className="grid md:grid-cols-[13rem_1fr]">
        <aside className="hidden border-r border-on-surface/8 p-4 md:block">
          <ul className="flex flex-col gap-1">
            {rail.map((item, index) => (
              <li
                key={item}
                className={
                  index === 0
                    ? 'rounded-lg bg-on-surface/8 px-3 py-2 text-small font-medium'
                    : 'px-3 py-2 text-small text-on-surface-muted'
                }
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="grid gap-4 p-5 md:p-6 lg:grid-cols-[1fr_15rem]">
          <div>
            <p className="font-display text-heading font-semibold">{frame.title}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {frame.rows.map((row, index) => (
                <li
                  key={row}
                  className="flex items-center gap-3 rounded-xl border border-on-surface/8 bg-surface/60 px-4 py-3 text-small"
                >
                  <span
                    className={`size-2 shrink-0 rounded-full ${index === 0 ? 'bg-brand-deeper' : 'bg-on-surface/25'}`}
                  />
                  <span className="flex-1 truncate">{row}</span>
                  <span className="h-1.5 w-12 shrink-0 rounded-full bg-on-surface/10">
                    <span
                      className={`block h-full rounded-full bg-brand-deeper ${PROGRESS[index] ?? PROGRESS[2]}`}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {image !== null && (
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 240px, 100vw"
              className="aspect-[4/3] w-full rounded-xl object-cover lg:aspect-auto lg:h-full"
            />
          )}
        </div>
      </div>
    </div>
  )
}
