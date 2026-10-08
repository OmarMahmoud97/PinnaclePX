import Image from 'next/image'
import type { VectorContent } from '../copy-slots'
import { fitName } from '../fit'

type Props = { brand: VectorContent['brand'] }

// The brand as supplied, at the height of the source's wordmark line, or the name in the body
// face as the source set its own. A logo wider than its pill is scaled down whole, never
// squeezed; a name wider than its pill wraps, centred, between its words onto a second line, or
// a third on the narrowest phones, at the size that keeps them whole (fit.ts; vector.css,
// .vector-name). A name of one word too long to keep whole breaks wherever it must, and past
// three lines ends in an ellipsis.
export function VectorLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-6 w-auto max-w-full object-contain sm:h-7"
      />
    )
  }
  return (
    <span
      className="vector-name line-clamp-3 text-center tracking-tight wrap-anywhere"
      style={fitName(name)}
    >
      {name}
    </span>
  )
}
