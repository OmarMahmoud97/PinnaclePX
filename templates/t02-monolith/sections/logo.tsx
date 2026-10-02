import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'
import { LogoIcon } from './icons'

type Props = { brand: MonolithContent['brand'] }

// The brand as supplied, or the source's mark and name: a panels icon in the text colour beside
// the name in bold. The name may wrap, and break anywhere when one word is wider than its room,
// so it never runs past the screen or under the menu button.
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
  return (
    <>
      <LogoIcon />
      <span className="min-w-0 wrap-anywhere">{name}</span>
    </>
  )
}
