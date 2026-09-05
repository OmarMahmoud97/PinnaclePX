import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import type { MeridianContent } from '../copy-slots'
import { button } from '../styles'
import { MeridianLogo } from './logo'
import { NavMenu } from './nav-menu'

type Props = Pick<MeridianContent, 'brand' | 'nav'>

// The source's Navbar: a floating pill, sticky twenty pixels from the top, seventy-five percent
// of the width on wide screens, with the logo at the left, a menu in the middle whose first item
// opens onto a picture beside three entries (meridian.css), and at the right a small ghost
// button where the source had its theme toggle and repository link.
export function MeridianNav({ brand, nav }: Props) {
  const { menu } = nav
  return (
    <header className="sticky top-5 z-40 mx-auto flex w-[90%] items-center justify-between rounded-2xl border border-surface-muted bg-accent p-2 shadow-inner md:w-[70%] lg:w-[75%] lg:max-w-(--breakpoint-xl)">
      <a href="#top" className="flex items-center text-lg font-bold">
        <MeridianLogo brand={brand} />
      </a>

      <NavMenu brand={brand} links={nav.links} cta={nav.cta} />

      <nav
        aria-label="Main"
        className="relative z-10 mx-auto hidden max-w-max flex-1 items-center justify-center lg:flex"
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

          <li>
            {nav.links.map((link) => (
              <a key={link.href} href={link.href} className="px-2 text-base">
                {link.label}
              </a>
            ))}
          </li>
        </ul>
      </nav>

      <div className="hidden lg:flex">
        <a href={nav.cta.href} className={button.ghostSm}>
          {nav.cta.label}
        </a>
      </div>
    </header>
  )
}
