import Image from 'next/image'
import type { AuroraContent } from '../copy-slots'

type Props = { brand: AuroraContent['brand'] }

// The brand as supplied, or its name in the display face behind a point of the template's own
// light. Never a raw colour: the point is the two glow tokens, so a brand's set recolours it.
export function AuroraLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-7 w-auto"
      />
    )
  }
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
      <span
        aria-hidden="true"
        className="size-2.5 rounded-full bg-linear-to-br from-glow to-glow-secondary"
      />
      {name}
    </span>
  )
}
