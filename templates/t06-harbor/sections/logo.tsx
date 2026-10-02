import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { fitWord } from '../fit'

type Props = { brand: HarborContent['brand'] }

// The brand as supplied, at the 34px height of the source's logo, or the name in black
// capitals of the display face at the same height. A long name wraps, its box growing with it,
// and its size is the smaller of text-2xl and what lets its longest word fit the nearest
// @container less the bar's toggle and gap (fit.ts), so no word of it is cut off or broken.
export function HarborLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-8.5 w-auto"
      />
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
