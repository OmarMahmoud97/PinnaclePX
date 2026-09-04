import type { Metadata } from 'next'
import { Bricolage_Grotesque, Instrument_Sans } from 'next/font/google'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme } from '@/lib/tokens/types'
import { Aurora } from '@/templates/t01-aurora'
import { AURORA_CONTRAST_PAIRS } from '@/templates/t01-aurora/copy-slots'
import { KESTREL } from '@/templates/t01-aurora/example/content'

// The example brand's type: a display face with some character for the headlines and a plain
// one for everything else. A brand's own pair replaces them on the preview root. Not preloaded:
// through the Aurora chunk both faces were preloaded on every preview page as well, where one
// of them is never used (verified on a production build, 4 September 2026).
const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap', preload: false })
const body = Instrument_Sans({ subsets: ['latin'], display: 'swap', preload: false })

// Kestrel's token set, derived the way the tokens stage derives one: the amber brand hue kept,
// surfaces tinted with it at low chroma, and every pair the template declares at WCAG AA or
// better. The two glow hues are the aurora. The fonts join the tokens on the same root.
// ?scheme=light shows the same brand on a light surface, for reviewing both polarities.
function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(deriveTokens('#f59e4a', scheme, AURORA_CONTRAST_PAIRS)),
    '--template-font-display': display.style.fontFamily,
    '--template-font-body': body.style.fontFamily,
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Aurora template, example',
  robots: { index: false, follow: false },
}

// The Aurora template with example content, for design review. Not linked from the site and
// not indexed; the examples gallery replaces it once the templates render from real briefs.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AuroraExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'light' ? 'light' : 'dark')}>
      <Aurora content={KESTREL} />
    </div>
  )
}
