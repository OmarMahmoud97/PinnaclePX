import { AppError } from '@/lib/errors'

// The visual styles a visitor can choose. Ids are the brief's vocabulary; labels are what the
// visitor reads. How each style is drawn belongs to the component that draws it.
export const STYLE_IDS = ['warm', 'minimal', 'bold', 'dark'] as const

export type VisualStyle = (typeof STYLE_IDS)[number]

type Style = Readonly<{ id: VisualStyle; label: string; detail: string }>

export const STYLES: readonly Style[] = [
  { id: 'warm', label: 'Warm and natural', detail: 'Daylight, people, texture.' },
  { id: 'minimal', label: 'Clean and minimal', detail: 'Space, calm, plain backgrounds.' },
  { id: 'bold', label: 'Bold and bright', detail: 'Strong colour and contrast.' },
  { id: 'dark', label: 'Dark and moody', detail: 'Deep backgrounds, light text.' },
]

export function styleFor(id: VisualStyle): Style {
  const style = STYLES.find((candidate) => candidate.id === id)
  if (style === undefined) throw new AppError(`Unknown style: ${id}`)
  return style
}
