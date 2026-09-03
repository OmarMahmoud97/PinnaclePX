import { Caveat_Brush, Montserrat } from 'next/font/google'

// The finished page's type, deliberately not the site's own Geist, so the illustration reads as
// another brand's site. Neither is preloaded: only the built page uses them, and it mounts only
// on a client that allows motion, so a reduced-motion visitor downloads neither file.
export const builtSans = Montserrat({ subsets: ['latin'], display: 'swap', preload: false })

export const builtScript = Caveat_Brush({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
})
