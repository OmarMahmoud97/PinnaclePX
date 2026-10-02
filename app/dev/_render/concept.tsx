import { typeStyle } from '@/app/preview/_components/fonts'
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

export type DevView = Readonly<{
  look: VisualStyle
  scheme: Scheme
  pictures: StandInFill | null
  logo: StandInFill | null
  email: string | null
}>

type Search = Readonly<Record<string, string | string[] | undefined>>

const one = (value: string | string[] | undefined) => (typeof value === 'string' ? value : null)
const isFill = (value: string | null): value is StandInFill =>
  value !== null && (STAND_IN_FILLS as readonly string[]).includes(value)

// The view a development page was asked for, or null when a parameter names nothing it knows,
// so a mistyped check fails loudly instead of measuring the default page.
export function viewOf(search: Search, answers: SubmissionAnswers): DevView | null {
  const look = one(search.look) ?? answers.imagery.style
  const scheme = one(search.scheme) ?? schemeFor(look as VisualStyle, 'mixed')
  const pictures = one(search.pictures)
  const logo = one(search.logo)
  const email = one(search.email)
  if (!(STYLE_IDS as readonly string[]).includes(look)) return null
  if (scheme !== 'light' && scheme !== 'dark') return null
  if (pictures !== null && !isFill(pictures)) return null
  if (logo !== null && !isFill(logo)) return null
  if (email !== null && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return null
  return {
    look: look as VisualStyle,
    scheme,
    pictures: isFill(pictures) ? pictures : null,
    logo: isFill(logo) ? logo : null,
    email,
  }
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
  return (
    <div style={{ ...tokenStyle(tokens), ...typeStyle(view.look) }}>
      {renderConcept(templateId, copy, assets)}
    </div>
  )
}
