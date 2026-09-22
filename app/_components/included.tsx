import { includedGroups, INCLUDED } from '@/app/_components/included-items'
import { revealDelay } from '@/app/_components/reveal'
import {
  cardBody,
  cardHeading,
  cellGrid,
  hairlineCell,
  sectionLead,
  titleHeading,
} from '@/app/_components/section-styles'
import { captionStyles } from '@/components/ui/caption'
import { CONFIG } from '@/lib/config'

// The site the visitor is buying, in four jobs a website has to do. Each job is a label, one
// line of what it means for them, and the two things built in that do it, on the What you get
// cell recipe so the band reads as one system. Two cells across on a phone and all eight across
// from lg, where each job keeps its own pair. No counters, no ask: the walkthrough's button is
// one section down, and a second pair of links here would split the page's one goal.
export function Included() {
  const groups = includedGroups(CONFIG.care)
  return (
    <section id="included" className="scroll-mt-16">
      <div className="flex flex-col gap-3 p-column max-md:pb-3 md:max-w-3xl">
        <h2 className={titleHeading}>{INCLUDED.heading}</h2>
        <p className={sectionLead}>{INCLUDED.lead}</p>
      </div>

      <ul data-reveal className="grid gap-px border-y border-border bg-border lg:grid-cols-4">
        {groups.map(({ label, scene, cells }, index) => (
          <li
            key={label}
            style={revealDelay(index)}
            className="flex flex-col gap-px bg-border lg:col-span-1"
          >
            <div className="flex flex-col gap-2 bg-surface p-4 sm:p-cell">
              <span className={captionStyles}>{label}</span>
              <p className="text-body text-pretty">{scene}</p>
            </div>
            {/* The pair under the job, side by side on a phone and stacked in their own column
                from lg, where the four jobs sit across the band. */}
            <ul className={`${cellGrid} flex-1 lg:grid-cols-1`}>
              {cells.map(({ title, body }) => (
                <li key={title} className={hairlineCell}>
                  <h3 className={cardHeading}>{title}</h3>
                  <p className={cardBody}>{body}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 p-column pt-5 md:pt-6">
        <p className={captionStyles}>{INCLUDED.caption}</p>
      </div>
    </section>
  )
}
