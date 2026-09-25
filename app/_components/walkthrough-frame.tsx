import { Leaf } from 'lucide-react'
import type { ReactNode } from 'react'
import { WALKTHROUGH_ANSWERS, WIRE_COPY } from '@/app/_components/walkthrough-brand'
import { WALKTHROUGH_FILES } from '@/app/_components/walkthrough-photos'
import { PhoneFrame } from '@/components/sketch/phone-frame'
import { Bar, HATCH, PHOTO_STYLE, SLOT_STYLES } from '@/components/sketch/sketch-parts'
import { styleFor } from '@/lib/brief/styles'
import { cn } from '@/lib/cn'
import { AppError } from '@/lib/errors'

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

const { company, description, imagery } = WALKTHROUGH_ANSWERS
const STYLE_LABEL = styleFor(imagery.style).label
const TREATMENT = PHOTO_STYLE[imagery.style]

// The example brand's pictures are checked once at load; a missing one is a programmer error.
function photoAt(index: number): string {
  const photo = WALKTHROUGH_FILES.photos[index]
  if (photo === undefined) throw new AppError(`The example brand needs photo ${String(index)}.`)
  return photo
}
const HERO_PHOTO = photoAt(0)
const CARD_PHOTOS = [photoAt(1), photoAt(2), photoAt(3)]

// The server renders the finished sketch, every answer in. A client that allows motion marks the
// stage `data-phase="empty"` in its first render, and these rules show the slots and hide the
// answers until the timeline takes over with the same state written inline
// (walkthrough-timeline.ts, which finds the slots by the "-slot" suffix). An element shown only
// between two stages starts hidden either way.
export const HIDDEN_WHEN_EMPTY = '[[data-phase=empty]_&]:invisible [[data-phase=empty]_&]:opacity-0'
const ANSWER = HIDDEN_WHEN_EMPTY
const SLOT = 'invisible opacity-0 [[data-phase=empty]_&]:visible [[data-phase=empty]_&]:opacity-100'
const BETWEEN = 'invisible opacity-0'
// A slot and its answer share one cell, so the frame's geometry is the same at every stage and
// the build can measure it whenever it likes.
const STACK = 'grid *:[grid-area:1/1]'
const PHOTO = 'absolute inset-0 bg-cover bg-center'

type Props = {
  className?: string | undefined
  // The finished page laid under the sketch's screen, for the build.
  built?: ReactNode | undefined
}

