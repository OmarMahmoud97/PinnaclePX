// The clients' logos for the strip under the hero sketch: the work band's clients in its order,
// then the group behind four of them and the others the owner supplied.
//
// Every file in public/logos/ is drawn in one ink through its own alpha (app/_components/
// logo-marquee.tsx), so a white wordmark, a lime mark and a full-colour raster all sit as one
// quiet grey row on the hero. The files are the owner's originals (app/_images/logos/, 6 September
// 2026) with the artboard trimmed to the mark itself, so `width` and `height` here are the mark's
// own shape and the sizing rule below is not fooled by padding; Mvmnt's tile is dropped because
// under a mask it would be a solid block. Go Wild and TrvlWell have no mark yet and are left out
// rather than shown as type (owner, 6 September 2026): when a file arrives, trim it the same way
// and add a line here. The clients are real and shown with each one's permission
// (docs/claims-register.md).
export type ClientLogo = Readonly<{
  slug: string
  name: string
  src: string
  // The mark's own size. Only the ratio matters; it decides how big the logo is drawn.
  width: number
  height: number
  // A hand tweak for a mark that still reads too big or too small next to the rest. 1 leaves it.
  scale?: number
}>

export const LOGOS = {
  // What a screen reader hears in place of the strip.
  label: 'Companies we have designed and built for',
} as const

export const CLIENT_LOGOS: readonly ClientLogo[] = [
  { slug: 'vetpres', name: 'VetPres', src: '/logos/vetpres.svg', width: 399.5, height: 274.06 },
  { slug: 'withu', name: 'WithU', src: '/logos/withu.svg', width: 47.19, height: 40.19 },
  { slug: 'mvmnt', name: 'Mvmnt', src: '/logos/mvmnt.svg', width: 24.65, height: 29.54 },
  { slug: 'urunn', name: 'URUNN', src: '/logos/urunn.svg', width: 60.82, height: 40.24 },
  { slug: '10xu', name: '10XU', src: '/logos/10xu.svg', width: 63.87, height: 39.97 },
  // Heavy, round letters carry more weight than the rule allows for, so it is held a shade under
  // its shape; a wide, low wordmark next to tall marks needs most of that height back, though.
  { slug: 'sky', name: 'Sky', src: '/logos/sky.svg', width: 52.48, height: 32.21, scale: 0.98 },
  // PROVISIONAL NAMES. The owner supplied these two marks without saying whose they are (6
  // September 2026); the label is what the mark shows until the owner names the brand. The n's
  // circular tile is dropped, as Mvmnt's is. Both are solid squares, which read heavier than
  // their box says, so both are drawn smaller.
  { slug: 'n-mark', name: 'n', src: '/logos/n-mark.svg', width: 20.16, height: 20.16, scale: 0.82 },
  {
    slug: 'va-mark',
    name: 'VA',
    src: '/logos/va-mark.svg',
    width: 246.5,
    height: 248.5,
    scale: 0.84,
  },
]

// A wordmark four times wider than it is tall, drawn 32 px tall, is the size the rest are judged
// against.
const REFERENCE_RATIO = 4
const REFERENCE_HEIGHT = 32

// How far the drawn height follows the shape. At 0 every logo would be the same height, and a
// stacked mark would look tiny beside a long wordmark; at 0.5 every logo would cover the same
// area, and the stacked mark would tower over it. A little over a third sits where the eye reads
// them as the same size.
const SHAPE_PULL = 0.35

// Nothing is drawn wider than this, however long the wordmark: the strip has to hold them all.
const MAX_WIDTH = 168

// How big to draw one logo. A tall mark is given more height than a wide one, because the eye
// weighs the whole shape and not its height, and the width cap catches the longest wordmarks.
export function sizeFor(logo: ClientLogo): Readonly<{ width: number; height: number }> {
  const ratio = logo.width / logo.height
  const height = REFERENCE_HEIGHT * (REFERENCE_RATIO / ratio) ** SHAPE_PULL * (logo.scale ?? 1)
  const width = height * ratio
  const capped = width > MAX_WIDTH ? MAX_WIDTH / ratio : height
  return { width: Math.round(capped * ratio), height: Math.round(capped) }
}

// The tallest any logo is drawn, so the strip reserves its row before the files arrive.
export const LOGO_ROW_HEIGHT = Math.max(...CLIENT_LOGOS.map((logo) => sizeFor(logo).height))
