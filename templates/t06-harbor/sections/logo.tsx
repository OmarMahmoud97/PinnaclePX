import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { fitWord } from '../fit'

type Props = { brand: HarborContent['brand'] }

// The brand as supplied, at the 34px height of the source's logo, or the name in black
// capitals of the display face at the same height. A long name wraps, its box growing with it,
// and its size is the smaller of text-2xl and what lets its longest word fit the nearest
// @container less the bar's toggle and 1.5rem of room beside it (fit.ts), so no word of it is
// cut off or broken.
export function HarborLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    const mark = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-8.5 w-auto"
      />
    )
    // On a page of its own shade it sits on the plate the page gives it (decision 23), which
    // reaches past the mark so the bar keeps its height.
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
    <span
      className="inline-flex min-h-8.5 items-center font-display text-[length:min(1.5rem,(100cqi_-_3.5rem)*0.97/var(--harbor-word,1))] leading-[1.333] font-black tracking-tight uppercase"
      style={fitWord([name])}
    >
      {name}
    </span>
  )
}
