import Image from 'next/image'
import type { AtlasContent } from '../copy-slots'

type Props = { brand: AtlasContent['brand']; where: 'header' | 'footer' }

// The brand as supplied, or the source's mark and name: a rounded square filled with the blue
// gradient carrying the first letter, beside the name. The source's logo file was 130 by 52;
// the header shows it at 96px wide (112 from xl) and the footer at 96.
export function AtlasLogo({ brand, where }: Props) {
  const { logo, name } = brand
  const size = where === 'header' ? 'w-24 xl:w-28' : 'w-24'
  if (logo.kind === 'image') {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className={`${size} h-auto ${where === 'footer' ? '-mt-2' : ''}`}
      />
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold text-on-surface ${where === 'footer' ? '-mt-2' : ''}`}
    >
      <span
        aria-hidden="true"
        className="atlas-blue-gradient flex h-9 w-9 items-center justify-center rounded-[5.885px] text-lg font-bold text-on-brand"
      >
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="text-xl">{name}</span>
    </span>
  )
}
