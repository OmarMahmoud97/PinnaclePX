import Image from 'next/image'
import type { MonolithImage } from '../copy-slots'

type Props = {
  image: MonolithImage | null
  name: string
  className?: string
  textClass?: string
}

// The source's Avatar: a 40px circle holding a picture, or the initials on the muted surface
// when there is none. The team cards pass a larger size and their own placement, absolute
// against the card, so the position is the caller's and not set here.
export function Avatar({
  image,
  name,
  className = 'relative h-10 w-10',
  textClass = 'text-sm',
}: Props) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
  return (
    <span className={`flex shrink-0 overflow-hidden rounded-full ${className}`}>
      {image === null ? (
        <span
          className={`flex h-full w-full items-center justify-center rounded-full bg-surface-muted font-semibold ${textClass}`}
        >
          {initials}
        </span>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="96px"
          className="aspect-square h-full w-full object-cover"
        />
      )}
    </span>
  )
}
