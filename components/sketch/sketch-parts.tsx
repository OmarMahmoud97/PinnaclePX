import type { SketchModel } from '@/components/sketch/sketch-model'
import type { VisualStyle } from '@/lib/brief/styles'
import { cn } from '@/lib/cn'

// The browser frame and the phone frame draw the same parts at two sizes. Each part keeps its
// two sizes in a table so a change to the part reaches both frames. Parts carry a data-part name
// so the hero's build can pair each with its counterpart on the finished page.
type Frame = 'browser' | 'phone'

type FrameProps = { model: SketchModel; frame: Frame }

// Image-block treatments per style when there is no photo. Literal classes so Tailwind can see
// them.
const IMAGE_STYLE: Readonly<Record<VisualStyle, string>> = {
  warm: 'bg-linear-to-br from-warning/60 via-danger/30 to-warning/20',
  minimal: 'bg-linear-to-br from-surface-muted to-border',
  bold: 'bg-linear-to-br from-(--sketch-strong) to-on-surface',
  dark: 'bg-linear-to-br from-on-surface-muted/70 to-scrim',
}

// The same styles as a treatment on the visitor's own photo.
const PHOTO_STYLE: Readonly<Record<VisualStyle, string>> = {
  warm: 'sepia-30 saturate-125',
  minimal: 'saturate-75',
  bold: 'saturate-150 contrast-125',
  dark: 'brightness-90 contrast-110',
}

// A wireframer's hatch for an image nobody has chosen yet.
const HATCH =
  'bg-(--sketch-bg-muted) bg-[repeating-linear-gradient(135deg,var(--sketch-line)_0_1px,transparent_1px_9px)]'

type BarProps = { className: string; part?: string | undefined }

// A grey bar: copy we will write later.
export function Bar({ className, part }: BarProps) {
  return (
    <span data-part={part} className={cn('block rounded-full bg-(--sketch-line)', className)} />
  )
}

type SlotProps = { label: string; className: string; part: string }

// A dashed slot, labelled the way a wireframe labels what goes there: an answer not given yet.
function Slot({ label, className, part }: SlotProps) {
  return (
    <span
      data-part={part}
      className={cn(
        'flex items-center rounded-md border border-dashed border-(--sketch-dash) px-2 font-mono text-[9px] tracking-wide text-(--sketch-muted)',
        className,
      )}
    >
      {label}
    </span>
  )
}

const MARK = { browser: 'size-5 text-[8px]', phone: 'size-3.5 text-[6px]' }

// The logo slot: the uploaded logo, else initials once the company is known, else a dashed square.
function Mark({ model, frame }: FrameProps) {
  if (model.logo !== null) {
    return (
      <span
        style={{ backgroundImage: `url(${model.logo})` }}
        className={cn('rounded bg-contain bg-center bg-no-repeat', MARK[frame])}
      />
    )
  }
  if (model.initials === '') {
    return (
      <span className={cn('rounded border border-dashed border-(--sketch-dash)', MARK[frame])} />
    )
  }
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded bg-(--sketch-strong) font-semibold text-(--sketch-on-strong) transition-colors duration-400',
        MARK[frame],
      )}
    >
      {model.initials}
    </span>
  )
}

const WORDMARK = {
  browser: { row: 'gap-2', bar: 'h-2 w-16', name: 'text-xs sm:text-sm' },
  phone: { row: 'gap-1', bar: 'h-1.5 w-10', name: 'max-w-16 truncate' },
}

// The mark beside the company name, or a bar until the name is known. Keyed so a new logo or
// name rises in.
export function Wordmark({ model, frame }: FrameProps) {
  const size = WORDMARK[frame]
  return (
    <span
      key={model.logo ?? model.company}
      data-part="wordmark"
      className={cn('flex animate-sketch-in items-center', size.row)}
    >
      <Mark model={model} frame={frame} />
      {model.company === '' ? (
        <Bar className={size.bar} />
      ) : (
        <span className={cn('font-semibold tracking-tight', size.name)}>{model.company}</span>
      )}
    </span>
  )
}

