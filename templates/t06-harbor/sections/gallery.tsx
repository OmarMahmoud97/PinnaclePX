import Image from 'next/image'
import type { HarborContent, HarborImage } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = { gallery: NonNullable<HarborContent['gallery']> }

type Item = Props['gallery']['items'][number]

// The three shapes a cell takes in the source's grid: the tall one at the left, the two short
// ones stacked beside it, and the wide one across the right half.
const TALL = {
  height: 'h-[500px]',
  pad: 'p-5',
  tag: 'mb-2 px-3 py-1 text-[10px]',
  name: 'text-lg',
  result: 'text-sm',
  sizes: '25vw',
} as const
const SHORT = {
  height: 'h-[238px]',
  pad: 'p-4',
  tag: 'mb-1.5 px-2 py-0.5 text-[9px]',
  name: 'text-sm',
  result: 'text-xs',
  sizes: '25vw',
} as const
const WIDE = {
  height: 'h-[500px]',
  pad: 'p-6',
  tag: 'mb-2 px-3 py-1 text-[10px]',
  name: 'text-2xl',
  result: 'text-base',
  sizes: '50vw',
} as const

// The source's Gallery: the eyebrow and heading centred, then a grid of two columns, four from
// lg: a tall cell spanning two rows, a column of two short cells, and a wide cell across two
// columns, each a photograph with a wash over its foot, a tag, a name and a result, swelling a
// little under the pointer. The cells rise in turn; a round outlined button follows.
export function HarborGallery({ gallery }: Props) {
  const [tall, first, second, wide] = gallery.items
  return (
    <section id="gallery" className={`${section} bg-surface`}>
      <div className={container}>
        <div className="mb-16 text-center">
          <div data-fade data-margin="-80px">
            <span className={`${eyebrow} mb-4`}>{gallery.eyebrow}</span>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.1)}>
            <h2 className={heading}>
              <HeadingLines heading={gallery.heading} />
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div
            data-fade
            style={motion(0, undefined, 0.6, 'out')}
            className="group relative col-span-1 row-span-2 cursor-pointer"
          >
            <Cell item={tall} shape={TALL} />
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            {[first, second].map((item, index) => (
              <div
                key={item.name}
                data-fade
                style={motion(0.1 + 0.15 * index, undefined, 0.6, 'out')}
                className="group relative cursor-pointer"
              >
                <Cell item={item} shape={SHORT} />
              </div>
            ))}
          </div>
          <div
            data-fade
            style={motion(0.35, undefined, 0.6, 'out')}
            className="group relative col-span-2 cursor-pointer"
          >
            <Cell item={wide} shape={WIDE} />
          </div>
        </div>
        <div data-fade data-margin="-80px" style={motion(0.2)} className="mt-12 text-center">
          <a
            href={gallery.cta.href}
            className="inline-flex items-center gap-2 rounded-full border border-brand-deeper/30 px-6 py-3 font-display text-sm font-bold tracking-wider text-brand-deeper uppercase transition-[color,background-color,scale] duration-200 hover:scale-[1.04] hover:bg-brand-deeper/10 active:scale-[0.96]"
          >
            {gallery.cta.label}
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

type CellProps = { item: Item; shape: typeof TALL | typeof SHORT | typeof WIDE }

function Cell({ item, shape }: CellProps) {
  return (
    <div className={`relative ${shape.height} overflow-hidden rounded-xl`}>
      <Picture image={item.image} alt={item.name} sizes={shape.sizes} />
      <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
      <div className={`absolute bottom-0 left-0 ${shape.pad}`}>
        <span
          className={`inline-block rounded-full bg-brand-deeper font-black tracking-widest text-on-brand uppercase ${shape.tag}`}
        >
          {item.tag}
        </span>
        <p className={`font-display leading-tight font-black text-on-surface ${shape.name}`}>
          {item.name}
        </p>
        <p className={`font-semibold text-brand-deeper ${shape.result}`}>{item.result}</p>
      </div>
    </div>
  )
}

function Picture({ image, alt, sizes }: { image: HarborImage | null; alt: string; sizes: string }) {
  if (image === null) return <div className="absolute inset-0 bg-accent" />
  return (
    <Image
      src={image.src}
      alt={image.alt === '' ? alt : image.alt}
      fill
      sizes={sizes}
      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
    />
  )
}
