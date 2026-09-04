import type { SlotImage, TemplateLogo } from '@/lib/copy-slots/assets'
import { type CopySlot, type SlotViolation, slotViolation } from '@/lib/copy-slots/validate'
import type { ContrastPair } from '@/lib/tokens/types'

// Everything Aurora renders comes through this one object: every word, link and picture. The
// pipeline fills it from the brief and the copy stage; the example in ./example fills it by
// hand. The component itself holds no copy, so a new brand is a new content object.

export type AuroraLink = Readonly<{ label: string; href: string }>

// The pictures are the shapes the pipeline hands every template (lib/copy-slots/assets.ts). An
// image is null where a slot is optional: the section then draws light instead.
export type AuroraImage = SlotImage
type AuroraLogo = TemplateLogo

type AuroraFeature = Readonly<{ title: string; body: string }>
type AuroraStep = Readonly<{ title: string; body: string }>
type AuroraLinkGroup = Readonly<{ heading: string; links: readonly AuroraLink[] }>

export type Three<T> = readonly [T, T, T]

export type AuroraContent = Readonly<{
  brand: Readonly<{ name: string; legalName: string; tagline: string; logo: AuroraLogo }>
  nav: Readonly<{ links: readonly AuroraLink[]; cta: AuroraLink }>
  hero: Readonly<{
    headline: string
    subhead: string
    primary: AuroraLink
    secondary: AuroraLink
    reassurance: string
    // The product frame that rises out of the light: a screen title and three rows, in the
    // brand's own words, so the illustration is of this product and not of software in general.
    frame: Readonly<{ title: string; rows: Three<string> }>
    image: AuroraImage | null
  }>
  features: Readonly<{ title: string; lead: string; items: Three<AuroraFeature> }>
  steps: Readonly<{ title: string; lead: string; items: Three<AuroraStep> }>
  // One sentence from the company about why it exists, set large over the photograph.
  statement: Readonly<{ text: string; image: AuroraImage | null }>
  cta: Readonly<{ headline: string; body: string; action: AuroraLink; reassurance: string }>
  footer: Readonly<{ groups: readonly AuroraLinkGroup[] }>
}>

// Character limits per text slot. The layout is designed for these ranges: a headline at the
// maximum still fits three lines at the display size on a phone, a feature body four lines.
export const AURORA_SLOTS = {
  'brand.name': { min: 2, max: 24 },
  'brand.legalName': { min: 2, max: 60 },
  'brand.tagline': { min: 30, max: 120 },
  'nav.links[].label': { min: 3, max: 18 },
  'nav.cta.label': { min: 4, max: 22 },
  'hero.headline': { min: 18, max: 60 },
  'hero.subhead': { min: 60, max: 190 },
  'hero.primary.label': { min: 4, max: 22 },
  'hero.secondary.label': { min: 4, max: 22 },
  'hero.reassurance': { min: 20, max: 110 },
  'hero.frame.title': { min: 3, max: 16 },
  'hero.frame.rows[]': { min: 8, max: 40 },
  'features.title': { min: 18, max: 60 },
  'features.lead': { min: 40, max: 170 },
  'features.items[].title': { min: 6, max: 32 },
  'features.items[].body': { min: 60, max: 190 },
  'steps.title': { min: 18, max: 60 },
  'steps.lead': { min: 40, max: 170 },
  'steps.items[].title': { min: 6, max: 32 },
  'steps.items[].body': { min: 60, max: 190 },
  'statement.text': { min: 60, max: 180 },
  'cta.headline': { min: 18, max: 60 },
  'cta.body': { min: 40, max: 190 },
  'cta.action.label': { min: 4, max: 22 },
  'cta.reassurance': { min: 20, max: 110 },
  'footer.groups[].heading': { min: 3, max: 18 },
  'footer.groups[].links[].label': { min: 3, max: 24 },
} as const satisfies Record<string, CopySlot>

// How many of each list the layout holds: the header has room for four links beside the button,
// the footer for two link groups beside the brand block.
const AURORA_COUNTS = {
  'nav.links': { min: 2, max: 4 },
  'footer.groups': { min: 1, max: 2 },
  'footer.groups[].links': { min: 2, max: 5 },
} as const satisfies Record<string, CopySlot>

