import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { SummitContent } from '../copy-slots'
import { anchored, delay, eyebrow, gap, pad, title } from '../styles'

type Props = { articles: NonNullable<SummitContent['articles']> }

// The source's Articles: the eyebrow and heading at the left with a bordered link at the
// right, then three cards in a row from md (two from sm), each a rounded picture that swells a
// little under the pointer, a line naming the author and, after a small green dot, the reading
// time, and the title. The header's parts rise; the cards rise in turn from 80px on the
// source's quicker spring. Without a picture the frame is the quieter surface.
export function SummitArticles({ articles }: Props) {
  return (
    <section id="articles" className={`flex items-center justify-center ${pad} ${anchored} ${gap}`}>
      <div className="w-full max-w-275">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span data-fade style={delay(0.2)} className={eyebrow}>
              {articles.eyebrow}
            </span>
            <h2
              data-fade
              data-spring="soft"
              className={`${title} mt-6 max-w-109 text-left text-4xl md:text-5xl`}
            >
              {articles.heading}
            </h2>
          </div>
          <a
            href={articles.link.href}
            data-fade
            style={delay(0.2)}
            className="group flex items-center gap-2 rounded-sm border border-on-surface/11 px-3 py-2 text-xs text-on-surface-muted transition-colors sm:text-sm"
          >
            {articles.link.label}
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              aria-hidden="true"
              className="transition group-hover:translate-x-1"
            />
          </a>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {articles.posts.map((post, index) => (
            <div
              key={post.title}
              data-fade="80"
              data-spring="quick"
              style={delay(0.1 * index)}
              className="group cursor-pointer"
            >
              <div
                className={`relative mb-5 aspect-370/250 w-full overflow-hidden rounded-2xl ${post.image === null ? 'bg-surface-muted' : ''}`}
              >
                {post.image !== null && (
                  <Image
                    src={post.image.src}
                    alt={post.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mb-2 flex items-center gap-4">
                <p className="text-xs text-on-surface-muted">By {post.author}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.25 w-1.25 rounded-full bg-glow-secondary" />
                  <span className="text-xs text-on-surface-muted">{post.readTime}</span>
                </div>
              </div>
              <h3 className="max-w-2xs font-medium text-on-surface/75">{post.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
