import type { MonolithContent } from '../copy-slots'
import { button, container } from '../styles'
import { MonolithLogo } from './logo'
import { NavMenu } from './nav-menu'

type Props = Pick<MonolithContent, 'brand' | 'nav'>

// The source's Navbar: sticky, one line under it, a 56px row holding the logo at the left, the
// links as ghost buttons in the middle and a bordered secondary button at the right, where the
// source had its repository link and theme toggle. Below md the links fold into the sheet.
export function MonolithNav({ brand, nav }: Props) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface">
      <div className="relative z-10 mx-auto flex flex-1 items-center justify-center">
        <div className={`${container} flex h-14 w-screen items-center justify-between px-4`}>
          <div className="flex font-bold">
            <a href="#top" className="ml-2 flex text-xl font-bold">
              <MonolithLogo brand={brand} />
            </a>
          </div>

          <NavMenu brand={brand} links={nav.links} cta={nav.cta} />

          <nav aria-label="Main" className="hidden gap-2 md:flex">
            {nav.links.map((link) => (
              <a key={link.href} href={link.href} className={`text-[17px] ${button.ghost}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden gap-2 md:flex">
            <a href={nav.cta.href} className={`border border-border ${button.secondary}`}>
              {nav.cta.label}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