// Every text-on-background pair the template paints, for the contrast solver. brand is used for
// light and lines only; brand-deeper is the one brand colour that carries text or sits under it.
export const AURORA_CONTRAST_PAIRS: readonly ContrastPair[] = [
  { text: 'on-surface', background: 'surface' },
  { text: 'on-surface-muted', background: 'surface' },
  { text: 'on-surface', background: 'surface-muted' },
  { text: 'on-surface-muted', background: 'surface-muted' },
  { text: 'brand-deeper', background: 'surface' },
  { text: 'brand-deeper', background: 'surface-muted' },
  { text: 'on-brand', background: 'brand-deeper' },
  { text: 'on-brand', background: 'brand-deepest' },
  { text: 'on-scrim', background: 'scrim' },
]

type Slot = keyof typeof AURORA_SLOTS
type Check = readonly [slot: Slot, path: string, text: string]

// The path of one item in a list, for the violation report: nav.links[2].label.
function at(list: string, index: number, field = ''): string {
  return `${list}[${String(index)}]${field}`
}

function countViolation(slot: keyof typeof AURORA_COUNTS, path: string, count: number) {
  const { min, max } = AURORA_COUNTS[slot]
  return count >= min && count <= max ? [] : [{ slot: path, length: count, min, max }]
}

// Every slot and count in a content object that is outside its limits. Empty means it fits.
export function auroraViolations(content: AuroraContent): SlotViolation[] {
  const { brand, nav, hero, features, steps, statement, cta, footer } = content
  const checks: Check[] = [
    ['brand.name', 'brand.name', brand.name],
    ['brand.legalName', 'brand.legalName', brand.legalName],
    ['brand.tagline', 'brand.tagline', brand.tagline],
    ...nav.links.map((link, i): Check => [
      'nav.links[].label',
      at('nav.links', i, '.label'),
      link.label,
    ]),
    ['nav.cta.label', 'nav.cta.label', nav.cta.label],
    ['hero.headline', 'hero.headline', hero.headline],
    ['hero.subhead', 'hero.subhead', hero.subhead],
    ['hero.primary.label', 'hero.primary.label', hero.primary.label],
    ['hero.secondary.label', 'hero.secondary.label', hero.secondary.label],
    ['hero.reassurance', 'hero.reassurance', hero.reassurance],
    ['hero.frame.title', 'hero.frame.title', hero.frame.title],
    ...hero.frame.rows.map((row, i): Check => ['hero.frame.rows[]', at('hero.frame.rows', i), row]),
    ['features.title', 'features.title', features.title],
    ['features.lead', 'features.lead', features.lead],
    ...features.items.flatMap((item, i): Check[] => [
      ['features.items[].title', at('features.items', i, '.title'), item.title],
      ['features.items[].body', at('features.items', i, '.body'), item.body],
    ]),
    ['steps.title', 'steps.title', steps.title],
    ['steps.lead', 'steps.lead', steps.lead],
    ...steps.items.flatMap((item, i): Check[] => [
      ['steps.items[].title', at('steps.items', i, '.title'), item.title],
      ['steps.items[].body', at('steps.items', i, '.body'), item.body],
    ]),
    ['statement.text', 'statement.text', statement.text],
    ['cta.headline', 'cta.headline', cta.headline],
    ['cta.body', 'cta.body', cta.body],
    ['cta.action.label', 'cta.action.label', cta.action.label],
    ['cta.reassurance', 'cta.reassurance', cta.reassurance],
    ...footer.groups.flatMap((group, g): Check[] => [
      ['footer.groups[].heading', at('footer.groups', g, '.heading'), group.heading],
      ...group.links.map((link, l): Check => [
        'footer.groups[].links[].label',
        at(at('footer.groups', g, '.links'), l, '.label'),
        link.label,
      ]),
    ]),
  ]
  const texts = checks.flatMap(([slot, path, text]) => {
    const violation = slotViolation(path, text, AURORA_SLOTS[slot])
    return violation === null ? [] : [violation]
  })
  const counts = [
    ...countViolation('nav.links', 'nav.links', nav.links.length),
    ...countViolation('footer.groups', 'footer.groups', footer.groups.length),
    ...footer.groups.flatMap((group, g) =>
      countViolation('footer.groups[].links', at('footer.groups', g, '.links'), group.links.length),
    ),
  ]
  return [...texts, ...counts]
}
