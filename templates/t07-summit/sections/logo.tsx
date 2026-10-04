import Image from 'next/image'
import type { SummitContent } from '../copy-slots'

type Props = { brand: SummitContent['brand'] }

// The brand as supplied, at the 35px height of the source's logo so the bar keeps its height,
// or the name at the same height. Short of room, as in the bar beside a phone's toggle or the
// row of links at 768, an image is drawn smaller inside its box at its own shape, and the name
// wraps, between letters when it has no space to wrap at, rather than push the toggle off the
// screen or under the links.
export function SummitLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    const mark = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-[35px] w-auto max-w-full object-contain object-left"
      />
    )
    // On a page of its own shade it sits on the plate the page gives it (decision 23), which
    // reaches past the mark so the bar keeps its height. It reaches down, never up: the footer
    // starts at the logo's top and hides what lies above it.
    if (logo.plate === undefined) return mark
    return (
      <span
        className="-mx-2 -mb-2 inline-flex rounded-md px-2 py-1"
        style={{ backgroundColor: logo.plate }}
      >
        {mark}
      </span>
    )
  }
  return (
    <span className="inline-flex min-h-[35px] items-center text-2xl font-semibold tracking-tight wrap-anywhere text-on-surface/85">
      {name}
    </span>
  )
}
