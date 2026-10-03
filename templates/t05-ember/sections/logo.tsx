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
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-[35px] w-auto"
      />
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
