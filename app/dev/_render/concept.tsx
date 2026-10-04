import { notFound } from 'next/navigation'
import { typeStyle } from '@/app/preview/_components/fonts'
import { StudioBar, UNDER_STUDIO_BAR } from '@/app/preview/_components/studio-bar'
import { paletteFor } from '@/lib/brief/palettes'
import { STYLE_IDS, type VisualStyle } from '@/lib/brief/styles'
import type { SubmissionAnswers } from '@/lib/brief/submission'
import type { SlotImage, TemplateAssets } from '@/lib/copy-slots/assets'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import { schemeFor } from '@/lib/tokens/scheme'
import type { ContrastPair, Scheme } from '@/lib/tokens/types'
import { contractFor } from '@/templates/registry'
import { renderConcept } from '@/templates/render'
import { STAND_IN_FILLS, type StandInFill, standInSrc } from './stand-in'

// What the development routes render: one template's copy as a visitor's page, through
// renderConcept as the preview page renders it, with the tokens the pipeline would derive and
// the fonts of a look. The checks in scripts/checks ask for the states they measure through the
// address, so every one is a page a visitor could get:
//
//   ?look=warm|minimal|bold|dark   the look's fonts (default: the answers' own)
//   ?scheme=light|dark             the tokens' scheme (default: what the look and a wordmark give)
//   ?pictures=<fill>               every image slot holds a stand-in picture of that fill: white,
//                                  black, grey (default: none, as the eval renders)
//   ?logo=<fill>                   a stand-in image logo, a uniform mark of that fill, such as
//                                  l034 for CIE lightness 0.34 (default: the wordmark)
//   ?email=<address>               the page's email, which a visitor's page always has
//                                  (default: none)
//   ?bar=1                         the studio bar above the page, as the preview page draws it
//                                  (app/preview/[slug]/[templateId]/page.tsx), so the header
//                                  checks run on the geometry a visitor gets (decision 22)
//   ?probe=<path>,<path>           the copy's text at each path (nav.cta, hero.cards.plan.action)
//                                  replaced by a marker, Probe 01, Probe 02 in the order given,
//                                  so a check can find the link a copy slot labels (the asks
//                                  check); a path that holds no text is not found

export type DevView = Readonly<{
  look: VisualStyle
  scheme: Scheme
  pictures: StandInFill | null
  logo: StandInFill | null
  email: string | null
  bar: boolean
  probe: readonly string[]
}>

type Search = Readonly<Record<string, string | string[] | undefined>>

const one = (value: string | string[] | undefined) => (typeof value === 'string' ? value : null)
const isFill = (value: string | null): value is StandInFill =>
  value !== null && (STAND_IN_FILLS as readonly string[]).includes(value)
const PATH = /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*$/

// The view a development page was asked for, or null when a parameter names nothing it knows,
// so a mistyped check fails loudly instead of measuring the default page.
export function viewOf(search: Search, answers: SubmissionAnswers): DevView | null {
  const look = one(search.look) ?? answers.imagery.style
  const scheme = one(search.scheme) ?? schemeFor(look as VisualStyle, 'mixed')
  const pictures = one(search.pictures)
  const logo = one(search.logo)
  const email = one(search.email)
  const bar = one(search.bar)
  const probe = (one(search.probe) ?? '').split(',').filter((path) => path !== '')
  if (!(STYLE_IDS as readonly string[]).includes(look)) return null
  if (scheme !== 'light' && scheme !== 'dark') return null
  if (pictures !== null && !isFill(pictures)) return null
  if (logo !== null && !isFill(logo)) return null
  if (email !== null && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return null
  if (bar !== null && bar !== '1') return null
  if (!probe.every((path) => PATH.test(path))) return null
  return {
    look: look as VisualStyle,
    scheme,
    pictures: isFill(pictures) ? pictures : null,
    logo: isFill(logo) ? logo : null,
    email,
    bar: bar === '1',
    probe,
  }
}

// The marker a probed path's text becomes: two digits, so no marker holds another
// (scripts/checks/behaviour.mjs looks for the same).
const probeMarker = (index: number) => `Probe ${String(index + 1).padStart(2, '0')}`

// The copy with each probed path's text replaced by its marker, or null when a path does not
// lead to a text.
function probed(copy: unknown, paths: readonly string[]): unknown {
  if (paths.length === 0) return copy
  const out = structuredClone(copy) as Record<string, unknown>
  for (const [index, path] of paths.entries()) {
    const parts = path.split('.')
    let node: unknown = out
    for (const part of parts.slice(0, -1)) {
      node =
        node !== null && typeof node === 'object' ? (node as Record<string, unknown>)[part] : null
    }
    const last = parts.at(-1) ?? ''
    if (node === null || typeof node !== 'object') return null
    const holder = node as Record<string, unknown>
    if (typeof holder[last] !== 'string') return null
    holder[last] = probeMarker(index)
  }
  return out
}

// The stand-in pictures' size: a 3:2 landscape, the shape most stored picks have.
const PICTURE = { width: 1600, height: 1067 } as const
const LOGO = { width: 480, height: 160 } as const

export function DevConcept({
  templateId,
  copy,
  answers,
  chosen,
  view,
}: Readonly<{
  templateId: string
  copy: unknown
  answers: SubmissionAnswers
  // The templates the submission was chosen: the pipeline solves the tokens over every chosen
  // template's pairs (build-concepts.ts).
  chosen: readonly string[]
  view: DevView
}>) {
  const shown = probed(copy, view.probe)
  if (shown === null) notFound()
  const hex =
    answers.colours.kind === 'palette'
      ? paletteFor(answers.colours.paletteId).hex
      : answers.colours.hex
  const pairs: ContrastPair[] = chosen.flatMap((id) => [...contractFor(id).contrastPairs])
  const tokens = deriveTokens(hex, view.scheme, pairs)
  const { pictures } = view
  const images: Record<string, SlotImage | null> =
    pictures === null
      ? {}
      : Object.fromEntries(
          contractFor(templateId).imageSlots.map((slot) => [
            slot,
            { src: standInSrc(pictures, PICTURE, slot), alt: '', ...PICTURE, credit: null },
          ]),
        )
  const assets: TemplateAssets = {
    logo:
      view.logo === null
        ? { kind: 'wordmark' }
        : {
            kind: 'image',
            src: standInSrc(view.logo, LOGO, 'logo'),
            alt: answers.company,
            ...LOGO,
          },
    images,
    email: view.email,
  }
  const page = (
    <div style={{ ...tokenStyle(tokens), ...typeStyle(view.look) }}>
      {renderConcept(templateId, shown, assets)}
    </div>
  )
  if (!view.bar) return page
  // As the preview page sets a design under the bar: the bar first in a column, then the page.
  // The column's data attribute is only how the studio-bar check finds the bar.
  return (
    <div className="flex min-h-dvh flex-col" style={UNDER_STUDIO_BAR} data-dev-studio="">
      <StudioBar slug="dev" index={0} count={chosen.length} company={answers.company} />
      {page}
    </div>
  )
}
