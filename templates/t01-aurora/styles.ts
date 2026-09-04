import type { CSSProperties } from 'react'

// The template's shared recipes, so every section sets its column, its type and its buttons the
// same way. Class strings stay literal so Tailwind can see them.

export const container = 'mx-auto w-full max-w-6xl px-6 md:px-10'

export const sectionTitle = 'font-display text-title font-semibold tracking-tight text-balance'
export const sectionLead = 'mt-4 max-w-2xl text-lead text-pretty text-on-surface-muted'
export const itemTitle = 'font-display text-heading font-semibold'
export const itemBody = 'mt-2 text-body text-pretty text-on-surface-muted'

const BUTTON =
  'inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-base font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-(--motion-tap) ease-standard outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-safe:active:scale-[0.98]'

// The filled button carries on-brand on brand-deeper; the quiet one borrows the text colour.
export const button = {
  primary: `${BUTTON} bg-brand-deeper text-on-brand hover:bg-brand-deepest`,
  secondary: `${BUTTON} border border-on-surface/15 text-on-surface hover:border-on-surface/30 hover:bg-on-surface/5`,
  small: 'h-10 px-5 text-sm',
} as const

export const textLink =
  'rounded-sm underline-offset-4 transition-colors duration-(--motion-tap) outline-none hover:text-on-surface hover:underline focus-visible:ring-2 focus-visible:ring-brand-deeper'

// The wait before a part of the hero rises, as the custom property aurora.css multiplies.
export function enter(index: number): CSSProperties {
  return { '--i': index } as CSSProperties
}
