import Image from 'next/image'
import type { HarborContent } from '../copy-slots'

type Props = { brand: HarborContent['brand'] }

// The brand as supplied, at the 34px height of the source's logo, or the name in black
// capitals of the display face at the same height.
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
    <span className="inline-flex h-8.5 items-center font-display text-2xl font-black tracking-tight uppercase">
      {name}
    </span>
  )
}
