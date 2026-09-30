import Image from 'next/image'
import type { InegroContent } from '../copy-slots'

type Props = { brand: InegroContent['brand']; sizes?: string }

// The brand as supplied, at the width of the source's logo, or the name in the display face as
// the source's own wordmark was set.
export function InegroLogo({ brand, sizes = '209px' }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} sizes={sizes} />
    )
  }
  return <span className="inegro-wordmark">{name}</span>
}
