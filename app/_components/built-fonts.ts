import { Montserrat } from 'next/font/google'

// The walkthrough's finished page's type, deliberately not the site's own Geist, so the
// illustration reads as another brand's site. Not preloaded: only the finished page uses it, and
// that mounts only on a client that allows motion, so a reduced-motion visitor never downloads
// the file. The hero's finished page shared it until ADR 0031 removed the loop.
export const builtSans = Montserrat({ subsets: ['latin'], display: 'swap', preload: false })
