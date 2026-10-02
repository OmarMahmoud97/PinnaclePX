import Image from 'next/image'
import type { VectorContent } from '../copy-slots'

type Props = { brand: VectorContent['brand'] }

// The brand as supplied, at the height of the source's wordmark line, or the name in the body
// face as the source set its own. A logo wider than its pill is scaled down whole, never
// squeezed; a name wider than its pill wraps, centred, onto a second line, a word with no
// break in it wherever it must, and past two lines ends in an ellipsis.
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
  return <span className="line-clamp-2 text-center wrap-anywhere">{name}</span>
}
