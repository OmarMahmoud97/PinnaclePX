import Image from 'next/image'
import { Fragment, type ReactNode } from 'react'
import type { LucentContent, LucentImage } from '../copy-slots'

type Brand = LucentContent['brand']

// A heading's lines as the source wrote them: a space and a <br> between each, so a desktop breaks
// them where the source did and a phone, which hides the <br>, runs them on as one sentence.
export function Lines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, index) => (
    <Fragment key={`${String(index)}${line}`}>
      {index > 0 && (
        <>
          {' '}
          <br />
        </>
      )}
      {line}
    </Fragment>
  ))
}

// A page heading whose lines rise out of a mask as it comes into view (sections/mask.ts). The
// words sit in their own span, which the script hides while it plays the lines over them.
export function MaskHeading({
  as: Tag = 'h2',
  className,
  id,
  children,
}: {
  as?: 'h2' | 'h3'
  className?: string
  id?: string
  children: ReactNode
}) {
  return (
    <Tag className={className} id={id} data-mask="">
      <span className="lc-mask-text">{children}</span>
    </Tag>
  )
}

export function Eyebrow({ children, night = false }: { children: ReactNode; night?: boolean }) {
  return (
    <span className={night ? 'lc-eyebrow lc-eyebrow--c' : 'lc-eyebrow'} data-reveal="">
      {children}
    </span>
  )
}

// A text's letters as a reader sees them, so an accented letter or a joined symbol stays whole.
export function graphemes(text: string): string[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return Array.from(segmenter.segment(text), (part) => part.segment)
}

// A brand logo that is a mark, an app icon or a monogram, close to square: the source set its
// icon beside its name in the bar and the footer, and in place of the name's first letter in the
// footer's big line. A wide logo is a wordmark and stands alone.
export function isMark(logo: Brand['logo']): boolean {
  if (logo.kind !== 'image') return false
  const ratio = logo.width / logo.height
  return ratio >= 0.75 && ratio <= 1.34
}

// The brand as the bar and the footer show it: the mark and the name, a wide logo alone, or the
// name alone.
export function BrandLockup({ brand, sizes }: { brand: Brand; sizes: string }) {
  const { logo, name } = brand
  if (logo.kind === 'image' && !isMark(logo)) {
    return (
      <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} sizes={sizes} />
    )
  }
  return (
    <>
      {logo.kind === 'image' && (
        <Image
          className="lc-mark"
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          sizes={sizes}
        />
      )}
      <span>{name}</span>
    </>
  )
}

// A picture, or a quiet panel of the same box where the imagery stage found none.
export function Picture({
  image,
  className,
  sizes,
  alt,
  eager = false,
}: {
  image: LucentImage | null
  className: string
  sizes: string
  alt?: string
  eager?: boolean
}) {
  if (image === null) return <span className={`${className} lc-placeholder`} aria-hidden="true" />
  return (
    <Image
      className={className}
      src={image.src}
      alt={alt ?? image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      {...(eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
    />
  )
}

// The arrow the source drew after "Read more" and on the picture card's round button.
export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h12.5M12 5.5l6.5 6.5-6.5 6.5" />
    </svg>
  )
}
