import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Atlas } from '@/templates/t04-atlas'
import { ATLAS_CONTRAST_PAIRS } from '@/templates/t04-atlas/copy-slots'
import { KESTREL_ATLAS } from '@/templates/t04-atlas/example/content'

// The source's own colours as a token set: white behind and on its cards, #FAFAFA on its
// back-to-top link, gray-100 for its hovers, neutral-800 for its text, gray-700 for its
// paragraphs, #DDDDDD for its rules, #468ef9 and #0c66ee for its gradient and its borders, and
// the cyan and first blue of its header gradient as the glows. The source has no dark theme,
// so ?scheme=dark derives one from its blue the way the tokens stage would.
const LIGHT: TokenSet = {
  surface: '#ffffff',
  'surface-muted': '#fafafa',
  'on-surface': '#262626',
  'on-surface-muted': '#374151',
  border: '#dddddd',
  accent: '#f3f4f6',
  brand: '#468ef9',
  'brand-deeper': '#0c66ee',
  'brand-deepest': '#0a56c9',
  'on-brand': '#ffffff',
  glow: '#0cd3ff',
  'glow-secondary': '#3984f4',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

// The source loads Poppins from Google Fonts in every weight; the page uses four.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
})

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(
      scheme === 'dark' ? deriveTokens('#0c66ee', 'dark', ATLAS_CONTRAST_PAIRS) : LIGHT,
    ),
    '--template-font-display': poppins.style.fontFamily,
    '--template-font-body': poppins.style.fontFamily,
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Atlas template, example',
  robots: { index: false, follow: false },
}

// The Atlas template with example content, for design review against its source. Not linked
// and not indexed. Light, as the source is; ?scheme=dark for a derived dark set.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AtlasExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'dark' ? 'dark' : 'light')}>
      <Atlas content={KESTREL_ATLAS} />
    </div>
  )
}
