import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'
import { LogoIcon } from './icons'

type Props = { brand: MonolithContent['brand'] }

// The brand as supplied, or the source's mark and name: a panels icon in the text colour beside
// the name in bold.
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
      {name}
    </>
  )
}
