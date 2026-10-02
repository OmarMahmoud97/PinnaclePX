'use client'

import { useEffect, useRef, useState } from 'react'
import type { AtlasContent } from '../copy-slots'
import { button, navLink } from '../styles'
import { AtlasLogo } from './logo'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'brand' | 'nav'>

const MENU_ID = 'atlas-menu'

// The source's BaseNavbar, the template's one piece of JavaScript: the logo and, below lg, a
// toggle that unfolds the links; from lg the links sit in a row with a menu that drops down on
// a click, and the two round buttons at the right. The source toggled both by state; so does
// this. The source's dropdown closed on its button's blur, before a click or a Tab could reach
// an entry; this one stays open while focus is inside it, and closes when focus leaves it, on
// a press outside it, on choosing an entry, and on Escape, which returns focus to its button.
// The closed list stays in the page, hidden, so a chosen link is still there to follow; the
// open one is as wide as its longest entry, up to its cap, so entries keep to one line within it.
export function AtlasNav({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const shown = open ? 'flex' : 'hidden lg:flex'

  useEffect(() => {
    if (!menu) return
    const onPress = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !menuRef.current?.contains(event.target)) {
        setMenu(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenu(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPress)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPress)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  return (
    <nav id="navbar" aria-label="Main" className="relative z-10 w-full text-on-surface">
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col px-8 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center lg:flex-row [&>*+*]:ml-4 xl:[&>*+*]:ml-8">
          <div className="flex w-full flex-row items-center justify-between py-6">
            <div>
              <a href="#top" className="inline-flex" aria-label={`${brand.name} home`}>
                <AtlasLogo brand={brand} where="header" />
              </a>
            </div>
            <button
              type="button"
              className="rounded-lg focus:outline-none lg:hidden"
              aria-expanded={open}
              aria-label="Menu"
              onClick={() => {
                setOpen((current) => !current)
              }}
            >
              <Mdi name={open ? 'close' : 'segment'} size={24} />
            </button>
          </div>
          <ul
            className={`${shown} h-auto w-full grow origin-top flex-col pb-4 duration-300 lg:flex-row lg:items-center lg:justify-end lg:pb-0 [&>*+*]:mt-3 lg:[&>*+*]:mt-0 xl:[&>*+*]:ml-2`}
          >
            {nav.links.map((link) => (
              <li key={link.href} className="w-full">
                <a className={navLink} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
            <li
              ref={menuRef}
              className="group relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMenu(false)
              }}
            >
              <button
                ref={buttonRef}
                type="button"
                className={`${navLink} flex items-center`}
                aria-expanded={menu}
                aria-controls={MENU_ID}
                onClick={() => {
                  setMenu((current) => !current)
                }}
              >
                <span>{nav.menu.label}</span>
                <Mdi name={menu ? 'chevronUp' : 'chevronDown'} size={16} />
              </button>
              <ul
                id={MENU_ID}
                className={`${menu ? 'flex' : 'hidden'} max-w-42 flex-col rounded-md py-1 pl-2 lg:absolute lg:w-max lg:bg-surface lg:pl-0 lg:shadow-md`}
              >
                {nav.menu.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block px-4 py-2 text-sm text-on-surface-muted hover:bg-accent"
                      onClick={() => {
                        setMenu(false)
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>
        <div className={`${shown} [&>*+*]:ml-3`}>
          <a href={nav.secondary.href} className={`${button.outline} mt-2 px-8 py-3 xl:px-10`}>
            {nav.secondary.label}
          </a>
          <a href={nav.cta.href} className={`${button.gradient} mt-2 px-8 py-3 xl:px-10`}>
            {nav.cta.label}
          </a>
        </div>
      </div>
    </nav>
  )
}
