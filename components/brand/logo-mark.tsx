import { cn } from '@/lib/cn'

// The mark's own proportions, from the artwork's ink box (1107 by 729 px).
const RATIO = 1107 / 729

// The artwork, cropped and exported from the owner's PNG (23 September 2026) at two widths; the
// address carries that date as a version so a re-export busts the cache (next.config.ts serves
// /brand/* immutable, as it does /work/*). Widths, not heights, because the mark is landscape.
const SRC = '/brand/px-mark-240.webp?v=2026-09-23'
const SRC_SET = `${SRC} 240w, /brand/px-mark-480.webp?v=2026-09-23 480w`

type Props = { size: number; className?: string | undefined }

// The PX mark, drawn two ways in the same box and shown one at a time by app/_styles/brand.css:
// the artwork itself, a navy-to-sky gradient, wherever the ground is light; and its silhouette
// as a CSS mask filled with the current colour (over the hero, where the header is blended by
// difference and a colour would show as its opposite) or with the ramp's light gradient (the
// footer and the header's dark state, where the artwork's navy sinks into the ground). The
// box is sized in pixels so the mark is the same object at every size the site draws it;
// `size` is its height. Decorative everywhere: the name beside it, or the link around it,
// carries the meaning.
export function LogoMark({ size, className }: Props) {
  const width = Math.round(size * RATIO)
  return (
    <span
      aria-hidden="true"
      className={cn('brand-mark relative inline-block shrink-0', className)}
      style={{ width, height: size }}
    >
      {/* A committed file at two known widths, like the work captures: no optimiser, no client
          script. The picture element is where the plain-img lint rule stands down. */}
      <picture className="brand-mark-image absolute inset-0 block size-full">
        <img
          src={SRC}
          srcSet={SRC_SET}
          sizes={`${String(width)}px`}
          width={width}
          height={size}
          alt=""
          decoding="async"
          className="size-full object-contain"
        />
      </picture>
      <span className="brand-mark-mask absolute inset-0" />
    </span>
  )
}
