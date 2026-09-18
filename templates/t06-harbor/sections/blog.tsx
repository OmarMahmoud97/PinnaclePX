import { ArrowUpRight, Clock } from 'lucide-react'
import Image from 'next/image'
import type { HarborContent } from '../copy-slots'
import { container, eyebrow, heading, motion, section } from '../styles'
import { HeadingLines } from './lines'

type Props = { blog: NonNullable<HarborContent['blog']> }

// The source's Blog: a quieter band with the eyebrow and heading at the left of a row and a
// round outlined link at its right, then three articles, each a photograph with a wash and a
// tag, a reading time beside a date, a title that takes the accent under the pointer, an
// excerpt clamped to two lines, and the author beside a small ringed arrow. The articles rise
// in turn as they arrive.
export function HarborBlog({ blog }: Props) {
  return (
    <section id="blog" className={`${section} bg-surface-muted`}>
      <div className={container}>
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div data-fade data-margin="-80px">
              <span className={`${eyebrow} mb-4`}>{blog.eyebrow}</span>
            </div>
            <div data-fade data-margin="-80px" style={motion(0.1)}>
              <h2 className={heading}>
                <HeadingLines heading={blog.heading} />
              </h2>
            </div>
          </div>
          <div data-fade data-margin="-80px" style={motion(0.2)}>
            <a
              href={blog.link.href}
              className="inline-flex items-center gap-2 rounded-full border border-brand-deeper/30 px-6 py-3 font-display text-sm font-bold tracking-wider text-brand-deeper uppercase transition-[color,background-color,scale] hover:scale-[1.04] hover:bg-brand-deeper/10 active:scale-[0.96]"
            >
              {blog.link.label} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {blog.posts.map((post, index) => (
            <article
              key={post.title}
              data-fade
              data-margin="-40px"
              style={motion(0.1 * index, '30px', 0.5, 'out')}
              className="group cursor-pointer"
            >
              <div className="relative mb-5 h-56 overflow-hidden rounded-2xl">
                {post.image === null ? (
                  <div className="absolute inset-0 bg-accent" />
                ) : (
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-surface/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-brand-deeper px-3 py-1 text-[10px] font-black tracking-widest text-on-brand uppercase">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-on-surface/40">
                  <Clock size={10} aria-hidden="true" />
                  <span>{post.readTime}</span>
                </div>
                <span className="text-xs text-on-surface/20">·</span>
                <span className="text-xs text-on-surface/40">{post.date}</span>
              </div>
              <h3 className="mb-3 font-display text-xl leading-tight font-black text-on-surface uppercase transition-colors duration-300 group-hover:text-brand-deeper">
                {post.title}
              </h3>
              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-on-surface/50">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface/40">{post.author}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-on-surface/16 text-on-surface/30 transition-all duration-300 group-hover:border-brand-deeper group-hover:text-brand-deeper">
                  <ArrowUpRight size={13} aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
