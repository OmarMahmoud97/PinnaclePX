'use client'

import { useEffect, useRef, useState } from 'react'
import type { AtlasContent } from '../copy-slots'
import { button, navLink } from '../styles'
import { AtlasLogo } from './logo'
import { Mdi } from './mdi'

type Props = Pick<AtlasContent, 'brand' | 'nav'>

const MENU_ID = 'atlas-menu'

// The source's BaseNavbar, the template's one piece of JavaScript: the logo and, below xl, a
// toggle that unfolds the links; from xl the links sit in a row with a menu that drops down on
// a click, and the two round buttons at the right. The source toggled both by state; so does
// this. The source's dropdown closed on its button's blur, before a click or a Tab could reach
// an entry; this one stays open while focus is inside it, and closes when focus leaves it, on
// a press outside it, on choosing an entry, and on Escape, which returns focus to its button.
// The closed list stays in the page, hidden, so a chosen link is still there to follow; the
// open one is as wide as its longest entry, and in the row it hangs from its button's right
// edge, so it never lies over the buttons beside it. The toggle's links unfold in the page's
// flow, and Escape from inside the header folds them away again with focus back on the toggle
// (decision 15); a link chosen there leaves focus at its section, as the browser puts it.
//
// Every label keeps to one line (decision 15). The source's row started at lg with one-word
// labels; a visitor's run longer ("What's Included", "Give Us A Ring"), and the longest stored
// set needs 1249px with the name on one line, so the row starts at xl, a little tighter than
// the source's (links px-2, buttons px-6), and the toggle serves below it. In the row the name
// takes the space left and wraps between its words when it must; only labels longer than any
// stored set take the links onto a second line. Below xl the two buttons stack when they do
// not fit side by side.
export function AtlasNav({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLLIElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const shown = open ? 'flex' : 'hidden xl:flex'

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
    <nav
      id="navbar"
      aria-label="Main"
      className="relative z-10 w-full text-on-surface"
      onKeyDown={(event) => {
        // Escape from inside the header folds the toggle's links away and puts focus back on
        // the toggle; with the drop-down open, the drop-down's own Escape goes first.
        if (event.key !== 'Escape' || !open || menu) return
        setOpen(false)
        toggleRef.current?.focus()
      }}
    >
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col px-8 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center xl:min-w-0 xl:grow xl:flex-row [&>*+*]:ml-4 xl:[&>*+*]:ml-8">
          <div className="flex w-full flex-row items-center justify-between py-6 xl:w-auto xl:grow xl:basis-0">
            <div>
              <a href="#top" className="inline-flex" aria-label={`${brand.name} home`}>
                <AtlasLogo brand={brand} where="header" />
              </a>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className="rounded-lg focus:outline-none xl:hidden"
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
            className={`${shown} h-auto w-full grow origin-top flex-col pb-4 duration-300 xl:w-auto xl:grow-0 xl:flex-row xl:flex-wrap xl:items-center xl:justify-end xl:pb-0 [&>*+*]:mt-3 xl:[&>*+*]:mt-0 xl:[&>*+*]:ml-2`}
          >
            {nav.links.map((link) => (
              <li key={link.href} className="w-full xl:w-auto">
                <a
                  className={`${navLink} whitespace-nowrap xl:inline-block xl:px-2`}
                  href={link.href}
                >
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
                className={`${navLink} flex items-center whitespace-nowrap xl:px-2`}
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
                className={`${menu ? 'flex' : 'hidden'} w-max max-w-full flex-col rounded-md py-1 pl-2 xl:absolute xl:right-0 xl:max-w-none xl:bg-surface xl:pl-0 xl:shadow-md`}
              >
                {nav.menu.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block px-4 py-2 text-sm whitespace-nowrap text-on-surface-muted hover:bg-accent"
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
        <div className={`${shown} flex-wrap gap-x-3 xl:shrink-0`}>
          <a
            href={nav.secondary.href}
            className={`${button.outline} mt-2 px-8 py-3 whitespace-nowrap xl:px-6`}
          >
            {nav.secondary.label}
          </a>
          <a
            href={nav.cta.href}
            className={`${button.gradient} mt-2 px-8 py-3 whitespace-nowrap xl:px-6`}
          >
            {nav.cta.label}
          </a>
        </div>
      </div>
    </nav>
  )
}
