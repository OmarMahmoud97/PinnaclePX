'use client'

import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  type LucideIcon,
  Menu,
  PawPrint,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { type CSSProperties, Fragment, memo, useEffect } from 'react'
import { BUILT_COPY, type FeatureIcon } from '@/app/_components/built-copy'
import { builtSans, builtScript } from '@/app/_components/built-fonts'
import { EXAMPLE_FILES } from '@/app/_components/photos'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { PhotoFill } from '@/components/sketch/sketch-parts'
import { EXAMPLE_ANSWERS, FINAL_STAGE } from '@/lib/brief/example-brief'
import { brandHexFrom, builtTintsFrom } from '@/lib/brief/sketch'
import { cn } from '@/lib/cn'
import { AppError } from '@/lib/errors'

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

// The finished page only ever shows the example brief complete, whatever the sketch above it is
// drawing at the time, so its words and colours are fixed at load.
const FINISHED = sketchModelFrom(EXAMPLE_ANSWERS, FINAL_STAGE, EXAMPLE_FILES)

// The example brief is checked once at load; a missing colour or photo is a programmer error.
function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) {
    throw new AppError(`The example brief needs ${what} to build a page.`)
  }
  return value
}

const HEX = required(brandHexFrom(EXAMPLE_ANSWERS.colours), 'a valid colour')
const PHOTO = required(EXAMPLE_FILES.photos[0], 'a photo')
const TINTS = builtTintsFrom(HEX)
const VARS = {
  ...FINISHED.vars,
  '--built-bg': TINTS.bg,
  '--built-ink': TINTS.ink,
  '--built-muted': TINTS.muted,
  '--built-accent': TINTS.accent,
  '--built-footer': TINTS.footer,
} as CSSProperties

const ICONS: Readonly<Record<FeatureIcon, LucideIcon>> = {
  shield: ShieldCheck,
  stethoscope: Stethoscope,
  clipboard: ClipboardCheck,
}

// Every part starts hidden; the build reveals each as it arrives and clears the inline styles at
// the reset, which returns them here.
const HIDDEN = 'invisible opacity-0'
const PILL =
  'flex items-center rounded-md bg-(--sketch-strong) font-bold tracking-wider text-(--sketch-on-strong) uppercase'
const ARROW =
  'absolute flex items-center justify-center rounded-full border border-(--built-accent)/70 text-(--sketch-on-strong)'

// The two frames draw the same page at two sizes; each part keeps both in this table.
const SIZE = {
  // The browser frame exists only from lg, and its page area is the sketch's height, so the
  // finished page must fit that height at every width from 1024 px up. Below xl the frame is
  // narrower and the headline would wrap to four lines, so the type steps down a size there.
  browser: {
    page: 'gap-5 p-5',
    wordmark: 'gap-1.5 text-sm',
    mark: 'size-4',
    nav: 'gap-3 text-[10px]',
    navCta: 'gap-1 px-2.5 py-1 text-[8px]',
    arrow: 'bottom-2 size-5',
    arrowIcon: 'size-2.5',
    eyebrow: 'text-[9px] xl:text-[10px]',
    headline: 'text-[18px] xl:text-[23px]',
    // The phone over the browser's corner covers the last 64 px of this column below the headline.
    paragraph: 'line-clamp-3 pr-16 text-[9px] xl:text-[10px]',
    cta: 'mt-1 gap-1.5 px-3 py-1.5 text-[9px]',
    cards: 'grid grid-cols-3 gap-3',
    card: 'flex-col gap-2 rounded-lg p-2.5',
    cardIcon: 'size-4',
    cardTitle: 'text-[10px]',
    cardLine: 'line-clamp-1 text-[8px] leading-tight text-(--built-muted)',
    footer: 'px-5 py-2.5 text-[9px]',
  },
  phone: {
    page: 'gap-2.5 px-3 pt-1 pb-3',
    wordmark: 'gap-1 text-[8px]',
    mark: 'size-3',
    nav: '',
    navCta: '',
    arrow: 'bottom-1 size-3',
    arrowIcon: 'size-1.5',
    eyebrow: 'text-[7px]',
    headline: 'text-[11px]',
    paragraph: 'line-clamp-2 text-[7px]',
    cta: 'gap-1 px-2 py-0.5 text-[6px]',
    cards: 'flex flex-col gap-1.5',
    card: 'items-center gap-2 rounded-md p-1.5',
    cardIcon: 'size-3',
    cardTitle: 'text-[7px]',
    // Too small for words: the phone's cards keep a bar where the line of copy goes.
    cardLine: 'h-0.5 w-3/5 rounded-full bg-(--built-muted)/25',
    footer: 'pt-2 text-[6px]',
  },
} as const

type Props = {
  frame: 'browser' | 'phone'
  // Called once the page is in the DOM, so the loop can measure it.
  onReady?: (() => void) | undefined
}

// Each word in its own box, so the loop can raise them one after another; the spaces between
// stay real text, so the line still wraps and balances as it would unsplit.
function Words({ text }: { text: string }) {
  return text.split(' ').map((word, index) => (
    <Fragment key={`${String(index)}-${word}`}>
      {index > 0 ? ' ' : null}
      <span data-word="" className="inline-block">
        {word}
      </span>
    </Fragment>
  ))
}

