import { MessagesSquare } from 'lucide-react'
import type { MeridianContent } from '../copy-slots'
import { fitWord } from '../fit'
import { button, cardContent, cardFooter, cardHeader, container } from '../styles'
import { Emphasis } from './emphasis'

type Props = Pick<MeridianContent, 'community'>

// The source's CommunitySection: a rule above and below, and between them a borderless card in
// the centre with a large icon over a heading whose last word is in the gradient, a lead and a
// button. The source's icon was Discord's mark; a business's ask carries a speech-bubbles mark
// at the same size. The heading is sized by its longest word (fit.ts) against the card's column,
// since the card is only as wide as its words.
export function MeridianCommunity({ community }: Props) {
  return (
    <section id="ask" className="py-12">
      <hr className="border-surface-muted" />
      <div className={`${container} py-20 sm:py-20`}>
        <div className="@container mx-auto lg:w-[60%]">
          <div className="flex flex-col items-center justify-center rounded-lg border-none bg-surface text-center text-on-surface shadow-none">
            <div className={cardHeader}>
              <h2 className="flex flex-col items-center text-4xl font-bold md:text-5xl">
                <MessagesSquare width={80} height={80} className="mb-4" aria-hidden="true" />
                <div
                  className="meridian-fit meridian-fit-ask"
                  style={fitWord(community.heading.text)}
                >
                  <Emphasis heading={community.heading} padding="pl-2" />
                </div>
              </h2>
            </div>
            <div className={`${cardContent} text-xl text-on-surface-muted lg:w-[80%]`}>
              {community.body}
            </div>

            <div className={cardFooter}>
              <a href={community.action.href} className={button.default}>
                {community.action.label}
              </a>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-surface-muted" />
    </section>
  )
}
