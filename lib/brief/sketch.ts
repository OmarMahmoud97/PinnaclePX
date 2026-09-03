import { toSixDigitHex } from '@/lib/brief/hex'
import { paletteFor } from '@/lib/brief/palettes'
import type { ColoursAnswer } from '@/lib/brief/schema'

// Everything the live sketch shows is computed here from the visitor's own answers. Nothing is
// invented: an empty answer produces an empty string, and the sketch draws a grey bar instead.
// The description needs no helper. It goes into the sketch's paragraph exactly as typed and CSS
// clamps it to three lines, because a paragraph of any length never fits a headline slot.

// Up to two initials for the placeholder mark next to the wordmark.
export function initialsFrom(company: string): string {
  return company
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

// A browser-tab style label: lowercase, hyphenated, ASCII letters and digits only.
export function tabLabelFrom(company: string): string {
  const label = company
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return label === '' ? 'your-company' : label
}

// The brand colour the visitor has chosen, as six-digit hex, or null before they choose one.
export function brandHexFrom(colours: ColoursAnswer): string | null {
  return colours.kind === 'palette' ? paletteFor(colours.paletteId).hex : toSixDigitHex(colours.hex)
}

type Scheme = 'light' | 'dark'

type Tints = Readonly<{ strong: string; onStrong: string; soft: string; glow: string }>

// Colours derived from one hex with the hue kept and only lightness and chroma moved, which is
// the rule the real colour engine follows. "strong" is clamped dark enough to carry white text on
// a light page, or light enough to carry dark text on a dark one. Before a colour is chosen, the
// sketch stays grey.
export function tintsFrom(hex: string | null, scheme: Scheme): Tints {
  const dark = scheme === 'dark'
  const onStrong = dark ? 'var(--scrim)' : 'var(--on-brand)'
  if (hex === null) {
    return {
      strong: dark ? 'var(--surface)' : 'var(--on-surface-muted)',
      onStrong,
      soft: dark ? 'color-mix(in oklab, var(--surface) 12%, transparent)' : 'var(--surface-muted)',
      glow: 'transparent',
    }
  }
  return {
    strong: dark
      ? `oklch(from ${hex} clamp(0.68, l, 0.8) c h)`
      : `oklch(from ${hex} clamp(0.32, l, 0.52) c h)`,
    onStrong,
    soft: dark
      ? `oklch(from ${hex} 0.3 calc(c * 0.5) h)`
      : `oklch(from ${hex} 0.95 calc(c * 0.35) h)`,
    glow: `oklch(from ${hex} 0.82 calc(c * 0.7) h / 0.7)`,
  }
}

type BuiltTints = Readonly<{
  bg: string
  ink: string
  muted: string
  accent: string
  footer: string
}>

// The colours a finished page takes from the same one hex, by the same rule: the ground is
// near-white with a trace of the hue, headings keep the hue a step lighter than the button, body
// copy is the hue at half its chroma, the footer is the hue deep, and the accent for a kicker is
// the hue's warm complement. Hue angles past 360 wrap, as CSS defines.
export function builtTintsFrom(hex: string): BuiltTints {
  return {
    bg: `oklch(from ${hex} 0.975 calc(c * 0.08) h)`,
    ink: `oklch(from ${hex} clamp(0.42, l, 0.58) c h)`,
    muted: `oklch(from ${hex} 0.5 calc(c * 0.5) h)`,
    accent: `oklch(from ${hex} 0.66 0.14 calc(h + 180))`,
    footer: `oklch(from ${hex} 0.3 calc(c * 0.8) h)`,
  }
}
