import type { CSSProperties } from 'react'
import type { Answers } from '@/lib/brief/schema'
import { brandHexFrom, initialsFrom, tintsFrom } from '@/lib/brief/sketch'
import { styleFor, type VisualStyle } from '@/lib/brief/styles'

// Which questions have been reached. The style paints in from question 4 and the colour from
// question 5, so a default answer never shows before the visitor has seen its question.
const STYLE_STAGE = 4
const COLOUR_STAGE = 5

// The sketch's own surfaces. The dark style swaps them, so choosing it turns the page dark.
const LIGHT_SCHEME = {
  '--sketch-bg': 'var(--surface)',
  '--sketch-bg-muted': 'var(--surface-muted)',
  '--sketch-fg': 'var(--on-surface)',
  '--sketch-muted': 'var(--on-surface-muted)',
  '--sketch-line': 'var(--border)',
  '--sketch-dash': 'color-mix(in oklab, var(--on-surface-muted) 35%, transparent)',
}
const DARK_SCHEME = {
  '--sketch-bg': 'var(--scrim)',
  '--sketch-bg-muted': 'color-mix(in oklab, var(--surface) 6%, var(--scrim))',
  '--sketch-fg': 'var(--surface)',
  '--sketch-muted': 'color-mix(in oklab, var(--surface) 65%, transparent)',
  '--sketch-line': 'color-mix(in oklab, var(--surface) 14%, transparent)',
  '--sketch-dash': 'color-mix(in oklab, var(--surface) 30%, transparent)',
}

// Object URLs of the pictures the visitor has added, held by the flow rather than the answers.
export type SketchFiles = Readonly<{ logo: string | null; photos: readonly string[] }>

export type SketchModel = Readonly<{
  company: string
  description: string
  initials: string
  logo: string | null
  imageStyle: VisualStyle | null
  imageLabel: string | null
  photos: readonly string[]
  // Every --sketch-* variable, for the element that wraps the frames and their glow.
  vars: CSSProperties
}>

// Everything both frames draw, derived once from the answers, the question reached, and the
// pictures added.
export function sketchModelFrom(answers: Answers, stage: number, files: SketchFiles): SketchModel {
  const company = answers.company.trim()
  const styled = stage >= STYLE_STAGE
  const imageStyle = styled ? answers.imagery.style : null
  const dark = imageStyle === 'dark'
  const tints = tintsFrom(
    stage >= COLOUR_STAGE ? brandHexFrom(answers.colours) : null,
    dark ? 'dark' : 'light',
  )
  return {
    company,
    description: answers.description.trim(),
    initials: initialsFrom(company),
    logo: files.logo,
    imageStyle,
    imageLabel: imageStyle === null ? null : styleFor(imageStyle).label,
    photos: styled ? files.photos : [],
    vars: {
      ...(dark ? DARK_SCHEME : LIGHT_SCHEME),
      '--sketch-strong': tints.strong,
      '--sketch-on-strong': tints.onStrong,
      '--sketch-soft': tints.soft,
      '--sketch-glow': tints.glow,
    } as CSSProperties,
  }
}
