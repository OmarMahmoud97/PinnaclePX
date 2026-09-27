// Each colour Cal.com's calendar paints with, and the site token it takes (app/globals.css). The
// calendar opens in Cal.com's light theme on the sheet's white card, never its dark one on the
// ink, so it takes the light set: the brand fill that carries white (5.93:1) for the chosen day
// and the confirm button, the page's text and muted text, the wash for the open days and a hover,
// the deeper wash for the pressed ones, and the page's hairline. The outline Cal.com draws round
// its whole booker takes the card's own white, so the calendar sits on the card rather than in a
// box inside it (checked against the live embed, 27 September 2026).
const CAL_TOKENS = {
  'cal-border-booker': '--surface',
  'cal-brand': '--brand-deeper',
  'cal-brand-emphasis': '--brand-deepest',
  'cal-brand-text': '--on-brand',
  'cal-text': '--on-surface',
  'cal-text-emphasis': '--on-surface',
  'cal-text-subtle': '--on-surface-muted',
  'cal-text-muted': '--on-surface-muted',
  'cal-bg': '--surface',
  'cal-bg-muted': '--surface-wash',
  'cal-bg-subtle': '--surface-wash',
  'cal-bg-emphasis': '--surface-wash-deep',
  'cal-border-emphasis': '--surface-wash-deep',
  'cal-border': '--border',
  'cal-border-subtle': '--border',
} as const

// The calendar's light colours from the site's tokens as the page has them, read through `read`
// (the root's computed value of a token), so a retuned token moves the calendar with it and no
// colour is written twice. A token that reads empty is left to Cal.com's own colour rather than
// sent as a blank that would clear it.
export function calThemeFrom(read: (token: string) => string): Record<string, string> {
  const theme: Record<string, string> = {}
  for (const [variable, token] of Object.entries(CAL_TOKENS)) {
    const value = read(token).trim()
    if (value !== '') theme[variable] = value
  }
  return theme
}
