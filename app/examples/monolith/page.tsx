import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { tokenStyle } from '@/lib/tokens/css'
import type { Scheme, TokenSet } from '@/lib/tokens/types'
import { Monolith } from '@/templates/t02-monolith'
import { KESTREL_MONOLITH } from '@/templates/t02-monolith/example/content'

// The source's own theme (its App.css, the "Green theme" block) as token sets, so the example
// renders in the source's colours: hsl(20 14.3% 4.1%) behind, hsl(24 9.8% 10%) cards,
// hsl(142.1 70.6% 45.3%) primary, and so on, converted to hex. The two glow tokens are the pink
// and cyan of the source's headline gradients. The tokens stage derives a set like this from a
// brand's own colour; this one is written by hand from the source.
const DARK: TokenSet = {
  surface: '#0c0a09',
  'surface-muted': '#27272a',
  'on-surface': '#f2f2f2',
  'on-surface-muted': '#a1a1aa',
  border: '#27272a',
  accent: '#1c1917',
  brand: '#22c55e',
  'brand-deeper': '#22c55e',
  'brand-deepest': '#15803d',
  'on-brand': '#052e16',
  glow: '#d247bf',
  'glow-secondary': '#1fc0f1',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

const LIGHT: TokenSet = {
  surface: '#ffffff',
  'surface-muted': '#f4f4f5',
  'on-surface': '#09090b',
  'on-surface-muted': '#71717a',
  border: '#e4e4e7',
  accent: '#ffffff',
  brand: '#16a34a',
  'brand-deeper': '#16a34a',
  'brand-deepest': '#15803d',
  'on-brand': '#fff1f2',
  glow: '#d247bf',
  'glow-secondary': '#1fc0f1',
  scrim: '#000000',
  'on-scrim': '#ffffff',
}

// The source sets no web font: Tailwind's default sans stack, the system's own face.
const SYSTEM =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'

function tokensFor(scheme: Scheme): CSSProperties {
  return {
    ...tokenStyle(scheme === 'light' ? LIGHT : DARK),
    '--template-font-display': SYSTEM,
    '--template-font-body': SYSTEM,
  } as CSSProperties
}

export const metadata: Metadata = {
  title: 'Monolith template, example',
  robots: { index: false, follow: false },
}

// The Monolith template with example content, for design review against its source. Not
// linked and not indexed. Dark, as the source's screenshots are; ?scheme=light for its light
// theme.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function MonolithExamplePage({ searchParams }: Props) {
  const { scheme } = await searchParams
  return (
    <div style={tokensFor(scheme === 'light' ? 'light' : 'dark')}>
      <Monolith content={KESTREL_MONOLITH} />
    </div>
  )
}
