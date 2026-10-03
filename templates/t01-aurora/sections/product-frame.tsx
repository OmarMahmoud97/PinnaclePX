import Image from 'next/image'
import type { AuroraContent, AuroraImage } from '../copy-slots'

type Props = {
  name: string
  frame: AuroraContent['hero']['frame']
  rail: readonly string[]
  image: AuroraImage | null
}

// A drawn panel holding the brand's own words: its name as a heading, the feature titles down
// the rail, the panel's title and three lines from the hero slot, each behind the same plain
// bullet, and the photograph if there is one. Tokens only, so it takes the brand's colours, and
// translucent, so the light shows through it. An illustration, so it is hidden from assistive
// technology; the same words are read in the sections below.
export function ProductFrame({ name, frame, rail, image }: Props) {
  return (
    <div
      aria-hidden="true"
      className="min-h-[28rem] overflow-hidden rounded-t-2xl border border-b-0 border-on-surface/12 bg-surface/70 shadow-[0_-24px_80px_-32px_var(--glow)] backdrop-blur-xl"
    >
      <div className="border-b border-on-surface/8 px-5 py-3 md:px-6">
        <p className="font-display text-small font-semibold wrap-anywhere">{name}</p>
      </div>

      <div className="grid md:grid-cols-[13rem_1fr]">
        <aside className="hidden border-r border-on-surface/8 p-4 md:block">
          <ul className="flex flex-col gap-1">
            {rail.map((item) => (
              <li key={item} className="px-3 py-2 text-small text-on-surface-muted">
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="grid gap-4 p-5 md:p-6 lg:grid-cols-[1fr_15rem]">
          <div>
            <p className="font-display text-heading font-semibold">{frame.title}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {frame.rows.map((row) => (
                <li
                  key={row}
                  className="flex items-center gap-3 rounded-xl border border-on-surface/8 bg-surface/60 px-4 py-3 text-small"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-on-surface-muted" />
                  <span className="flex-1 truncate">{row}</span>
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
