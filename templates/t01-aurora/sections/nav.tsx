import type { AuroraContent } from '../copy-slots'
import { button, container } from '../styles'
import { AuroraLogo } from './logo'
import { NavMenu } from './nav-menu'

type Props = Pick<AuroraContent, 'brand' | 'nav'>

const NAV_LINK =
  'inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-on-surface-muted transition-colors duration-(--motion-tap) outline-none hover:bg-on-surface/6 hover:text-on-surface focus-visible:ring-2 focus-visible:ring-brand-deeper'

// The logo, up to four links and one button. Open at the top of the page, glass once it has
// scrolled (aurora.css); the height never changes. Below md the links fold into the menu.
export function AuroraNav({ brand, nav }: Props) {
  return (
    <header
      data-rise
      className="aurora-header sticky top-0 z-50 border-b border-border bg-surface/84 backdrop-blur-md"
    >
      <div className={`${container} flex h-16 items-center justify-between gap-6`}>
        <a
          href="#top"
          aria-label={`${brand.name} home`}
          className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <AuroraLogo brand={brand} />
        </a>

        <nav aria-label="Main" className="hidden md:block">
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

        <div className="flex items-center gap-2">
          <a
            href={nav.cta.href}
            className={`${button.primary} ${button.small} hidden md:inline-flex`}
          >
            {nav.cta.label}
          </a>
          <NavMenu links={nav.links} cta={nav.cta} />
        </div>
      </div>
    </header>
  )
}
