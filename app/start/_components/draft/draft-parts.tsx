import type { ReactNode } from 'react'
import {
  DRAFT_NOTES,
  DRAFT_TAGS,
  draftFoot,
  faceNote,
  signature,
} from '@/app/start/_components/draft-copy'
import {
  artNote,
  awaitsName,
  type DraftModel,
  headlineOf,
  notesOf,
} from '@/app/start/_components/draft/draft-model'
import { FACE_NAMES, type Face } from '@/app/start/_components/draft/load-faces'
import { Bar } from '@/components/sketch/phone-frame'
import type { QuestionId } from '@/lib/brief/question-ids'

// The parts of the live draft's page (docs/start-page-journey-plan.md, 5.8), drawn the same in the
// browser frame and the phone's window, each a fixed box so nothing an answer changes moves the
// layout. Their layout takes the utilities the site's sheet already carries; every rule of size,
// colour and motion that is the draft's own is app/_styles/start-draft.css's, on the draft-*
// class names. The visitor's own words sit in <bdi>, so a name in another script never turns the
// line around it, and each lands once, keyed, then follows every keystroke in place.

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

const CARDS = [0, 1, 2] as const

// Where the question showing lands: the part it feeds carries a box and its numbered tag, the
// tag ticked once the answer is complete. The send's question selects the whole page instead.
export type Focus = Readonly<{ id: QuestionId; ticked: boolean }> | null

type PartProps = { model: DraftModel; focus: Focus }

type FacedProps = PartProps & { face: Face }

function nowAt(focus: Focus, id: QuestionId): string | undefined {
  return focus?.id === id ? '' : undefined
}

export function Tag({ focus, id }: { focus: Focus; id: QuestionId }) {
  if (focus?.id !== id) return null
  return (
    <span
      data-ticked={focus.ticked ? '' : undefined}
      className="draft-tag absolute z-1 flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-extrabold whitespace-nowrap tabular-nums"
    >
      {DRAFT_TAGS[id]}
    </span>
  )
}

