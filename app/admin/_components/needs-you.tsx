import { card, cardPad } from '@/app/_components/section-styles'
import { segments } from '@/app/admin/_components/needs-you-segments'
import type { NeedsYouItem } from '@/app/admin/_components/standing'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'

type Props = Readonly<{ items: readonly NeedsYouItem[] }>

// What wants the owner's attention, as sentences (ADR 0047): the next call, calls that need an
// outcome, a Cal.com booking that matched no brief, how many briefs are new. Each company named
// is drawn as the link to that person's newest brief; a plain anchor, as on the list.
export function NeedsYou({ items }: Props) {
  return (
    <section className={`${card} ${cardPad} flex flex-col gap-2`} aria-labelledby="needs-you">
      <h2 id="needs-you" className={captionStyles}>
        Needs you
      </h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.text}>
            {segments(item.text, item.links).map((segment, index) =>
              'link' in segment ? (
                <a
                  key={`${segment.link.slug}-${String(index)}`}
                  href={`/admin/${segment.link.slug}`}
                  className={textLinkStyles}
                >
                  {segment.link.label}
                </a>
              ) : (
                <span key={String(index)}>{segment.text}</span>
              ),
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
