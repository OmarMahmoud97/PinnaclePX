import Image from 'next/image'
import type { VectorContent } from '../copy-slots'

type Props = { brand: VectorContent['brand'] }

// The brand as supplied, at the height of the source's wordmark line, or the name in the body
// face as the source set its own.
export function VectorLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-6 w-auto sm:h-7"
      />
    )
  }
  return <span>{name}</span>
}
