import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import type { MeridianContent } from '../copy-slots'
import { type HeaderFrom, headerFrom } from '../fit'
import { button } from '../styles'
import { MeridianLogo } from './logo'
import { NavMenu } from './nav-menu'

type Props = Pick<MeridianContent, 'brand' | 'nav'>

// The classes that show the row of links, and hide the menu button, from the width that holds
// them (fit.ts, headerFrom). Written out whole so Tailwind can see them; with no such width the
// menu button serves at every width.
const FROM: Readonly<Record<NonNullable<HeaderFrom> | 'never', { row: string; toggle: string }>> = {
  lg: { row: 'hidden lg:flex', toggle: 'lg:hidden' },
  xl: { row: 'hidden xl:flex', toggle: 'xl:hidden' },
  '2xl': { row: 'hidden 2xl:flex', toggle: '2xl:hidden' },
  never: { row: 'hidden', toggle: '' },
}

// The source's Navbar: a floating pill, sticky twenty pixels from the top, seventy-five percent
// of the width on wide screens, with the logo at the left, a menu in the middle whose first item
// opens onto a picture beside three entries (meridian.css), and at the right a small ghost
// button where the source had its theme toggle and repository link. The source showed the links
// from lg whatever their length, so at 1024 they wrapped and ran into each other on most stored
// pages ("Why us" over "Services"); here they show from the first width whose bar holds them on
// one line, and the menu button serves below it (decision 15). The name may wrap, and a name
// with nowhere to break breaks anywhere, so the button is never pushed off a phone's screen.
export function MeridianNav({ brand, nav }: Props) {
  const { menu } = nav
  const from = FROM[headerFrom({ brand, nav }) ?? 'never']
  return (
    <header className="sticky top-5 z-40 mx-auto flex w-[90%] items-center justify-between rounded-2xl border border-surface-muted bg-accent p-2 shadow-inner md:w-[70%] lg:w-[75%] lg:max-w-(--breakpoint-xl)">
      <a href="#top" className="flex min-w-0 items-center text-lg font-bold">
        <MeridianLogo brand={brand} />
      </a>

      <NavMenu brand={brand} links={nav.links} cta={nav.cta} hide={from.toggle} />

      <nav
        aria-label="Main"
        className={`relative z-10 mx-auto max-w-max flex-1 items-center justify-center ${from.row}`}
      >
        <ul className="group flex flex-1 list-none items-center justify-center [&>*+*]:ml-1">
          <li className="meridian-menu-root">
            <a
              href="#features"
              className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-accent px-4 py-2 text-base font-medium transition-colors hover:bg-surface-muted hover:text-on-surface focus:bg-surface-muted focus:text-on-surface focus:outline-none"
            >
              {menu.label}
              <ChevronDown
                className="meridian-menu-chevron relative top-[1px] ml-1 h-3 w-3 transition duration-200"
                aria-hidden="true"
              />
            </a>
            <div className="absolute top-full left-0 flex w-full justify-center">
              <div className="meridian-menu relative mt-1.5 overflow-hidden rounded-md border border-border bg-surface text-on-surface shadow-lg">
                <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                  {menu.image === null ? (
                    <div aria-hidden="true" className="h-full w-full rounded-md bg-surface-muted" />
                  ) : (
                    <Image
                      src={menu.image.src}
                      alt={menu.image.alt}
                      className="h-full w-full rounded-md object-cover"
                      width={600}
                      height={600}
                    />
                  )}
                  <ul className="flex flex-col gap-2">
                    {menu.items.map((item) => (
                      <li
                        key={item.title}
                        className="rounded-md p-3 text-sm hover:bg-surface-muted"
                      >
                        <p className="mb-1 leading-none font-semibold text-on-surface">
                          {item.title}
                        </p>
                        <p className="line-clamp-2 text-on-surface-muted">{item.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>

          {/* Each link whole: a row longer than its estimate takes a link onto a second line
              rather than break one or run it into the next. */}
          <li className="flex flex-wrap justify-center">
            {nav.links.map((link) => (
              <a key={link.href} href={link.href} className="px-2 text-base whitespace-nowrap">
                {link.label}
              </a>
            ))}
          </li>
        </ul>
      </nav>

      <div className={from.row}>
        <a href={nav.cta.href} className={button.ghostSm}>
          {nav.cta.label}
        </a>
      </div>
    </header>
  )
}
