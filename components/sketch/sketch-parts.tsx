import { Bar } from '@/components/sketch/phone-frame'
import type { SketchModel } from '@/components/sketch/sketch-model'
import type { VisualStyle } from '@/lib/brief/styles'
import { cn } from '@/lib/cn'

// The phone frame (phone-sketch.tsx) draws these parts. Parts carry a data-part name
// so the hero's build can pair each with its counterpart on the finished page.

// Each style as a treatment on the visitor's own photo. Exported for the walkthrough's
// frame, which draws its photographs itself (app/_components/walkthrough-frame.tsx).
export const PHOTO_STYLE: Readonly<Record<VisualStyle, string>> = {
  warm: 'sepia-30 saturate-125',
  minimal: 'saturate-75',
  bold: 'saturate-150 contrast-125',
  dark: 'brightness-90 contrast-110',
}

// A wireframer's hatch for an image nobody has chosen yet.
export const HATCH =
  'bg-(--sketch-bg-muted) bg-[repeating-linear-gradient(135deg,var(--sketch-line)_0_1px,transparent_1px_9px)]'

// A dashed slot's look, shared with the walkthrough's frame.
export const SLOT_STYLES =
  'flex items-center rounded-md border border-dashed border-(--sketch-dash) px-2 text-[9px] tracking-wide text-(--sketch-muted)'

type SlotProps = { label: string; className: string; part: string }

// A dashed slot, labelled the way a wireframe labels what goes there: an answer not given yet.
function Slot({ label, className, part }: SlotProps) {
  return (
    <span data-part={part} className={cn(SLOT_STYLES, className)}>
      {label}
    </span>
  )
}

const MARK = 'size-3.5'
const POINT = 'size-1.5'

// The logo slot: the uploaded logo; else, once the company is known, a point of their colour
// beside the name, the sketch's stand-in for a mark (grey until the colour question), since each
// design sets a name without a logo in its own way; else a dashed square.
function Mark({ model }: { model: SketchModel }) {
  if (model.logo !== null) {
    return (
      <span
        style={{ backgroundImage: `url(${model.logo})` }}
        className={`rounded bg-contain bg-center bg-no-repeat ${MARK}`}
      />
    )
  }
  if (model.company === '') {
    return <span className={`rounded border border-dashed border-(--sketch-dash) ${MARK}`} />
  }
  return (
    <span className={`flex items-center justify-center ${MARK}`}>
      <span
        className={`rounded-full bg-(--sketch-strong) transition-colors duration-400 ${POINT}`}
      />
    </span>
  )
}

const WORDMARK = { row: 'gap-1', bar: 'h-1.5 w-10', name: 'max-w-16 truncate' }

// The mark beside the company name, or a bar until the name is known. Keyed so a new logo or
// name rises in.
export function Wordmark({ model }: { model: SketchModel }) {
  return (
    <span
      key={model.logo ?? model.company}
      data-part="wordmark"
      className={cn('flex animate-sketch-in items-center', WORDMARK.row)}
    >
      <Mark model={model} />
      {model.company === '' ? (
        <Bar className={WORDMARK.bar} />
      ) : (
        <span className={cn('font-semibold tracking-tight', WORDMARK.name)}>{model.company}</span>
      )}
    </span>
  )
}

const HEADLINE = { slot: 'h-5 w-4/5', text: 'text-[11px]' }

// The company name is the headline once it is known.
export function Headline({ model }: { model: SketchModel }) {
  if (model.company === '') {
    return <Slot label="your company" part="headline" className={HEADLINE.slot} />
  }
  return (
    <p
      data-part="headline"
      className={cn(
        'animate-sketch-in leading-tight font-semibold tracking-tight text-balance',
        HEADLINE.text,
      )}
    >
      {model.company}
    </p>
  )
}

const PARAGRAPH = { slot: 'h-7 w-full', text: 'line-clamp-2' }

// Their sentence, clamped. It carries the hero alone in full ink until the headline lands, then
// steps back to muted.
export function Paragraph({ model }: { model: SketchModel }) {
  if (model.description === '') {
    return <Slot label="your words" part="paragraph" className={PARAGRAPH.slot} />
  }
  return (
    <p
      data-part="paragraph"
      className={cn(
        'animate-sketch-in leading-snug transition-colors duration-400',
        model.company === '' ? 'text-(--sketch-fg)' : 'text-(--sketch-muted)',
        PARAGRAPH.text,
      )}
    >
      {model.description}
    </p>
  )
}

const CTA = 'px-2 py-0.5 text-[7px]'

// The hero's button, in the chosen colour once there is one.
export function CtaPill({ model }: { model: SketchModel }) {
  return (
    <span
      data-part="cta"
      className={cn(
        'w-fit rounded-full bg-(--sketch-strong) font-medium text-(--sketch-on-strong) transition-colors duration-400',
        CTA,
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

// The hero image: the first photo if there is one, else a hatch.
export function ImageBlock({ model, className }: { model: SketchModel; className: string }) {
  const photo = model.photos[0]
  const fill = photo !== undefined ? null : HATCH
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
            className="rounded-full border border-(--sketch-line) bg-(--sketch-bg) px-2 py-0.5 text-[9px] text-(--sketch-muted)"
          >
            your photos
          </span>
        </span>
      ) : (
        <span
          data-part="image-label"
          className="absolute bottom-1.5 left-2 max-w-[90%] truncate rounded-full bg-(--sketch-bg) px-1.5 py-0.5 text-[8px] text-(--sketch-muted)"
        >
          {model.imageLabel}
        </span>
      )}
    </div>
  )
}
