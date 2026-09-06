import { FINAL_STAGE } from '@/lib/brief/example-brief'
import type { Answers } from '@/lib/brief/schema'

// The brand the How it works walkthrough paints: Fernbrook Gardens, a garden design and planting
// studio that does not exist. Invented so the section can show all five answers landing and a
// finished page without borrowing a client's, and labelled an example wherever it appears
// (components/sketch/captions.ts). Everything of the brand's is in this file and
// walkthrough-photos.ts, so renaming it is one change. Checked 6 September 2026: no UK trader of
// this name was found (docs/walkthrough-plan.md, section 3).
//
// The answers are typed as the form's own, and walkthrough-brand.test.ts holds them to its schema.
// The logo is a mark drawn from an icon rather than a file, the photos are the four in
// walkthrough-photos.ts, and the colour is the Forest preset, so the sketch shows the "or one of
// ours" path the hero never does.
export const WALKTHROUGH_ANSWERS: Answers = {
  description:
    'Fernbrook Gardens designs and plants gardens for homes and small hotels. From a courtyard to an acre, planted to look after itself.',
  name: '',
  company: 'Fernbrook Gardens',
  email: '',
  logo: { kind: 'file', id: 'fernbrook-mark', fileName: 'fernbrook-mark.svg', url: null },
  imagery: {
    style: 'warm',
    photos: [
      { id: 'fernbrook-garden', fileName: 'fernbrook-garden.webp', url: null },
      { id: 'fernbrook-design', fileName: 'fernbrook-design.webp', url: null },
      { id: 'fernbrook-planting', fileName: 'fernbrook-planting.webp', url: null },
      { id: 'fernbrook-aftercare', fileName: 'fernbrook-aftercare.webp', url: null },
    ],
  },
  colours: { kind: 'palette', paletteId: 'forest' },
}

// The stops the scroll can reach: empty, one per question, then the finished page.
export const EMPTY_STAGE = 0
export const BUILT_STAGE = FINAL_STAGE + 1

// The sketch's labels before and after the name lands.
export const WIRE_COPY = {
  ctaBefore: 'Get in touch',
  ctaAfter: 'Book a visit',
} as const

// Every word on the finished page. The paragraph is the brief's own sentence and is not repeated
// here. Placeholder marketing for an example business, never presented as anyone's site.
export const WALKTHROUGH_COPY = {
  // One line of the phone's width at the kicker's size and tracking.
  eyebrow: 'Garden design studio',
  headline: 'Gardens that grow with you.',
  cta: 'Book a garden visit',
  features: [
    { icon: 'design', title: 'Design' },
    { icon: 'planting', title: 'Planting' },
    { icon: 'aftercare', title: 'Aftercare' },
  ],
  footer: ['Privacy', 'Terms'],
} as const

export type WalkthroughIcon = (typeof WALKTHROUGH_COPY.features)[number]['icon']

// The kicker's colour. builtTintsFrom derives an accent as the brand hue's complement, which for
// a green is pink; a garden reads better against terracotta, so the brand names its own. The real
// colour engine chooses secondaries itself (lib/tokens/derive.ts).
export const WALKTHROUGH_ACCENT = 'oklch(0.6 0.13 45)'
