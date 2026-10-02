import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'

type Props = { brand: MonolithContent['brand'] }

// The brand as supplied, or its name in bold. The source set a panels icon beside the name,
// which said nothing of the business, so the name stands alone (decision 1, t02-L1). It may
// wrap, and break anywhere when one word is wider than its room, so it never runs past the
// screen or under the menu button.
export function MonolithLogo({ brand }: Props) {
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
  return <span className="min-w-0 wrap-anywhere">{name}</span>
}
