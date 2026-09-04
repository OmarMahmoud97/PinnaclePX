import {
  Bricolage_Grotesque,
  DM_Sans,
  Fraunces,
  Instrument_Sans,
  Inter,
  Manrope,
  Sora,
} from 'next/font/google'
import type { CSSProperties } from 'react'
import type { VisualStyle } from '@/lib/brief/styles'

// A brand's type is two families chosen by the style the visitor picked, never by a model. Each
// pair is a display face with some character and a plain body face. next/font needs every call
// at module scope with literal options, so the four pairs are declared here and picked below.
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap' })
const instrumentSans = Instrument_Sans({ subsets: ['latin'], display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], display: 'swap' })
const inter = Inter({ subsets: ['latin'], display: 'swap' })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap' })
const sora = Sora({ subsets: ['latin'], display: 'swap' })

const PAIRS = {
  warm: { display: fraunces, body: instrumentSans },
  minimal: { display: manrope, body: inter },
  bold: { display: bricolage, body: dmSans },
  dark: { display: sora, body: inter },
} as const satisfies Record<VisualStyle, unknown>

// The two variables app/globals.css maps to font-display and font-body, for the preview root.
export function typeStyle(style: VisualStyle): CSSProperties {
  const pair = PAIRS[style]
  return {
    '--template-font-display': pair.display.style.fontFamily,
    '--template-font-body': pair.body.style.fontFamily,
  } as CSSProperties
}
