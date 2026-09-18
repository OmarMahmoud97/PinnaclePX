import { DM_Serif_Display } from 'next/font/google'

// The example brand's display face, for its wordmark, kicker and headline: a serif, so the page
// reads as a different brand from the site's own Geist. Its body copy is Montserrat
// (built-fonts.ts). One file, never preloaded: only the finished page uses it, and that page
// mounts only on a client that allows motion.
export const walkthroughSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  preload: false,
})
