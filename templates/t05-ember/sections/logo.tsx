import Image from 'next/image'
import type { EmberContent } from '../copy-slots'
import { fitWord } from '../word-fit'

type Props = { brand: EmberContent['brand'] }

// The brand as supplied, at the 35px height of the source's logo so the header keeps its
// height, or the name set in the display face at the same height. The name is sized by its
// longest word (ember.css, .ember-fit-name), so a name with no space stays beside the menu button
// on a phone, and inside the footer.
export function EmberLogo({ brand }: Props) {
  const { logo, name } = brand
  if (logo.kind === 'image') {
    const mark = (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-[35px] w-auto"
      />
    )
    // On a page of its own shade it sits on the plate the page gives it (decision 23), which
    // reaches past the mark so the bar keeps its height.
    if (logo.plate === undefined) return mark
    return (
      <span
        className="-mx-2 -my-1 inline-flex rounded-md px-2 py-1"
        style={{ backgroundColor: logo.plate }}
      >
        {mark}
      </span>
    )
  }
  return (
    <span className="inline-flex h-[35px] items-center font-display text-2xl font-semibold">
      <span className="ember-fit-name" style={fitWord(name, 'display')}>
        {name}
      </span>
    </span>
  )
}
