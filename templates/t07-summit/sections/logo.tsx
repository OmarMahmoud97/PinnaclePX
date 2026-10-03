import Image from 'next/image'
import type { SummitContent } from '../copy-slots'

type Props = { brand: SummitContent['brand'] }

// The brand as supplied, at the 35px height of the source's logo so the bar keeps its height,
// or the name at the same height.
export function SummitLogo({ brand }: Props) {
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
    <span className="inline-flex h-[35px] items-center text-2xl font-semibold tracking-tight text-on-surface/85">
      {name}
    </span>
  )
}
