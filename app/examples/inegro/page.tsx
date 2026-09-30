import type { Metadata } from 'next'
import { Albert_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Inegro } from '@/templates/t09-inegro'
import { INEGRO_CONTRAST_PAIRS } from '@/templates/t09-inegro/copy-slots'
import { KESTREL_INEGRO } from '@/templates/t09-inegro/example/content'

// The source's own colours as a token set: its night violet behind and white on it, its grey
// for the names not open in the list, its purple as the brand, the fill of its buttons and its
// headline's first word, with white on it; its blue and green as the two glows. Text over its
// photographs sat on the page's own colour washed down the picture, so the scrim is that too.
// The source had no light theme, so ?scheme=light derives one from its purple the way the tokens
// stage would, with the palette derived too.
const DARK: TokenSet = {
  surface: '#0a0319',
  'surface-muted': '#1b1430',
  'on-surface': '#ffffff',
  'on-surface-muted': '#66697d',
  border: '#ffffff',
  accent: '#1b1430',
  brand: '#ab40ff',
  'brand-deeper': '#ab40ff',
  'brand-deepest': '#9a2cf0',
  'on-brand': '#ffffff',
  glow: '#43caff',
  'glow-secondary': '#00bcab',
  scrim: '#0a0319',
  'on-scrim': '#ffffff',
}

// The source's four other hues, which the template derives from the tokens for a real brand:
// its peach and yellow ribbons, its lilac and sand boxes, and its blue and green buttons with
// the ink and the white on them.
const PALETTE = {
  '--inegro-set-peach': '#ff7f61',
  '--inegro-set-yellow': '#ffed14',
  '--inegro-set-lilac': '#d9dbf2',
  '--inegro-set-sand': '#d5cdb8',
  '--inegro-set-button-2': '#43caff',
  '--inegro-set-on-button-2': '#0a0319',
  '--inegro-set-button-3': '#00bcab',
  '--inegro-set-on-button-3': '#ffffff',
}

// The source's two cuts of Syne, from its own files (OFL, THIRD_PARTY_NOTICES.md): Google's
// Syne lacks the stylistic set the source turns on for every heading, and sets its medium cut a
// few pixels narrower. Its body face is Albert Sans at 400, from Google as the source loaded it.
// Neither is preloaded, as the other examples load theirs.
const syne = localFont({
  src: [
    { path: './syne-regular.woff2', weight: '400' },
    { path: './syne-medium.woff2', weight: '500' },
  ],
  display: 'swap',
  preload: false,
})
const albert = Albert_Sans({ subsets: ['latin'], weight: '400', display: 'swap', preload: false })

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(
      scheme === 'light' ? deriveTokens('#ab40ff', 'light', INEGRO_CONTRAST_PAIRS) : DARK,
    ),
    ...(scheme === 'light' ? {} : PALETTE),
    '--template-font-display': syne.style.fontFamily,
    '--template-font-body': albert.style.fontFamily,
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Inegro template, example',
  robots: { index: false, follow: false },
}

// The Inegro template with example content, for design review against its source. Not linked
// and not indexed. Dark, as the source is; ?scheme=light for a derived light set.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function InegroExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'light' ? 'light' : 'dark')}>
      <Inegro content={KESTREL_INEGRO} />
    </div>
  )
}
