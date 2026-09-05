import Image from 'next/image'
import type { MeridianImage } from '../copy-slots'

type Props = { image: MeridianImage | null; name: string }

// The source's Avatar: a 40px circle holding a picture, or the initials on the muted surface
// when there is none.
export function Avatar({ image, name }: Props) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
  return (
    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      {image === null ? (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-surface-muted text-sm font-semibold">
          {initials}
        </span>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="40px"
          className="aspect-square h-full w-full object-cover"
        />
      )}
    </span>
  )
}
