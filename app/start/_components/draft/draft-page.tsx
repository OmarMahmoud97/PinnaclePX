'use client'

import { DRAFT_CHROME } from '@/app/start/_components/draft-copy'
import { type DraftModel, draftColours } from '@/app/start/_components/draft/draft-model'
import {
  Art,
  Cards,
  Cta,
  Eyebrow,
  type Focus,
  Foot,
  Headline,
  Paragraph,
  Tag,
  Wordmark,
} from '@/app/start/_components/draft/draft-parts'
import type { Face } from '@/app/start/_components/draft/load-faces'
import { BrowserFrame } from '@/components/sketch/browser-frame'
import { Bar, PhoneFrame } from '@/components/sketch/phone-frame'

type PageProps = { model: DraftModel; focus: Focus; face: Face }

// The page the draft draws, the same in both frames: the nav, the hero's words and call to
// action beside its picture, three cards and the footer. start-draft.css lays it out as a desk page
// in the browser frame and as a phone page in the phone frame. It is isolated, so its veil and
// raised headline never paint over the phone that overlaps the browser frame at a desk.
function DraftPage({ model, focus, face }: PageProps) {
  return (
    <div className="draft-page relative isolate grid flex-1">
      <div className="draft-nav flex items-center gap-2.5 self-start">
        <Wordmark model={model} focus={focus} />
        <span className="draft-links hidden gap-2.5">
          <Bar className="h-1.5 w-7" />
          <Bar className="h-1.5 w-7" />
          <Bar className="h-1.5 w-7" />
        </span>
        <span className="draft-pill grid place-items-center rounded-full" />
      </div>
      <Eyebrow model={model} face={face} />
      <Headline model={model} focus={focus} face={face} />
      <Paragraph model={model} />
      <Cta focus={focus} />
      <Art model={model} focus={focus} face={face} />
      <Cards photos={model.photos} />
      <Foot company={model.company} />
    </div>
  )
}

function flag(on: boolean): string | undefined {
  return on ? '' : undefined
}

type Props = PageProps & {
  // Painted by the server's skeleton, which the flow replaces as soon as it mounts: nothing in
  // it lands (start-draft.css).
  still: boolean
}

// The live draft (docs/start-page-journey-plan.md, 5.8): one page drawn from the answers in two
// frames, the browser frame at every width, zoomed whole to the screen below lg and to the pane
// from it (start-draft.css), and the phone frame over its corner from 80rem. Both stay in the
// DOM at every width, so the region always holds the same marks. Decorative: the region's
// sentence (SketchChips) carries it in words, so its root is hidden from assistive technology
// and holds nothing focusable.
//
// The engine's colours sit on the root (draftColours), and its attributes tell start-draft.css
// the scheme, whether the sentence has lit it, whether a colour, a grey or a hovered colour is
// showing, and whether the draft is finished. The phone's screen is a column, so the page keeps
// its own height inside it and its surface runs as far down as the phone shows. The whole-page
// box the send question draws sits against the browser's page, not its frame, so its tag clears
// the frame's chrome.
export function Draft({ model, focus, face, still }: Props) {
  const tab = model.company === '' ? DRAFT_CHROME.blankTab : model.company
  const page = <DraftPage model={model} focus={focus} face={face} />

  return (
    <div
      aria-hidden="true"
      data-draft=""
      data-still={flag(still)}
      data-scheme={model.scheme}
      data-lit={flag(model.lit)}
      data-coloured={flag(model.hex !== null)}
      data-grey={flag(model.grey)}
      data-preview={flag(model.previewing)}
      data-finished={flag(model.finished)}
      style={draftColours(model)}
      className="draft"
    >
      <BrowserFrame company={tab} coloured={model.hex !== null} className="draft-browser relative">
        <div className="relative">
          {page}
          {focus?.id === 'details' && (
            <span data-now="" className="draft-whole absolute">
              <Tag focus={focus} id="details" />
            </span>
          )}
        </div>
      </BrowserFrame>
      <PhoneFrame className="draft-phone relative">
        <div className="flex flex-1 flex-col">{page}</div>
      </PhoneFrame>
    </div>
  )
}
