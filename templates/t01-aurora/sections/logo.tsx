import Image from 'next/image'
import type { AuroraContent } from '../copy-slots'

type Props = { brand: AuroraContent['brand'] }

// The brand as supplied, or its name in the display face behind a point of the template's own
// light. Never a raw colour: the point is the two glow tokens, so a brand's set recolours it.
// Either gives way to the room it is given: the name wraps, breaking a word only when the word
// alone is wider than the room, and a logo narrows at its own shape.
export function AuroraLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    const mark = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-7 w-auto max-w-full object-contain object-left"
      />
    )
    // On a page of its own shade it sits on the plate the page gives it (decision 23), which
    // reaches past the mark so the row keeps its height.
    if (logo.plate === undefined) return mark
    return (
      <span
        className="-mx-2 -my-1 inline-flex rounded-md px-2 py-1"
        style={{ backgroundColor: logo.plate }}
      >
        {mark}
      </span>
    )
  }
  return (
    <span className="inline-flex max-w-full items-center gap-2 font-display text-lg font-semibold tracking-tight">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-full bg-linear-to-br from-glow to-glow-secondary"
      />
      <span className="min-w-0 wrap-anywhere">{name}</span>
    </span>
  )
}
