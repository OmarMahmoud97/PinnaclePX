import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { DesignPoster } from '@/app/preview/_components/design-poster'
import { SLOT_LINES } from '@/app/start/_components/done-lines'
import { trackEvent } from '@/lib/analytics/events'
import type { FoundView } from '@/lib/brief/status'
import { descriptorOf, designLinkName, designName, layoutOf } from '@/lib/preview/descriptors'

type Concept = FoundView['concepts'][number]

type PosterProps = Readonly<{
  concept: Concept
  // The business name for the poster's bar; empty when the tab no longer has it.
  company: string
  // The fill every design's buttons carry, once the tokens stage has set it.
  fill: string | null
  // Where the poster sits among the designs, which sets its turn in the split and its tilt in
  // the strip, and the turn its veil lifts in; in the list the item carries the same turn, so
  // the poster and its caption split as one card (start-done-view.css).
  index: number
}>

// A design in miniature, from what the status poll has released so far (app/preview/_components/
// design-poster.tsx), under a veil until the build is ready (start-done-view.css).
function Poster({ concept, company, fill, index }: PosterProps) {
  return (
    <span className="done-poster" style={{ '--i': index } as CSSProperties}>
      <DesignPoster
        company={company}
        headline={concept.headline}
        photo={concept.photo?.src ?? null}
        fill={fill}
        layout={layoutOf(concept.templateId)}
      />
    </span>
  )
}

type Props = Readonly<{
  view: FoundView
  company: string
  // Rows in main below lg; posters in the region from lg (plan D18).
  variant: 'rows' | 'posters'
  // A design was opened, which makes the call the next step (plan 3.2, step 11).
  onOpen: () => void
}>

// The visitor's designs, one real list of links (docs/start-page-journey-plan.md, D18 and 9.1):
// each named by its place and a few words for its layout, never a code name (OD12), and a link
// from the first poll that can open it, in a new tab so this page is still here to come back to.
// It is drawn twice, as rows in main below lg and as posters in the region from lg, and
// start-done-view.css displays exactly one at each width, so one list is ever in the accessibility
// tree. Each lives outside the draft's aria-hidden root; the posters inside the links are hidden
// from the screen reader, which hears the link's name.
export function DesignList({ view, company, variant, onOpen }: Props) {
  const fill = view.palette?.hex ?? null
  return (
    <ol aria-label="Your designs" data-variant={variant} className="design-list">
      {view.concepts.map((concept, index) => {
        const { href, templateId } = concept
        const descriptor = descriptorOf(templateId)
        const content = (
          <>
            {variant === 'posters' && (
              <Poster concept={concept} company={company} fill={fill} index={index} />
            )}
            <span className="design-caption">
              <span className="design-name">
                {designName(index)}
                {descriptor !== null && <span className="design-descriptor">{descriptor}</span>}
              </span>
              {href === null || templateId === null ? (
                <span className="design-state">
                  <span aria-hidden="true" className="design-dot" />
                  {SLOT_LINES.beingBuilt}
                </span>
              ) : (
                <ArrowUpRight aria-hidden="true" className="design-arrow" />
              )}
            </span>
          </>
        )
        return (
          <li key={designName(index)} style={{ '--i': index } as CSSProperties}>
            {href === null || templateId === null ? (
              <div className="design-item">{content}</div>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={designLinkName(index, templateId)}
                onClick={() => {
                  trackEvent('design_open', { template: templateId, from: 'done' })
                  onOpen()
                }}
                className="design-item"
              >
                {content}
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}

// The same designs as decoration, above the questions' column on a phone and a tablet, where the
// rows in main are the list (plan 4.5): hidden from the screen reader, holding nothing to focus.
export function DesignStrip({ view, company }: Omit<Props, 'variant' | 'onOpen'>) {
  const fill = view.palette?.hex ?? null
  return (
    <div aria-hidden="true" className="done-strip">
      {view.concepts.map((concept, index) => (
        <Poster
          key={designName(index)}
          concept={concept}
          company={company}
          fill={fill}
          index={index}
        />
      ))}
    </div>
  )
}
