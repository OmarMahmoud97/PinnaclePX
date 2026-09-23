import {
  type LucideIcon,
  MessageCircleQuestionMark,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { includedGroups, INCLUDED, type IncludedJob } from '@/app/_components/included-items'
import { revealDelay } from '@/app/_components/reveal'
import {
  cardBody,
  cardHeading,
  cardInk,
  cardPad,
  headingBlock,
  jobWord,
  sectionLead,
  shell,
  titleHeading,
  well,
} from '@/app/_components/section-styles'
import { CONFIG } from '@/lib/config'

// Each job's glyph and hue. The hues are the hero ramp's own stops, at 6.7:1 or better on the
// card (docs/adr/0034); the same hue is on the glyph and the word so they read as one mark. The
// classes are written out in full so Tailwind finds them.
const JOBS: Readonly<Record<IncludedJob, Readonly<{ Icon: LucideIcon; hue: string }>>> = {
  found: { Icon: Search, hue: 'text-job-found' },
  trusted: { Icon: ShieldCheck, hue: 'text-job-trusted' },
  answered: { Icon: MessageCircleQuestionMark, hue: 'text-job-answered' },
  reachable: { Icon: Smartphone, hue: 'text-job-reachable' },
}

// The site the visitor is buying, in four jobs a website has to do, on the dark stretch the
// hero's foot opened (ADR 0034). Each job is a card: a drawn glyph, the job word as the band's
// one display-size line in the glyph's hue, one line of what the job means for them, and the
// two things built in that do it as a pair of wells that show the ground through the card.
// Every card is a subgrid of the list, so the glyphs, the words, the scenes and the wells sit on
// shared rows and the eight titles are level across the band whatever each line's length. One
// column on a phone, two from md, and four from lg; the pair stacks at every width so each well
// keeps a full line. No counters, no ask: the walkthrough's button is one section down,
// and a second pair of links here would split the page's one goal. The band's foot carries the
// seam's extra padding so the pooled curve the stretch ends in never clips the last cards.
export function Included() {
  const groups = includedGroups(CONFIG.care)
  return (
    <section
      id="included"
      className="scroll-mt-16 pt-band pb-[calc(var(--spacing-band)+var(--seam))]"
    >
      <div className={shell}>
        <div data-reveal className={headingBlock}>
          <h2 className={titleHeading}>{INCLUDED.heading}</h2>
          <p style={revealDelay(1)} className={sectionLead}>
            {INCLUDED.lead}
          </p>
        </div>

        {/* Owned by the choreography from md (app/_components/motion/included.ts); on a phone
            the CSS reveal carries the cards and the draw-on waits for data-inview. */}
        <ul
          data-reveal
          data-choreo="jobs"
          className="mt-10 grid gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-4"
        >
          {groups.map(({ job, label, scene, cells }, index) => {
            const { Icon, hue } = JOBS[job]
            return (
              <li
                key={label}
                style={revealDelay(index)}
                // At md the card is half the shell, so it keeps the phone's tighter padding
                // until lg gives each job its own column.
                className={`grid grid-rows-subgrid gap-5 ${cardInk} ${cardPad} row-span-4 max-md:rounded-2xl max-md:p-4 md:max-lg:p-5 lg:row-span-5`}
              >
                {/* Decoration: the word beside it is the job's name. The strokes draw on under
                    motion and are complete in the markup, so the picture is whole without it. */}
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className={`job-glyph size-8 md:size-10 ${hue}`}
                />
                <p className={`${jobWord} ${hue}`}>{label}</p>
                <p className="text-body text-pretty text-on-surface">{scene}</p>
                {/* The pair under the job, stacked at every width: side by side the wells were
                    149 px wide on a phone and 141 px at md, where two cards share the shell, so
                    the titles wrapped and the bodies ran three words a line. At lg the four jobs
                    sit across the band and the wells take shared rows so the eight titles are
                    level whatever each line's length. */}
                <ul className="grid gap-3 lg:row-span-2 lg:grid-rows-subgrid">
                  {cells.map(({ title, body }) => (
                    <li key={title} className={`flex flex-col gap-2 ${well}`}>
                      <h3 className={cardHeading}>{title}</h3>
                      <p className={cardBody}>{body}</p>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