// A note in the serif italic: the studio's voice beside the visitor's words (plan 5.2).
function Note({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <em className={`draft-note font-normal italic ${className}`}>{children}</em>
}

// One of the visitor's photos, from the browser's own object URL: an <img>, so the logo stays the
// only mark drawn as a background (brief-draft.spec.ts counts them). Nothing to optimise or
// lazy-load, and decorative, inside the draft's hidden root.
function Photo({ url }: { url: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={url} src={url} alt="" className="draft-photo absolute inset-0 size-full" />
}

// The wordmark: the logo alone once there is one; else the studio's point of light with the
// business name beside it, the note that says where the name goes once a sentence is in, or a
// bar before either.
export function Wordmark({ model, focus }: PartProps) {
  const { logo, company } = model
  return (
    <span
      data-now={nowAt(focus, 'brand')}
      className="draft-mark relative flex min-w-0 items-center gap-1.5 font-bold"
    >
      <Tag focus={focus} id="brand" />
      {logo !== null ? (
        <span
          key={logo.url}
          style={{ backgroundImage: `url(${logo.url})` }}
          className="draft-logo bg-contain bg-no-repeat"
        />
      ) : (
        <>
          <span className="draft-point size-2.5 shrink-0 rounded-full" />
          {company !== '' ? (
            <bdi key="name" className="draft-name line-clamp-2 leading-tight wrap-anywhere">
              {company}
            </bdi>
          ) : awaitsName(model) ? (
            <Note>{DRAFT_NOTES.name}</Note>
          ) : (
            <Bar className="h-2 w-16" />
          )}
        </>
      )}
    </span>
  )
}

// The eyebrow, and beside it the face the designs use when it could not be loaded here.
export function Eyebrow({ model, face }: { model: DraftModel; face: Face }) {
  return (
    <span className="draft-eyebrow flex items-center gap-2">
      <span className="rounded-full" />
      {model.style !== null && notesOf(model, face.missing).has('face') && (
        <Note>{faceNote(FACE_NAMES[model.style])}</Note>
      )}
    </span>
  )
}

// The headline: the note until the sentence is typed, the sentence, then the business name; a
// face that arrives sets it again. The words sit at the top of their fixed cell, under the
// eyebrow, and the selection box is drawn on the words' own box rather than the cell, so it hugs
// one line, two or three and never stands mostly empty over a short note.
export function Headline({ model, focus, face }: FacedProps) {
  const headline = headlineOf(model)
  const lands = model.company === '' ? 'sentence' : 'name'
  return (
    <p data-size={headline?.size} className="draft-head relative flex flex-col">
      <span data-now={nowAt(focus, 'describe')} className="relative">
        <Tag focus={focus} id="describe" />
        {headline === null ? (
          <Note>{DRAFT_NOTES.sentence}</Note>
        ) : (
          <bdi
            key={`${lands}:${face.family ?? ''}`}
            className="draft-name line-clamp-2 wrap-anywhere"
          >
            {headline.text}
          </bdi>
        )}
      </span>
    </p>
  )
}

// The sentence steps down here once the business name takes the headline; bars before that.
export function Paragraph({ model }: { model: DraftModel }) {
  if (model.company === '' || model.sentence === '') {
    return (
      <span className="draft-para flex flex-col gap-2 pt-1">
        <Bar className="h-2 w-full" />
        <Bar className="h-2 w-4/5" />
      </span>
    )
  }
  return (
    <p className="draft-para line-clamp-3 wrap-anywhere">
      <bdi key="sentence">{model.sentence}</bdi>
    </p>
  )
}

// The call to action: a pill with a bar, never words (plan 5.8), in the house's ink until the
// colour pours into it.
export function Cta({ focus }: { focus: Focus }) {
  return (
    <span
      data-now={nowAt(focus, 'colours')}
      className="draft-cta relative grid place-items-center rounded-full"
    >
      <Tag focus={focus} id="colours" />
    </span>
  )
}

// The mood art for the look, or their first photo in its place, with the note that says what the
// photos will be. Keyed by what it shows, so a new look fades in over the last. The finished
// draft is signed in its corner, where the desk frame shows it; the phone's window signs its own.
export function Art({ model, focus, face }: FacedProps) {
  const photo = model.photos[0]
  const noted = notesOf(model, face.missing).has('art')
  return (
    <span data-now={nowAt(focus, 'imagery')} className="draft-art relative grid rounded-xl">
      <Tag focus={focus} id="imagery" />
      <span
        key={photo ?? model.style ?? ''}
        className="mood-art"
        data-style={model.style ?? undefined}
      >
        {photo !== undefined ? (
          <Photo url={photo} />
        ) : (
          noted && <Note className="rounded-full px-2.5 py-0.5">{artNote(model.style)}</Note>
        )}
      </span>
      <Signature first={model.first} />
    </span>
  )
}

// Three cards, the visitor's next photos filling their pictures in order.
export function Cards({ photos }: { photos: readonly string[] }) {
  return (
    <span className="draft-cards grid gap-2">
      {CARDS.map((card) => {
        const photo = photos[card + 1]
        return (
          <span key={card} className="draft-card grid items-center rounded-lg p-2">
            <span className="draft-glyph relative overflow-hidden rounded-md">
              {photo !== undefined && <Photo url={photo} />}
            </span>
            <Bar className="h-1.5 w-full" />
            <Bar className="h-1.5 w-2/3" />
          </span>
        )
      })}
    </span>
  )
}

// The footer's line. /start is prerendered, so a page built in one year can hydrate in the next:
// the skeleton keeps the server's year for the moment before the flow redraws it.
export function Foot({ company }: { company: string }) {
  return (
    <span className="draft-foot flex items-center justify-between gap-3">
      <span suppressHydrationWarning>
        {draftFoot(YEAR)} {company !== '' && <bdi className="draft-name">{company}</bdi>}
      </span>
      <Bar className="h-1.5 w-12" />
    </span>
  )
}

// The visitor's first name, signing the finished draft in its corner.
function Signature({ first }: { first: string }) {
  if (first === '') return null
  return (
    <em className="draft-note draft-sign absolute rounded-full px-3 py-0.5 font-normal italic">
      {signature(first)}
    </em>
  )
}
