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
    const plated = logo.plate !== undefined
    const mark = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className={`${size} h-auto ${where === 'footer' && !plated ? '-mt-2' : ''}`}
      />
    )
    // On a page of its own shade it sits on the plate the page gives it (decision 23), which
    // reaches past the mark so the row keeps its height, and takes the footer's lift from it.
    if (!plated) return mark
    return (
      <span
        className={`-mx-2 inline-flex rounded-md px-2 py-1 ${where === 'footer' ? '-mt-3 -mb-1' : '-my-1'}`}
        style={{ backgroundColor: logo.plate }}
      >
        {mark}
      </span>
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
