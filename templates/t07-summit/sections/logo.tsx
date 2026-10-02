import Image from 'next/image'
import type { SummitContent } from '../copy-slots'

type Props = { brand: SummitContent['brand']; onPicture?: boolean }

// The brand as supplied, at the 35px height of the source's logo so the bar keeps its height,
// or the name at the same height. Over the hero's photograph (the bar at the top, onPicture) the
// name is on-scrim on the hero's veil, and a supplied logo sits on a chip of the surface drawn
// into the space around it, so nothing moves, since its artwork may be as dark as the veil.
export function SummitLogo({ brand, onPicture = false }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <span
        className={`-mx-1.5 -my-1 block rounded-sm px-1.5 py-1 ${onPicture ? 'bg-surface' : ''}`}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="h-[35px] w-auto"
        />
      </span>
    )
  }
  return (
    <span
      className={`inline-flex h-[35px] items-center text-2xl font-semibold tracking-tight ${onPicture ? 'text-on-scrim' : 'text-on-surface/85'}`}
    >
      {name}
    </span>
  )
}