function Photo({ size }: { size: (typeof SIZE)[keyof typeof SIZE] }) {
  return (
    <div data-part="image" className={cn(HIDDEN, 'relative z-10 aspect-4/3')}>
      <PhotoFill url={PHOTO} style={null} className="absolute inset-0 rounded-lg" />
      <span data-part="arrow" className={cn(HIDDEN, ARROW, 'left-2', size.arrow)}>
        <ArrowLeft className={size.arrowIcon} />
      </span>
      <span data-part="arrow" className={cn(HIDDEN, ARROW, 'right-2', size.arrow)}>
        <ArrowRight className={size.arrowIcon} />
      </span>
    </div>
  )
}

// The finished page the hero builds from the example brief: what the wireframe becomes. Laid
// under the sketch inside a frame and hidden until the build reveals it part by part. Each part
// carries the data-part name of its counterpart in the sketch; the parts with no counterpart
// (the third link, the arrows and the phone's kicker) rise in on their own. The phone page is
// image-led, photograph first, so on a phone the photograph travels up past the text the way it
// sweeps across on desktop. Memoised: its props never change, and the hero re-renders on every
// typed character and at every build.
export const BuiltPage = memo(function BuiltPage({ frame, onReady }: Props) {
  const size = SIZE[frame]

  useEffect(() => {
    onReady?.()
  }, [onReady])

  const eyebrow = (
    <span
      data-part="eyebrow"
      className={cn(
        HIDDEN,
        builtScript.className,
        'tracking-wide text-(--built-accent) uppercase',
        size.eyebrow,
      )}
    >
      {BUILT_COPY.eyebrow}
    </span>
  )
  const headline = (
    <p
      data-part="headline"
      className={cn(
        HIDDEN,
        'leading-[1.1] font-light text-balance text-(--built-ink)',
        size.headline,
      )}
    >
      <Words text={BUILT_COPY.headline} />
    </p>
  )
  const paragraph = (
    <p data-part="paragraph" className={cn(HIDDEN, 'leading-snug text-pretty', size.paragraph)}>
      {FINISHED.description}
    </p>
  )
  const cta = (
    <span data-part="cta" className={cn(HIDDEN, PILL, 'w-fit', size.cta)}>
      <ChevronRight className="size-2.5" />
      <span data-label="">{BUILT_COPY.cta}</span>
    </span>
  )

  return (
    <div
      data-layer="built"
      style={VARS}
      className={cn(builtSans.className, 'absolute inset-0 flex flex-col text-(--built-muted)')}
    >
      <div data-part="bg" className={cn(HIDDEN, 'absolute inset-0 bg-(--built-bg)')} />

      <div className={cn('relative flex flex-1 flex-col', size.page)}>
        <div className="flex items-center justify-between">
          <span
            data-part="wordmark"
            className={cn(
              HIDDEN,
              'flex items-center font-bold tracking-tight text-(--built-ink)',
              size.wordmark,
            )}
          >
            <PawPrint className={cn('text-(--sketch-strong)', size.mark)} />
            {FINISHED.company}
          </span>
          {frame === 'browser' ? (
            <span className={cn('flex items-center', size.nav)}>
              {BUILT_COPY.nav.map((label) => (
                <span key={label} data-part="nav-link" className={HIDDEN}>
                  {label}
                </span>
              ))}
              <span data-part="nav-cta" className={cn(HIDDEN, PILL, size.navCta)}>
                <ChevronRight className="size-2.5" />
                <span data-label="">{BUILT_COPY.cta}</span>
              </span>
            </span>
          ) : (
            <span data-part="menu" className={cn(HIDDEN, 'text-(--built-ink)')}>
              <Menu className="size-3" />
            </span>
          )}
        </div>

        {frame === 'browser' ? (
          <div className="grid grid-cols-[1.2fr_1fr] items-center gap-5">
            <Photo size={size} />
            <div className="flex flex-col gap-2.5">
              {eyebrow}
              {headline}
              {paragraph}
              {cta}
            </div>
          </div>
        ) : (
          <>
            <Photo size={size} />
            {eyebrow}
            {headline}
            {paragraph}
            {cta}
          </>
        )}

        <div className={size.cards}>
          {BUILT_COPY.features.map(({ icon, title, line }) => {
            const Icon = ICONS[icon]
            return (
              <span
                key={title}
                data-part="card"
                className={cn(HIDDEN, 'flex bg-surface shadow-badge', size.card)}
              >
                <Icon
                  data-icon=""
                  className={cn('shrink-0 text-(--sketch-strong)', size.cardIcon)}
                />
                <span className="flex flex-1 flex-col gap-1">
                  <span
                    data-title=""
                    className={cn('font-semibold text-(--built-ink)', size.cardTitle)}
                  >
                    {title}
                  </span>
                  {frame === 'browser' ? (
                    <span className={size.cardLine}>{line}</span>
                  ) : (
                    <span className={size.cardLine} />
                  )}
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
          'relative flex items-center justify-between bg-(--built-footer) font-mono text-surface/80',
          size.footer,
        )}
      >
        <span>
          © {YEAR} {FINISHED.company}
        </span>
        <span className="flex gap-3">
          {BUILT_COPY.footer.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </span>
      </div>
    </div>
  )
})
