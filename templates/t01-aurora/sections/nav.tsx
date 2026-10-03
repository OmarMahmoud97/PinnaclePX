import type { AuroraContent } from '../copy-slots'
import { bodyEms, displayEms } from '../fit'
import { button, container } from '../styles'
import { AuroraLogo } from './logo'
import { NavMenu } from './nav-menu'

type Props = Pick<AuroraContent, 'brand' | 'nav'>

const NAV_LINK =
  'inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-on-surface-muted transition-colors duration-(--motion-tap) outline-none hover:bg-on-surface/6 hover:text-on-surface focus-visible:ring-2 focus-visible:ring-brand-deeper'

// Where the bar can show its links beside the name and the button: the row's room at lg and xl
// (the screen less 40px each side, at most 1072px from the column's cap), and the classes that
// show the links and hide the menu's button from there.
const BARS = [
  { room: 944, show: 'lg:block', hide: 'lg:hidden' },
  { room: 1072, show: 'xl:block', hide: 'xl:hidden' },
] as const

// How wide the bar's parts are on one line, in pixels, estimated from their words (fit.ts) at
// the bar's own sizes: the name at 18px after its 10px point and 8px gap, or a logo at its 28px
// height; each link at 14px inside 16px each side, 4px apart; the button at 14px inside 20px
// each side; and 24px between the three. The estimate errs wide, so the menu serves a little
// longer rather than let a link wrap.
function barWidth({ brand, nav }: Props): number {
  const { logo } = brand
  const mark =
    logo.kind === 'image' ? (28 * logo.width) / logo.height : 18 + 18 * displayEms(brand.name)
  const links = nav.links.reduce((sum, link) => sum + 14 * bodyEms(link.label) + 32, 0)
  const ask = 14 * bodyEms(nav.cta.label) + 40
  return mark + links + 4 * (nav.links.length - 1) + ask + 2 * 24
}

// The logo, up to four links and one button. Open at the top of the page, glass once it has
// scrolled (aurora.css); scrolling never changes its height.
//
// The source showed the links from md whatever their length, so at 768 they wrapped inside
// their pills beside a long name, and the button meant to fold away on phones stayed (its own
// display beat the class that hid it), pushing the menu's button off the screen. Here the links
// show from the first of lg and xl whose row holds them on one line (BARS), and the menu serves
// every screen below that, or every screen when neither does. The button shows from md, in a
// wrapper of its own so nothing overrides the class that hides it, and below md it folds into
// the menu, so a phone's bar holds the name and the menu alone. The name may wrap, and the bar
// grows rather than cut it or push the menu off the screen.
export function AuroraNav({ brand, nav }: Props) {
  const width = barWidth({ brand, nav })
  const bar = BARS.find((option) => width <= option.room)
  return (
    <header
      data-rise
      className="aurora-header sticky top-0 z-50 border-b border-border bg-surface/84 backdrop-blur-md"
    >
      <div className={`${container} flex min-h-16 items-center justify-between gap-6`}>
        <a
          href="#top"
          aria-label={`${brand.name} home`}
          className="min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <AuroraLogo brand={brand} />
        </a>

        <nav aria-label="Main" className={`hidden shrink-0 ${bar?.show ?? ''}`}>
          <ul className="flex items-center gap-1">
            {nav.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={NAV_LINK}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:flex">
            <a href={nav.cta.href} className={`${button.primary} ${button.small}`}>
              {nav.cta.label}
            </a>
          </div>
          <NavMenu links={nav.links} cta={nav.cta} hide={bar?.hide ?? ''} />
        </div>
      </div>
    </header>
  )
}
