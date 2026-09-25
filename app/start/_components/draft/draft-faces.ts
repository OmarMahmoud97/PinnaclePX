import { Bricolage_Grotesque, Fraunces, Manrope, Sora } from 'next/font/google'
import type { VisualStyle } from '@/lib/brief/styles'

// The display face each look's designs are set in (app/preview/_components/fonts.ts), for the
// draft's headline, wordmark and whisper (docs/start-page-journey-plan.md, 5.8 and OD7). Declared
// with the preview's own options, so the files are the same ones and a design opens warm. A
// module of its own, fetched by load-faces.ts once the visitor reaches the name and never from
// the skeleton, so /start's first scripts never carry it (scripts/bundle-budget.mjs, whose guard
// finds it by "Fraunces Fallback"). None is preloaded: each file comes when load-faces.ts asks.
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', preload: false })
const manrope = Manrope({ subsets: ['latin'], display: 'swap', preload: false })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap', preload: false })
const sora = Sora({ subsets: ['latin'], display: 'swap', preload: false })

export const FACES: Readonly<Record<VisualStyle, string>> = {
  warm: fraunces.style.fontFamily,
  minimal: manrope.style.fontFamily,
  bold: bricolage.style.fontFamily,
  dark: sora.style.fontFamily,
}
