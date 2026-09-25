import type { CSSProperties } from 'react'
import { DRAFT_NOTES, photosNote } from '@/app/start/_components/draft-copy'
import type { Preview } from '@/app/start/_components/question-pane'
import { firstNameFrom } from '@/lib/brief/names'
import { type QuestionId, QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { isSentenceComplete } from '@/lib/brief/sentence'
import { brandHexFrom } from '@/lib/brief/sketch'
import type { VisualStyle } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'
import type { LogoPolarity } from '@/lib/logo/types'
import { schemeFor } from '@/lib/tokens/scheme'
import type { Scheme } from '@/lib/tokens/types'

// The live draft beside the questions (docs/start-page-journey-plan.md, 5.8), worked out from the
// answers, the furthest question the visitor has reached and what the flow holds beside them:
// the pictures, which live as object URLs outside the answers, and an answer being hovered. Pure,
// so every rule the draft follows is tested without a browser (draft-model.test.ts).

// What the flow holds beside the answers. The logo's polarity is null until the browser has read
// the file, and after a refresh.
export type DraftExtras = Readonly<{
  logo: Readonly<{ url: string; polarity: LogoPolarity | null }> | null
  photos: readonly string[]
  preview: Preview | null
}>

export const NO_EXTRAS: DraftExtras = { logo: null, photos: [], preview: null }

export type DraftModel = Readonly<{
  sentence: string
  // The sentence is long enough to brief from, and the draft's light comes up for it.
  lit: boolean
  company: string
  // The visitor's first name, which signs the finished draft.
  first: string
  logo: DraftExtras['logo']
  style: VisualStyle | null
  photos: readonly string[]
  // The colour as six-digit hex, and whether it is a grey, whose hue is not to be trusted.
  hex: string | null
  grey: boolean
  // The colour is one being hovered or focused, not yet chosen.
  previewing: boolean
  scheme: Scheme
  // The last question is reached, so the draft is finished: its last grey parts take the tones.
  finished: boolean
}>

// Whether the visitor has reached a question: `reached` is the furthest shown, 0-based.
export function reaches(reached: number, id: QuestionId): boolean {
  return reached >= QUESTION_IDS.indexOf(id)
}

// An answer joins the draft once its question has been reached, never on its default alone
// (plan D3): the look and the colour have valid defaults, and nothing is blue before the colour
// question but the studio's own light.
export function draftModelFrom(
  answers: Answers,
  reached: number,
  { logo, photos, preview }: DraftExtras,
): DraftModel {
  const style = reaches(reached, 'imagery') ? (preview?.imagery ?? answers.imagery).style : null
  const hex = reaches(reached, 'colours') ? brandHexFrom(preview?.colours ?? answers.colours) : null
  const mark = reaches(reached, 'brand') ? logo : null
  return {
    sentence: answers.description.trim(),
    lit: isSentenceComplete(answers.description),
    company: reaches(reached, 'brand') ? answers.company.trim() : '',
    first: reaches(reached, 'details') ? firstNameFrom(answers.name) : '',
    logo: mark,
    style,
    photos: style === null ? [] : photos,
    hex,
    grey: hex !== null && isGreyHex(hex),
    previewing: hex !== null && preview?.colours !== undefined,
    // Before the look, only the logo decides, as schemeFor does for every look but the dark one.
    scheme: schemeFor(style ?? 'minimal', mark?.polarity ?? 'mixed'),
    finished: reaches(reached, 'details'),
  }
}

// sRGB channel to linear light.
function linear(hex: string, at: number): number {
  const channel = Number.parseInt(hex.slice(at, at + 2), 16) / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

// A six-digit hex's OKLab a and b, the axes its chroma and hue are read from. Björn Ottosson's
// matrices, as in lib/logo/accent.ts, written out so the draft carries no colour library.
function opponentsOf(hex: string): readonly [a: number, b: number] {
  const r = linear(hex, 1)
  const g = linear(hex, 3)
  const b = linear(hex, 5)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

// Whether a six-digit hex is a grey: its OKLCH chroma under CONFIG.colour.greyChroma, the line the
// server's colour engine draws (lib/tokens/derive.ts).
export function isGreyHex(hex: string): boolean {
  return Math.hypot(...opponentsOf(hex)) < CONFIG.colour.greyChroma
}

// The hue the ramp's dark band takes from a colour (plan OD5 and 5.3): its OKLCH hue, in degrees,
// or null, the studio's own, for a grey, whose hue means nothing.
export function bandHueOfHex(hex: string): number | null {
  if (isGreyHex(hex)) return null
  const [a, b] = opponentsOf(hex)
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
}

// The hue the band takes from the answers: the chosen colour's once the colour question is
// reached, and null before it. A hovered colour leaves the band alone; only a choice moves it.
export function bandHueOf(answers: Answers, reached: number): number | null {
  const hex = reaches(reached, 'colours') ? brandHexFrom(answers.colours) : null
  return hex === null ? null : bandHueOfHex(hex)
}

type Tint = Readonly<{ l: number; maxC: number }>
type Glow = Readonly<{ l: number; minC: number }>

const HEX = 'var(--draft-hex)'
const { tintShare, glowHueShift, fillMaxC } = CONFIG.colour

// A surface or a text colour: a fixed lightness with a trace of the hue, capped; neutral before
// a colour is chosen.
function tint(house: boolean, { l, maxC }: Tint): string {
  return house
    ? `oklch(${String(l)} 0 0)`
    : `oklch(from ${HEX} ${String(l)} min(calc(c * ${String(tintShare)}), ${String(maxC)}) h)`
}

// The colour itself, its lightness held inside a band, and its chroma capped where the band
// carries text: pulled down into the fill band a bright colour leaves sRGB, and a browser clips
// it channel by channel into another hue where the server would lower its chroma
// (CONFIG.colour.fillMaxC).
function band([min, max]: readonly [number, number], maxC?: number): string {
  const c = maxC === undefined ? 'c' : `min(c, ${String(maxC)})`
  return `oklch(from ${HEX} clamp(${String(min)}, l, ${String(max)}) ${c} h)`
}

// A glow: the hue, or another angle, with at least this much chroma.
function glow({ l, minC }: Glow, hue = 'h'): string {
  return `oklch(from ${HEX} ${String(l)} max(c, ${String(minC)}) ${hue})`
}

// The draft's colours, the server's engine (lib/tokens/derive.ts) written as relative colours on
// --draft-hex, so a hover or a new code retints the draft without a render, and built from
// CONFIG.colour itself, so the two cannot drift (plan D11). Before a colour is chosen the draft
// is the house's neutrals: its call to action is ink, and only the studio's light has a hue. A
// grey keeps the studio's glows too, since its hue means nothing. The fill carries the surface's
// colour as its text in either scheme.
export function draftColours({
  hex,
  grey,
  scheme,
}: Pick<DraftModel, 'hex' | 'grey' | 'scheme'>): CSSProperties {
  const recipe = CONFIG.colour[scheme]
  const house = hex === null
  const ink = tint(house, recipe['on-surface'])
  const lit = !house && !grey
  return {
    '--d-surface': tint(house, recipe.surface),
    '--d-soft': tint(house, recipe['surface-muted']),
    '--d-line': tint(house, recipe.border),
    '--d-ink': ink,
    '--d-muted': tint(house, recipe['on-surface-muted']),
    '--d-brand': house ? tint(house, recipe.border) : band(recipe.brandBand),
    '--d-fill': house ? ink : band(recipe.fillBand, fillMaxC),
    '--d-glow': lit ? glow(recipe.glow) : 'var(--glow)',
    '--d-glow-2': lit
      ? glow(recipe.glowSecondary, `calc(h + ${String(glowHueShift)})`)
      : 'var(--glow-secondary)',
  } as CSSProperties
}

// How large the headline is set, by its length: three lines of 34 px hold about 45 characters
// in the desk frame, of 26 px about 70, and 24 px takes the rest, clamped at three lines with an
// ellipsis (start-draft.css); 24 rather than 20 so the sentence still reads at the smallest desk
// zoom.
const HEADLINE_STEPS = [45, 70] as const

type Headline = Readonly<{ text: string; size: 'l' | 'm' | 's' }>

// The headline: the business name once it is in, before it the sentence, and before either the
// note that says what will land there (null).
export function headlineOf({ company, sentence }: DraftModel): Headline | null {
  const text = company === '' ? sentence : company
  if (text === '') return null
  const [large, medium] = HEADLINE_STEPS
  return { text, size: text.length <= large ? 'l' : text.length <= medium ? 'm' : 's' }
}

// The draft's notes (plan 4.6 and 5.8): where the sentence lands, the name beside the mark once
// the sentence is in, the signature, the face the designs use when it cannot load here, and what
// the photos will be until the visitor's own replace them.
type NoteAt = 'headline' | 'mark' | 'sign' | 'face' | 'art'

// Whether the wordmark says where the business name will go.
export function awaitsName({ logo, company, sentence }: DraftModel): boolean {
  return logo === null && company === '' && sentence !== ''
}

// The notes that show: at most two at once (plan 5.2), the first two of those wanted in this
// order, so the picture's note is the first to yield and a note that stands for an answer never
// does. The first two cannot both be wanted: one needs the sentence and the other its absence.
// The picture's note also gives way to the signature, which would cover it in the phone's window.
export function notesOf(draft: DraftModel, faceMissing: boolean): ReadonlySet<NoteAt> {
  const signed = draft.first !== ''
  const wanted: readonly (readonly [NoteAt, boolean])[] = [
    ['headline', headlineOf(draft) === null],
    ['mark', awaitsName(draft)],
    ['sign', signed],
    ['face', faceMissing && draft.style !== null],
    ['art', draft.photos.length === 0 && !signed],
  ]
  return new Set(
    wanted
      .filter(([, shown]) => shown)
      .slice(0, 2)
      .map(([at]) => at),
  )
}

// The picture's note, for the look or before one is chosen.
export function artNote(style: VisualStyle | null): string {
  return style === null ? DRAFT_NOTES.photos : photosNote(style)
}

// The longest name the whisper sets, in graphemes as they are seen (plan 5.1 and 7.7): a longer
// one reads as a line of type rather than a wordmark, and falls under 3rem on most desks.
const WHISPER_MAX_GRAPHEMES = 24

// Latin letters with the marks, digits, spaces and punctuation any script shares: the display
// faces carry Latin only.
const LATIN = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]+$/u

type Whisper = Readonly<{ text: string; graphemes: number }>

// A name's length as it is seen, in graphemes. A browser without Intl.Segmenter (Firefox before
// 125, which Next 16 still serves) counts its UTF-16 units instead: never fewer, so the whisper
// is never set larger than it fits.
function graphemesIn(text: string): number {
  return typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text)].length
    : text.length
}

// The business name set large at the region's foot (plan 5.1), or null where it would not read:
// too long to fit at 3rem, or in a script the display faces do not carry.
export function whisperOf(company: string): Whisper | null {
  if (company === '' || !LATIN.test(company)) return null
  const graphemes = graphemesIn(company)
  return graphemes > WHISPER_MAX_GRAPHEMES ? null : { text: company, graphemes }
}
