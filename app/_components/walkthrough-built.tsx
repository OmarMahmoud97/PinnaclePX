'use client'

import { ChevronRight, Leaf, type LucideIcon, Menu, PencilRuler, Sprout, Sun } from 'lucide-react'
import { type CSSProperties, memo, useEffect } from 'react'
import { builtSans } from '@/app/_components/built-fonts'
import {
  WALKTHROUGH_ACCENT,
  WALKTHROUGH_ANSWERS,
  WALKTHROUGH_COPY,
  type WalkthroughIcon,
} from '@/app/_components/walkthrough-brand'
import { walkthroughSerif } from '@/app/_components/walkthrough-fonts'
import { WALKTHROUGH_FILES } from '@/app/_components/walkthrough-photos'
import { Words } from '@/app/_components/words'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { PhotoFill } from '@/components/sketch/sketch-parts'
import { FINAL_STAGE } from '@/lib/brief/example-brief'
import { brandHexFrom, builtTintsFrom } from '@/lib/brief/sketch'
import { cn } from '@/lib/cn'
import { AppError } from '@/lib/errors'

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

// The finished page only ever shows the brand complete, whatever the sketch above it is drawing
// at the time, so its words and colours are fixed at load.
const FINISHED = sketchModelFrom(WALKTHROUGH_ANSWERS, FINAL_STAGE, WALKTHROUGH_FILES)

// The brand is checked once at load; a missing colour or photo is a programmer error.
function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) {
    throw new AppError(`The example brand needs ${what} to build a page.`)
  }
  return value
}

const HEX = required(brandHexFrom(WALKTHROUGH_ANSWERS.colours), 'a valid colour')
const PHOTO = required(WALKTHROUGH_FILES.photos[0], 'a photo')
const TINTS = builtTintsFrom(HEX)
const VARS = {
  ...FINISHED.vars,
  '--built-bg': TINTS.bg,
  '--built-ink': TINTS.ink,
  '--built-muted': TINTS.muted,
  '--built-accent': WALKTHROUGH_ACCENT,
  '--built-footer': TINTS.footer,
} as CSSProperties

const ICONS: Readonly<Record<WalkthroughIcon, LucideIcon>> = {
  design: PencilRuler,
  planting: Sprout,
  aftercare: Sun,
}

// Every part starts hidden; the build reveals each as it arrives, and scrubbing back hides it
// again. Cleared inline styles return it here.
const HIDDEN = 'invisible opacity-0'

type Props = {
  // Called once the page is in the DOM, so the timeline can measure it.
  onReady?: (() => void) | undefined
}

// The finished page the walkthrough builds from the example brand's five answers: an
// illustration of a site, never anyone's. The same phone page the hero builds (built-page.tsx),
// image-led, with this brand's type and colours: a serif for the wordmark and headline, a
// terracotta kicker, the Forest green on the button, the mark and the footer. Laid under the
// sketch inside the frame and hidden until the build reveals it part by part; each part carries
// the data-part name of its counterpart in the sketch, and the kicker, which has none, rises in
// on its own. Memoised: its props never change and the track re-renders at every stop.
export const WalkthroughBuilt = memo(function WalkthroughBuilt({ onReady }: Props) {
  useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <div
      data-layer="built"
      style={VARS}
      className={cn(builtSans.className, 'absolute inset-0 flex flex-col text-(--built-muted)')}
    >
      <div data-part="bg" className={cn(HIDDEN, 'absolute inset-0 bg-(--built-bg)')} />

      <div className="relative flex flex-1 flex-col gap-2.5 px-3 pt-1 pb-3">
        <div className="flex items-center justify-between">
          <span
            data-part="wordmark"
            className={cn(
              HIDDEN,
              walkthroughSerif.className,
              'flex items-center gap-1 text-[9px] tracking-tight text-(--built-ink)',
            )}
          >
            <Leaf className="size-3 text-(--sketch-strong)" />
            {FINISHED.company}
          </span>
          <span data-part="menu" className={cn(HIDDEN, 'text-(--built-ink)')}>
            <Menu className="size-3" />
          </span>
        </div>

        <div data-part="image" className={cn(HIDDEN, 'relative z-10 aspect-4/3')}>
          <PhotoFill url={PHOTO} style={null} className="absolute inset-0 rounded-lg" />
        </div>
        <span
          data-part="eyebrow"
          className={cn(
            HIDDEN,
            'text-[6px] font-semibold tracking-[0.18em] text-(--built-accent) uppercase',
          )}
        >
          {WALKTHROUGH_COPY.eyebrow}
        </span>
        <p
          data-part="headline"
          className={cn(
            HIDDEN,
            walkthroughSerif.className,
            'text-[13px] leading-[1.15] text-balance text-(--built-ink)',
          )}
        >
          <Words text={WALKTHROUGH_COPY.headline} />
        </p>
        <p data-part="paragraph" className={cn(HIDDEN, 'line-clamp-2 text-[7px] leading-snug')}>
          {FINISHED.description}
        </p>
        <span
          data-part="cta"
          className={cn(
            HIDDEN,
            'flex w-fit items-center gap-1 rounded-full bg-(--sketch-strong) px-2 py-0.5 text-[6px] font-semibold text-(--sketch-on-strong)',
          )}
        >
          <ChevronRight className="size-2" />
          <span data-label="">{WALKTHROUGH_COPY.cta}</span>
        </span>

        <div className="flex flex-col gap-1.5">
          {WALKTHROUGH_COPY.features.map(({ icon, title }) => {
            const Icon = ICONS[icon]
            return (
              <span
                key={title}
                data-part="card"
                className={cn(
                  HIDDEN,
                  'flex items-center gap-2 rounded-md bg-surface p-1.5 shadow-badge',
                )}
              >
                <Icon data-icon="" className="size-3 shrink-0 text-(--sketch-strong)" />
                <span className="flex flex-1 flex-col gap-1">
                  <span data-title="" className="text-[7px] font-semibold text-(--built-ink)">
                    {title}
                  </span>
                  {/* Too small for words: the cards keep a bar where the line of copy goes. */}
                  <span className="h-0.5 w-3/5 rounded-full bg-(--built-muted)/25" />
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <div
        data-part="footer"
        className={cn(
          HIDDEN,
          'relative flex items-center justify-between bg-(--built-footer) px-3 py-1.5 font-mono text-[6px] text-surface/80',
        )}
      >
        <span>
          © {YEAR} {FINISHED.company}
        </span>
        <span className="flex gap-2">
          {WALKTHROUGH_COPY.footer.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </span>
      </div>
    </div>
  )
})
