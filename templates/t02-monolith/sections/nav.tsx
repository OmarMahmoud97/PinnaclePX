import type { MonolithContent } from '../copy-slots'
import { textEms } from '../fit'
import { button, container } from '../styles'
import { MonolithLogo } from './logo'
import { NavMenu } from './nav-menu'

type Props = Pick<MonolithContent, 'brand' | 'nav'>

// Where the bar can show its links and its ask beside the wordmark: the row's room at md, lg, xl
// and 2xl (the screen less 24px each side, at most 1400px), and the classes that show the links
// and hide the toggle from there.
const BARS = [
  { room: 720, show: 'md:flex', hide: 'md:hidden' },
  { room: 976, show: 'lg:flex', hide: 'lg:hidden' },
  { room: 1232, show: 'xl:flex', hide: 'xl:hidden' },
  { room: 1352, show: '2xl:flex', hide: '2xl:hidden' },
] as const

// The space between the bar's three parts.
const GAP = 24

// How wide the bar's parts are on one line, in pixels, estimated from their words (fit.ts) at
// the bar's own sizes: each link at 17px inside 16px each side, 8px apart; the ask at 14px inside
// 16px and a border each side; and the wordmark at 20px in two lines at most after its 8px
// margin, or a logo at its 28px height. The estimate errs wide, so the toggle stays a little
// longer rather than let a link run past the bar.
function barWidth({ brand, nav }: Props): number {
  const links = nav.links.reduce((sum, link) => sum + 17 * textEms(link.label) + 32, 0)
  const ask = 14 * textEms(nav.cta.label) + 34
  const { logo } = brand
  const mark =
    8 + (logo.kind === 'image' ? (28 * logo.width) / logo.height : 20 * twoLines(brand.name))
  return mark + links + 8 * (nav.links.length - 1) + ask + 2 * GAP
}

// The narrowest a name can be set in at most two lines, in ems.
function twoLines(name: string): number {
  const words = name.split(/\s+/)
  let narrowest = textEms(name)
  for (let at = 1; at < words.length; at++) {
    const first = textEms(words.slice(0, at).join(' '))
    const rest = textEms(words.slice(at).join(' '))
    narrowest = Math.min(narrowest, Math.max(first, rest))
  }
  return narrowest
}

// The source's Navbar: sticky, one line under it, a 56px row holding the logo at the left, the
// links as ghost buttons in the middle and a bordered secondary button at the right, where the
// source had its repository link and theme toggle. Below md the links fold into the sheet.
//
// The source showed the links from md whatever their length, so at 768 the name was squeezed
// onto three lines and cut at the top, and long labels ran past the screen. Here the links and
// the button show from the first of md, lg, xl and 2xl whose row holds them on one line beside
// the wordmark (BARS), and the toggle serves every screen below that, or every screen when none
// does. The wordmark may wrap, and the bar grows rather than cut it. Below md, where only the
// toggle stands beside it, an image logo keeps 4px from it, so a mark eight times as wide as it
// is tall keeps its full size on a 320px phone, as in the source; a wider one is drawn smaller
// at its own shape (logo.tsx).
export function MonolithNav({ brand, nav }: Props) {
  const width = barWidth({ brand, nav })
  const bar = BARS.find((option) => width <= option.room)
  const show = bar?.show ?? ''
  const hide = bar?.hide ?? ''
  const gap = brand.logo.kind === 'image' ? 'gap-1 md:gap-6' : 'gap-6'
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
      <div className="relative z-10 mx-auto flex flex-1 items-center justify-center">
        <div
          className={`${container} flex min-h-14 w-screen items-center justify-between ${gap} px-4`}
        >
          <div className="flex min-w-0 font-bold">
            <a href="#top" className="ml-2 flex min-w-0 text-xl font-bold">
              <MonolithLogo brand={brand} />
            </a>
          </div>

          <NavMenu brand={brand} links={nav.links} cta={nav.cta} hide={hide} />

          <nav aria-label="Main" className={`hidden shrink-0 gap-2 ${show}`}>
            {nav.links.map((link) => (
              <a key={link.href} href={link.href} className={`text-[17px] ${button.ghost}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={`hidden shrink-0 gap-2 ${show}`}>
            <a href={nav.cta.href} className={`border border-border ${button.secondary}`}>
              {nav.cta.label}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