// The walkthrough's phone: the same wireframe the hero's phone draws (components/sketch/
// phone-sketch.tsx), but for one brand and with every state present at once, so a timeline can
// move between them and back. Each part keeps its slot and its answer as siblings, every
// coloured element has a grey base and a coloured twin (data-wire="colour") stacked on it, and
// the photographs sit over the hatch. Parts carry the data-part names the build pairs with the
// finished page; data-wire names what the timeline moves. Decorative: the track carries the
// brief in words for a screen reader.
export function WalkthroughFrame({ className, built }: Props) {
  return (
    <PhoneFrame className={className}>
      <div className="relative isolate flex flex-1 flex-col">
        {built}
        <div
          data-layer="sketch"
          className="relative z-10 flex flex-1 flex-col gap-2.5 px-3 pt-1 pb-3"
        >
          {/* The style warms the page by a whisper before the colour arrives. */}
          <span
            data-wire="ground"
            className={cn(
              ANSWER,
              'pointer-events-none absolute inset-0 -z-1 bg-linear-to-b from-warning/8 to-transparent',
            )}
          />

          <div className="flex items-center justify-between">
            <span data-part="wordmark" className="flex items-center gap-1">
              <span className="relative size-3.5 shrink-0">
                <span
                  data-wire="mark-slot"
                  className={cn(
                    SLOT,
                    'absolute inset-0 rounded border border-dashed border-(--sketch-dash)',
                  )}
                />
                {/* Between the name and the logo, a point beside the name: the sketch's
                    stand-in for a mark, as on /start, never initials. The wire keeps its name:
                    the timeline finds it by it (walkthrough-timeline.ts). */}
                <span
                  data-wire="mark-initials"
                  className={`${BETWEEN} absolute inset-0 flex items-center justify-center`}
                >
                  <span className="size-1.5 rounded-full bg-on-surface-muted" />
                </span>
                <Leaf
                  data-wire="mark-logo"
                  className={cn(ANSWER, 'absolute inset-0 size-full text-on-surface-muted')}
                />
                <Leaf
                  data-wire="colour"
                  className={cn(ANSWER, 'absolute inset-0 size-full text-(--sketch-strong)')}
                />
              </span>
              <span className={cn(STACK, 'items-center')}>
                <span
                  data-wire="name-slot"
                  className={cn(SLOT, 'block h-1.5 w-10 rounded-full bg-(--sketch-line)')}
                />
                <span
                  data-wire="name"
                  className={cn(ANSWER, 'max-w-24 truncate font-semibold tracking-tight')}
                >
                  {company}
                </span>
              </span>
            </span>
            <span data-part="menu" className="flex flex-col gap-0.5">
              <Bar className="h-0.5 w-3" />
              <Bar className="h-0.5 w-3" />
            </span>
          </div>

          <div data-part="headline" className={cn(STACK, 'items-center')}>
            <span data-wire="headline-slot" className={cn(SLOT, SLOT_STYLES, 'h-5 w-4/5')}>
              your company
            </span>
            <p
              data-wire="headline"
              className={cn(
                ANSWER,
                'text-[11px] leading-tight font-semibold tracking-tight text-balance',
              )}
            >
              {company}
            </p>
          </div>

          {/* The sentence carries the page alone in full ink until the name lands, then steps
              back; the timeline does that with opacity, so the finished sketch starts there. */}
          <div data-part="paragraph" className={cn(STACK, 'items-start')}>
            <span data-wire="paragraph-slot" className={cn(SLOT, SLOT_STYLES, 'h-7 w-full')}>
              your words
            </span>
            <p
              data-wire="paragraph"
              className={cn(ANSWER, 'line-clamp-2 leading-snug text-(--sketch-fg) opacity-72')}
            >
              <span data-wire="typed">{description}</span>
              <span
                data-wire="caret"
                className={cn(
                  BETWEEN,
                  'ml-px inline-block h-[0.9em] w-px translate-y-[0.1em] bg-current',
                )}
              />
            </p>
          </div>

          <span
            data-part="cta"
            className="relative w-fit rounded-full bg-on-surface-muted px-2 py-0.5 text-[7px] font-medium text-on-brand"
          >
            <span
              data-wire="colour"
              className={cn(ANSWER, 'absolute inset-0 rounded-full bg-(--sketch-strong)')}
            />
            <span className={cn(STACK, 'relative')}>
              <span data-wire="cta-label-slot" className={cn(SLOT, 'whitespace-nowrap')}>
                {WIRE_COPY.ctaBefore}
              </span>
              <span data-wire="cta-label" className={cn(ANSWER, 'whitespace-nowrap')}>
                {WIRE_COPY.ctaAfter}
              </span>
            </span>
          </span>

          <div
            data-part="image"
            className={cn(
              HATCH,
              'relative aspect-4/3 overflow-hidden rounded-lg border border-(--sketch-line)',
            )}
          >
            <span
              data-wire="photo"
              style={{ backgroundImage: `url(${HERO_PHOTO})` }}
              className={cn(ANSWER, PHOTO, TREATMENT)}
            />
            <span
              data-part="image-label"
              data-wire="label-slot"
              className={cn(SLOT, 'absolute inset-0 flex items-center justify-center')}
            >
              <span className="rounded-full border border-(--sketch-line) bg-(--sketch-bg) px-2 py-0.5 text-[9px] text-(--sketch-muted)">
                your photos
              </span>
            </span>
            <span
              data-part="image-label"
              data-wire="label-style"
              className={cn(
                ANSWER,
                'absolute bottom-1.5 left-2 flex max-w-[90%] items-center gap-1 rounded-full bg-(--sketch-bg) px-1.5 py-0.5 text-[8px] text-(--sketch-muted)',
              )}
            >
              <span
                data-wire="colour"
                className={cn(ANSWER, 'size-1 shrink-0 rounded-full bg-(--sketch-strong)')}
              />
              <span className="truncate">{STYLE_LABEL}</span>
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {CARD_PHOTOS.map((photo) => (
              <span
                key={photo}
                data-part="card"
                className="flex items-center gap-2 rounded-md border border-(--sketch-line) p-1.5"
              >
                <span className="relative size-3 shrink-0 overflow-hidden rounded bg-surface-muted">
                  <span
                    data-wire="card-photo"
                    style={{ backgroundImage: `url(${photo})` }}
                    className={cn(ANSWER, PHOTO, TREATMENT)}
                  />
                  <span
                    data-wire="colour"
                    className={cn(
                      ANSWER,
                      'absolute inset-0 rounded ring-1 ring-(--sketch-strong)/60 ring-inset',
                    )}
                  />
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="block h-1 w-1/2 rounded-full bg-(--sketch-dash)" />
                  <Bar className="h-0.5 w-4/5" />
                </span>
              </span>
            ))}
          </div>

          <div
            data-part="footer"
            className="mt-auto flex items-center justify-between border-t border-(--sketch-line) pt-2 text-[6px] text-(--sketch-muted) tabular-nums"
          >
            <span className="flex items-center gap-1">
              <span>© {YEAR}</span>
              <span className={cn(STACK, 'items-center')}>
                <span
                  data-wire="footer-slot"
                  className={cn(SLOT, 'block h-1 w-8 rounded-full bg-(--sketch-line)')}
                />
                <span data-wire="footer-name" className={cn(ANSWER, 'whitespace-nowrap')}>
                  {company}
                </span>
              </span>
            </span>
            <Bar className="h-1 w-6" />
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}
