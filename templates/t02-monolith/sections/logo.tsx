import Image from 'next/image'
import type { MonolithContent } from '../copy-slots'

type Props = { brand: MonolithContent['brand'] }

// The brand as supplied, or its name in bold. The source set a panels icon beside the name,
// which said nothing of the business, so the name stands alone (decision 1, t02-L1). It may
// wrap, and break anywhere when one word is wider than its room, so it never runs past the
// screen or under the menu button. An image logo with less room than its 28px height asks for
// is drawn smaller inside it, at its own shape, never squeezed.
export function MonolithLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    const mark = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-7 w-auto object-contain"
      />
    )
    // On a page of its own shade it sits on the plate the page gives it (decision 23), which
    // reaches past the mark so the row keeps its height, and narrows with it.
    if (logo.plate === undefined) return mark
    return (
      <span
        className="-mx-2 -my-1 flex min-w-0 rounded-md px-2 py-1"
        style={{ backgroundColor: logo.plate }}
      >
        {mark}
      </span>
    )
  }
  return <span className="min-w-0 wrap-anywhere">{name}</span>
}
