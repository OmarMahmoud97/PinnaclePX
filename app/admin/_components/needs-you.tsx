import { card, cardPad } from '@/app/_components/section-styles'
import type { NeedsYouItem } from '@/app/admin/_components/standing'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'

type Props = Readonly<{ items: readonly NeedsYouItem[] }>

// What wants the owner's attention, as sentences (ADR 0047): the next call, calls that need an
// outcome, a Cal.com booking that matched no brief, how many briefs are new. Each company named
// is a link to that person's newest brief; a plain anchor, as on the list.
export function NeedsYou({ items }: Props) {
  return (
    <section className={`${card} ${cardPad} flex flex-col gap-2`} aria-labelledby="needs-you">
      <h2 id="needs-you" className={captionStyles}>
        Needs you
      </h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.text}>
            {item.text}
            {item.links.length > 0 && (
              <>
                {' '}
                {item.links.map((link, index) => (
                  <span key={link.slug}>
                    {index > 0 && ', '}
                    <a href={`/admin/${link.slug}`} className={textLinkStyles}>
                      {link.label}
                    </a>
                  </span>
                ))}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
