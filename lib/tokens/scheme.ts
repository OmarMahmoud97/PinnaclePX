import type { VisualStyle } from '@/lib/brief/styles'
import type { LogoPolarity } from '@/lib/logo/types'
import type { Scheme } from '@/lib/tokens/types'

// Which surface a brand's page sits on. The visitor's choice of the dark style decides it
// outright. Otherwise the logo decides: light artwork needs a dark surface to be seen, dark
// artwork a light one, and mixed artwork (or a wordmark) takes the light default.
export function schemeFor(style: VisualStyle, polarity: LogoPolarity): Scheme {
  if (style === 'dark') return 'dark'
  return polarity === 'light-artwork' ? 'dark' : 'light'
}
