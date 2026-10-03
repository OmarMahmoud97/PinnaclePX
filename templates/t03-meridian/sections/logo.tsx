import { ChevronsDown } from 'lucide-react'
import Image from 'next/image'
import type { MeridianContent } from '../copy-slots'

type Props = { brand: MeridianContent['brand']; size?: 'header' | 'footer' }

// The brand as supplied, or the source's mark and name: a chevrons icon on a rounded square
// filled with the brand gradient, beside the name in bold. The footer sets the name larger. A
// name wraps between its words, and one with nowhere to break breaks anywhere, so it never
// pushes the menu button off a phone's screen; an image logo narrowed so keeps its shape.
export function MeridianLogo({ brand, size = 'header' }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-9 w-auto min-w-0 object-contain object-left"
      />
    )
  }
  const anywhere = /\s/.test(name.trim()) ? '' : 'wrap-anywhere'
  return (
    <>
      <ChevronsDown className="mr-2 h-9 w-9 shrink-0 rounded-lg border border-surface-muted bg-linear-to-tr from-brand-deeper via-brand-deeper/70 to-brand-deeper text-on-brand" />
      {size === 'footer' ? (
        <span className={`text-2xl ${anywhere}`}>{name}</span>
      ) : (
        <span className={anywhere === '' ? undefined : anywhere}>{name}</span>
      )}
    </>
  )
}
