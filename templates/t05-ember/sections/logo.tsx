import Image from 'next/image'
import type { EmberContent } from '../copy-slots'

type Props = { brand: EmberContent['brand'] }

// The brand as supplied, at the 35px height of the source's logo so the header keeps its
// height, or the name set in the display face at the same height.
export function EmberLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-[35px] w-auto"
      />
    )
  }
  return (
    <span className="inline-flex h-[35px] items-center font-display text-2xl font-semibold">
      {name}
    </span>
  )
}
