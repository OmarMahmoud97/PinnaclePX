import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import type { CSSProperties } from 'react'
import { typeStyle } from '@/app/preview/_components/fonts'
import { tokenStyle } from '@/lib/tokens/css'
import { deriveTokens } from '@/lib/tokens/derive'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Lucent } from '@/templates/t10-lucent'
import { LUCENT_CONTRAST_PAIRS } from '@/templates/t10-lucent/copy-slots'
import { SUBSCRR_LUCENT } from '@/templates/t10-lucent/example/content'

// The source's own colours as token sets (its stylesheet's :root and its dark theme, which its
// clock turned on from eight in the evening to five in the morning): its warm paper and second
// paper, its white cards, its ink and grey, its orange as the brand and as the fill of its
// buttons with white on it, its peach and periwinkle as the two glows, and its near-black footer
// as the scrim with its off-white on it.
const LIGHT: TokenSet = {
  surface: '#f4f2ec',
  'surface-muted': '#eae6dc',
  'on-surface': '#1a1712',
  'on-surface-muted': '#7c766c',
  border: '#dedcd6',
  accent: '#ffffff',
  brand: '#ff2500',
  'brand-deeper': '#ff2500',
  'brand-deepest': '#ff2500',
  'on-brand': '#ffffff',
  glow: '#ffc7a0',
  'glow-secondary': '#aec4f7',
  scrim: '#14141a',
  'on-scrim': '#f4f4f6',
}

// Its dark theme: near-black paper and cards, near-white ink, its grey as white at half (so it reads
// a shade lighter on a card than on the page, as the source's did), and its footer at the cards'
// black.
const DARK: TokenSet = {
  surface: '#0a0a0a',
  'surface-muted': '#161616',
  'on-surface': '#f5f5f5',
  'on-surface-muted': 'rgba(255, 255, 255, 0.5)',
  border: '#1e1e1e',
  accent: '#141414',
  brand: '#ff2500',
  'brand-deeper': '#ff2500',
  'brand-deepest': '#ff2500',
  'on-brand': '#ffffff',
  glow: '#2a160b',
  'glow-secondary': '#6c6c6c',
  scrim: '#141414',
  'on-scrim': '#f4f4f6',
}

// The source's other colours, which the template derives from the tokens for a real brand: the
// periwinkle of its small capitals (white at half in the dark), the black of its one dark card,
// the peach of the page's tint, pure white for its glass and highlights, the dimmer body text of
// three blocks, the grey of its footer's small text, its orange as it stood on its near-black, its lines as the ink at a tenth (white at 8% in the dark), and, in the dark, its
// grain, its bar's glass, its premium plan's wash and its feature pictures lifted into tiles. The
// phone keeps the source's own frame.
const PALETTE: Readonly<Record<Scheme, Readonly<Record<string, string>>>> = {
  light: {
    '--lucent-set-eyebrow': '#4c63c7',
    '--lucent-set-eyebrow-night': '#aec4f7',
    '--lucent-set-night': '#000000',
    '--lucent-set-tint': '#ffc7a0',
    '--lucent-set-light': '#ffffff',
    '--lucent-set-dim': 'rgba(20, 20, 22, 0.62)',
    '--lucent-set-line': 'rgba(26, 23, 18, 0.1)',
    '--lucent-set-plan-pro': 'linear-gradient(180deg, #ffffff, #fff7f2)',
    '--lucent-set-footer-dim': '#9a9ba3',
    '--lucent-set-orange-night': '#ff2500',
    '--lucent-set-frame-filter': 'none',
    '--lucent-set-frame-tint': '0',
  },
  dark: {
    '--lucent-set-eyebrow': 'rgba(255, 255, 255, 0.5)',
    '--lucent-set-eyebrow-night': 'rgba(255, 255, 255, 0.4)',
    '--lucent-set-night': '#000000',
    '--lucent-set-tint': '#2a160b',
    '--lucent-set-light': '#ffffff',
    '--lucent-set-dim': 'rgba(255, 255, 255, 0.55)',
    '--lucent-set-line': 'rgba(255, 255, 255, 0.08)',
    '--lucent-set-plan-pro': 'linear-gradient(180deg, #161616, #1a110c)',
    '--lucent-set-grain-blend': 'overlay',
    '--lucent-set-grain-op': '0.22',
    '--lucent-set-nav-tint': 'rgba(16, 16, 16, 0.45)',
    '--lucent-set-nav-tint-scrolled': 'rgba(14, 14, 14, 0.75)',
    '--lucent-set-nav-sheen-a': 'rgba(255, 255, 255, 0.07)',
    '--lucent-set-nav-sheen-b': 'rgba(255, 255, 255, 0.04)',
    '--lucent-set-nav-edge-a': 'rgba(255, 255, 255, 0.25)',
    '--lucent-set-nav-edge-b': 'rgba(255, 255, 255, 0.14)',
    '--lucent-set-tiles': '1',
    '--lucent-set-footer-dim': '#9a9ba3',
    '--lucent-set-orange-night': '#ff2500',
    '--lucent-set-frame-filter': 'none',
    '--lucent-set-frame-tint': '0',
  },
}

// The source's two families, from Google as it loaded them: Inter for its text, its headings and
// its buttons, Inter Tight for its statement and its form's heading. Neither is preloaded, as the
// other examples load theirs.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: false,
})
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
  preload: false,
})

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(scheme === 'dark' ? DARK : LIGHT),
    ...PALETTE[scheme],
    '--template-font-display': inter.style.fontFamily,
    '--template-font-body': inter.style.fontFamily,
    '--lucent-set-tight': interTight.style.fontFamily,
  } as CSSProperties
}

// A brand's page, for review of the template as the pipeline renders it: the tokens derived from
// one brand colour the way the tokens stage derives them, a pair of the pipeline's own faces, and
// none of the source's palette, so every colour above is the template's own derivation.
const BRAND = '#0f766e'

function brandTokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(deriveTokens(BRAND, scheme, LUCENT_CONTRAST_PAIRS)),
    ...typeStyle('minimal'),
  }
}

export const metadata: Metadata = {
  title: 'Lucent template, example',
  robots: { index: false, follow: false },
}

// The Lucent template with the source's own content, for design review against it. Not linked
// and not indexed. Light, as the source is by day; ?scheme=dark for its night theme; ?scheme=brand
// and ?scheme=brand-dark for a brand's derived colours and type.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

function styleFor(scheme: string | string[] | undefined): CSSProperties {
  if (scheme === 'brand') return brandTokensFor('light')
  if (scheme === 'brand-dark') return brandTokensFor('dark')
  return tokensFor(scheme === 'dark' ? 'dark' : 'light')
}

export default async function LucentExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={styleFor(scheme)}>
      <Lucent content={SUBSCRR_LUCENT} />
    </div>
  )
}
