import { AppError } from '@/lib/errors'

// Preset palettes for visitors with no brand colour of their own. These are visitor data, not
// site design tokens, so hex belongs here. Every value is dark enough to carry white text.
export const PALETTE_IDS = ['forest', 'ink', 'clay', 'plum'] as const

type PaletteId = (typeof PALETTE_IDS)[number]

type Palette = Readonly<{ id: PaletteId; label: string; hex: string }>

export const PALETTES: readonly Palette[] = [
  { id: 'forest', label: 'Forest', hex: '#2f6f4e' },
  { id: 'ink', label: 'Ink', hex: '#1e3a8a' },
  { id: 'clay', label: 'Clay', hex: '#9a3d1e' },
  { id: 'plum', label: 'Plum', hex: '#6b2d5b' },
]

export function paletteFor(id: PaletteId): Palette {
  const palette = PALETTES.find((candidate) => candidate.id === id)
  if (palette === undefined) throw new AppError(`Unknown palette: ${id}`)
  return palette
}