const HEADLINE = {
  browser: { slot: 'h-8 w-4/5', text: 'text-xl sm:text-2xl' },
  phone: { slot: 'h-5 w-4/5', text: 'text-[11px]' },
}

// The company name is the headline once it is known.
export function Headline({ model, frame }: FrameProps) {
  const size = HEADLINE[frame]
  if (model.company === '') {
    return <Slot label="your company" part="headline" className={size.slot} />
  }
  return (
    <p
      data-part="headline"
      className={cn(
        'animate-sketch-in leading-tight font-semibold tracking-tight text-balance',
        size.text,
      )}
    >
      {model.company}
    </p>
  )
}

const PARAGRAPH = {
  browser: { slot: 'h-12 w-full', text: 'line-clamp-3 text-pretty' },
  phone: { slot: 'h-7 w-full', text: 'line-clamp-2' },
}

// Their sentence, clamped. It carries the hero alone in full ink until the headline lands, then
// steps back to muted.
export function Paragraph({ model, frame }: FrameProps) {
  const size = PARAGRAPH[frame]
  if (model.description === '') {
    return <Slot label="your words" part="paragraph" className={size.slot} />
  }
  return (
    <p
      data-part="paragraph"
      className={cn(
        'animate-sketch-in leading-snug transition-colors duration-400',
        model.company === '' ? 'text-(--sketch-fg)' : 'text-(--sketch-muted)',
        size.text,
      )}
    >
      {model.description}
    </p>
  )
}

const CTA = { browser: 'mt-1 px-3 py-1.5 text-[10px]', phone: 'px-2 py-0.5 text-[7px]' }

// The hero's button, in the chosen colour once there is one.
export function CtaPill({ model, frame }: FrameProps) {
  return (
    <span
      data-part="cta"
      className={cn(
        'w-fit rounded-full bg-(--sketch-strong) font-medium text-(--sketch-on-strong) transition-colors duration-400',
        CTA[frame],
      )}
    >
      {model.company === '' ? 'Get in touch' : 'Book with us'}
    </span>
  )
}

type PhotoFillProps = { url: string; style: VisualStyle | null; className: string }

// One of the visitor's photos, with the chosen style applied as a treatment.
export function PhotoFill({ url, style, className }: PhotoFillProps) {
  return (
    <span
      style={{ backgroundImage: `url(${url})` }}
      className={cn(
        'block bg-cover bg-center',
        style === null ? null : PHOTO_STYLE[style],
        className,
      )}
    />
  )
}

// The hero image: the first photo if there is one, else the chosen style, else a hatch.
export function ImageBlock({ model, className }: { model: SketchModel; className: string }) {
  const photo = model.photos[0]
  const fill =
    photo !== undefined ? null : model.imageStyle !== null ? IMAGE_STYLE[model.imageStyle] : HATCH
  return (
    <div
      key={`${model.imageLabel ?? ''}:${photo ?? ''}`}
      data-part="image"
      className={cn(
        'relative animate-sketch-in overflow-hidden rounded-lg border border-(--sketch-line) transition-colors duration-400',
        fill,
        className,
      )}
    >
      {photo !== undefined && (
        <PhotoFill url={photo} style={model.imageStyle} className="absolute inset-0" />
      )}
      {model.imageLabel === null ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            data-part="image-label"
            className="rounded-full border border-(--sketch-line) bg-(--sketch-bg) px-2 py-0.5 font-mono text-[9px] text-(--sketch-muted)"
          >
            your photos
          </span>
        </span>
      ) : (
        <span
          data-part="image-label"
          className="absolute bottom-1.5 left-2 max-w-[90%] truncate rounded-full bg-(--sketch-bg) px-1.5 py-0.5 font-mono text-[8px] text-(--sketch-muted)"
        >
          {model.imageLabel}
        </span>
      )}
    </div>
  )
}
