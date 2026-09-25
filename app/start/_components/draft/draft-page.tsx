'use client'

import { Lock } from 'lucide-react'
import { type CSSProperties, useState } from 'react'
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
  Signature,
  Tag,
  Wordmark,
} from '@/app/start/_components/draft/draft-parts'
import type { Face } from '@/app/start/_components/draft/load-faces'
import { BrowserFrame } from '@/components/sketch/browser-frame'
import { Bar, PhoneFrame } from '@/components/sketch/phone-frame'
import { tabLabelFrom } from '@/lib/brief/sketch'
import { CONFIG } from '@/lib/config'

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

// Where each crop opens on the page, by question (CONFIG.start.window): the phone's window under
// its full and its short crop, then the desk page's 300 px and 150 px crops. Which one a screen
// shows is start-draft.css's to decide, by width and height; the page sets all four.
const { offsetsPx, shortOffsetsPx, cropOffsetsPx, shortCropOffsetsPx } = CONFIG.start.window
const CROPS = [offsetsPx, shortOffsetsPx, cropOffsetsPx, shortCropOffsetsPx] as const

type Turns = readonly [phone: number, phoneShort: number, crop: number, cropShort: number]

// How many times each crop has moved since the draft mounted. A move of the question counts only
// for the crops whose offset changes with it, so a window whose part stays put never crossfades
// over nothing.
function turnsAfter(turns: Turns, from: number, to: number): Turns {
  const [phone, phoneShort, crop, cropShort] = CROPS.map(
    (offsets, index) => (turns[index] ?? 0) + (offsets[from] === offsets[to] ? 0 : 1),
  )
  return [phone ?? 0, phoneShort ?? 0, crop ?? 0, cropShort ?? 0]
}

// The crossfade's hook: absent until the first move, then alternating so each move starts it
// afresh (start-draft.css).
function turnOf(count: number): number | undefined {
  return count === 0 ? undefined : count % 2
}

function offsetsAt(at: number): CSSProperties {
  return {
    '--window-y': `${String(offsetsPx[at] ?? 0)}px`,
    '--window-y-short': `${String(shortOffsetsPx[at] ?? 0)}px`,
    '--crop-y': `${String(cropOffsetsPx[at] ?? 0)}px`,
    '--crop-y-short': `${String(shortCropOffsetsPx[at] ?? 0)}px`,
  } as CSSProperties
}

type Props = PageProps & {
  // The question showing, 0-based, which sets each crop's offset.
  at: number
  // Painted by the server's skeleton, which the flow replaces as soon as it mounts: nothing in
  // it lands (start-draft.css).
  still: boolean
}

// The live draft (docs/start-page-journey-plan.md, 5.8): one page drawn from the answers in two
// frames, the browser frame from lg with the phone over its corner, and below lg the phone frame
// alone, restyled as a window onto the page at its own size (plan D8), or between 36rem and lg
// the browser frame cropped. Both stay in the DOM at every width, so the region always holds the
// same marks. Decorative: the region's sentence (SketchChips) carries it in words, so its root is
// hidden from assistive technology and holds nothing focusable.
//
// The engine's colours sit on the root (draftColours), and its attributes tell start-draft.css
// the scheme, whether the sentence has lit it, whether a colour, a grey or a hovered colour is
// showing, and whether the draft is finished. Each crop scrolls to the part the question feeds
// (CONFIG.start.window); when its offset changes it crossfades, the page jumping while it is out
// of sight, and its data-turn alternates so each change starts the crossfade afresh. The phone's
// screen and the browser's crop each carry a turn for their full crop and one for their short
// crop, and the sheet reads the one the screen's height calls for. The window's screen is a
// column, so the page keeps its own height inside it and its surface runs as far down as the
// window shows. The whole-page box the send question draws sits against the browser's page, not
// its frame, so a crop cuts the box where it cuts the page.
export function Draft({ model, at, focus, face, still }: Props) {
  const [turn, setTurn] = useState<{ at: number; turns: Turns }>({ at, turns: [0, 0, 0, 0] })
  if (turn.at !== at) setTurn({ at, turns: turnsAfter(turn.turns, turn.at, at) })
  const [phoneTurn, phoneShortTurn, cropTurn, cropShortTurn] = turn.turns
  const offsets = offsetsAt(at)
  const tab = model.company === '' ? DRAFT_CHROME.blankTab : model.company
  const page = <DraftPage model={model} focus={focus} face={face} />
  const whole = focus?.id === 'details' && (
    <span data-now="" className="draft-whole absolute">
      <Tag focus={focus} id="details" />
    </span>
  )

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
        <div
          className="draft-crop relative"
          data-turn={turnOf(cropTurn)}
          data-turn-short={turnOf(cropShortTurn)}
          style={offsets}
        >
          {page}
          {whole}
        </div>
      </BrowserFrame>
      <PhoneFrame className="draft-phone relative">
        <span className="draft-bar items-center gap-1.5 px-3 py-2 text-xs font-bold">
          {DRAFT_CHROME.windowBar}
          <span className="draft-tab flex min-w-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 font-medium whitespace-nowrap text-on-surface-muted">
            <Lock className="size-3 shrink-0" />
            {tabLabelFrom(tab)}
          </span>
        </span>
        <div
          className="draft-screen relative flex flex-1 flex-col"
          data-turn={turnOf(phoneTurn)}
          data-turn-short={turnOf(phoneShortTurn)}
          style={offsets}
        >
          {page}
        </div>
        <Signature first={model.first} />
        {whole}
      </PhoneFrame>
    </div>
  )
}
