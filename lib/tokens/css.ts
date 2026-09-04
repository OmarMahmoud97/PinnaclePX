import type { CSSProperties } from 'react'
import { TOKEN_NAMES, type TokenSet } from '@/lib/tokens/types'

// The token set as the CSS variables app/globals.css maps to utilities, for the style attribute
// of a preview root. Setting them on one element recolours every template under it.
export function tokenStyle(tokens: TokenSet): CSSProperties {
  return Object.fromEntries(TOKEN_NAMES.map((name) => [`--${name}`, tokens[name]]))
}
