import type { Metadata } from 'next'
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google'
import type { CSSProperties } from 'react'
import { Aurora } from '@/templates/t01-aurora'
import { KESTREL } from '@/templates/t01-aurora/example/content'

// The example brand's type: a display face with some character for the headlines and a plain
// one for everything else. A brand's own pair replaces them on the preview root.
const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' })
const body = Instrument_Sans({ subsets: ['latin'], display: 'swap' })

// Kestrel's token set, written by hand the way the tokens stage will one day derive one: the
// amber brand hue kept, surfaces tinted with it at low chroma, and every pair the template
// declares (AURORA_CONTRAST_PAIRS) at WCAG AA or better. The two glow hues are the aurora.
const TOKENS = {
  '--surface': '#0b0f1a',
  '--surface-muted': '#131a2b',
  '--on-surface': '#f4f5f9',
  '--on-surface-muted': '#a7adc0',
  '--border': '#262e44',
  '--accent': '#1a2238',
  '--brand': '#ffb067',
  '--brand-deeper': '#f59e4a',
  '--brand-deepest': '#e68a2e',
  '--on-brand': '#1b1005',
  '--glow': '#ff7a59',
  '--glow-secondary': '#7c5cff',
  '--scrim': '#05070d',
  '--on-scrim': '#ffffff',
  '--template-font-display': display.style.fontFamily,
  '--template-font-body': body.style.fontFamily,
} as CSSProperties

export const metadata: Metadata = {
  title: 'Aurora template, example',
  robots: { index: false, follow: false },
}

// The Aurora template with example content, for design review. Not linked from the site and
// not indexed; the examples gallery replaces it once the templates render from real briefs.
export default function AuroraExamplePage() {
  return (
    <div style={TOKENS}>
      <Aurora content={KESTREL} />
    </div>
  )
}
