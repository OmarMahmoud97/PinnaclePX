'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'
import type { VectorContent } from '../copy-slots'
import { container } from '../styles'
import { VectorLogo } from './logo'

type Props = Pick<VectorContent, 'brand' | 'nav'>

const PANEL_ID = 'vector-menu'
// The last link's exit ends 0.55s after the fold begins: 0.3s after a twentieth of a second
// for each of the five before it.
const EXIT_MS = 550

const LOGO_WAIT = { '--dur': '0.6s' } as CSSProperties
const MENU_WAIT = { '--dur': '0.4s' } as CSSProperties

// Marks a block that holds focus only so the next Tab starts there (vector.css draws it no ring).
const FOCUS_MARK = 'data-vector-focus'

// A chosen link's block takes focus, as the browser's own jump moves the start of the Tab order
// there, so a keyboard visitor carries on from the block they chose and never from the menu,
// which is about to fold away. It waits a frame for the jump, then stands down if focus is
// already in the block outside the menu, as it is when the site's glide has taken the click
// (app/_components/smooth-scroll.tsx). A block that takes no focus of its own is made
// focusable just this once and gives it back on blur.
function focusBlock(href: string) {
  requestAnimationFrame(() => {
    const block = document.getElementById(decodeURIComponent(href.slice(1)))
    const at = document.activeElement
    if (block === null) return
    if (at !== null && block.contains(at) && at.closest(`#${PANEL_ID}`) === null) return
    if (block.tabIndex < 0 && !block.hasAttribute('tabindex')) {
      block.setAttribute('tabindex', '-1')
      block.setAttribute(FOCUS_MARK, '')
      block.addEventListener(
        'blur',
        () => {
          block.removeAttribute('tabindex')
          block.removeAttribute(FOCUS_MARK)
        },
        { once: true },
      )
    }
    block.focus({ preventScroll: true })
  })
}

// The source's Header: two dark glass pills that drop in on load, the name at the left and at
// the right a menu that names the block the page is at (a scroll spy: the last block whose top
// is above a third of the way down, and the last link once the page is within a hundred
// pixels of its end) beside a plus. Pressing it unfolds the pill to hold the links, faded in a
// tenth of a second after, each sliding in from the left a twentieth after the one before, the
// current one underlined; the plus turns into a cross. The source animated the pill's height
// with a motion library; here the list opens on a grid row and the links arrive by
// starting-style transitions, and closing plays the same out before the list goes. The source
// dimmed the other links to three fifths and lit them under the pointer, which falls below AA
// on some brands' colours, so every link is the pill's own ink and a pointer underlines the
// one it is on. The button is named by the label it shows and the word menu, so a voice
// command that says what it shows reaches it; Escape gives focus back to it, and a chosen link
// sends focus on to its block (focusBlock). The name swells a little under the pointer and
// shrinks under the finger. Its pill never reaches under the menu's: it stops half a rem short
// of it at any width, its sides are 12px below 640px (the source's 16px left fewer names on
// one line), on phones narrower than 390px its name steps down towards 14px, and a name too
// long for one line takes a second, then ends in an ellipsis, the whole name staying in the
// link's label. The whole bar goes while a project is open full screen (vector.css).
export function VectorHeader({ brand, nav }: Props) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [active, setActive] = useState(nav.links[0]?.label ?? '')
  const toggle = useRef<HTMLButtonElement>(null)
  const shown = open && !closing

  useEffect(() => {
    const onScroll = () => {
      const line = window.scrollY + window.innerHeight / 3
      const last = nav.links[nav.links.length - 1]
      if (
        last !== undefined &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100
      ) {
        setActive(last.label)
        return
      }
      for (let i = nav.links.length - 2; i >= 0; i -= 1) {
        const link = nav.links[i]
        if (link === undefined) continue
        const block = document.getElementById(link.section)
        if (block !== null && line >= block.offsetTop) {
          setActive(link.label)
          return
        }
      }
      setActive(nav.links[0]?.label ?? '')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [nav.links])

  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, EXIT_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [closing])

  // Escape folds the menu away and, when focus was in it (or nowhere), hands focus back to the
  // button, since the links it was on are about to go.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setClosing(true)
      const button = toggle.current
      const at = document.activeElement
      if (button?.parentElement?.contains(at) === true || at === document.body) button?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      data-rise="drop"
      className="vector-bar fixed top-0 right-0 left-0 z-50 px-4 py-6 sm:px-12 sm:py-12 lg:px-24"
    >
      <div className={`${container} flex items-center justify-between gap-4`}>
        <a
          href="#top"
          data-rise="drop"
          style={LOGO_WAIT}
          className="flex h-12 max-w-[calc(100%-12.5rem)] shrink-0 items-center justify-center rounded-xl bg-scrim/70 px-3 text-[clamp(0.875rem,4.11vw,1rem)] leading-tight font-medium tracking-tight text-on-scrim shadow-lg backdrop-blur-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:h-16 sm:max-w-[calc(100%-15.5rem)] sm:rounded-2xl sm:px-5 sm:text-xl"
          aria-label={`${brand.name} home`}
        >
          <VectorLogo brand={brand} />
        </a>
        <div className="relative h-12 sm:h-16">
          <div
            data-rise="drop"
            style={MENU_WAIT}
            className="absolute top-0 right-0 w-48 overflow-hidden rounded-xl bg-scrim/70 shadow-lg backdrop-blur-lg sm:w-60 sm:rounded-2xl"
          >
            <button
              ref={toggle}
              type="button"
              onClick={() => {
                if (open) setClosing(true)
                else setOpen(true)
              }}
              aria-expanded={shown}
              aria-controls={PANEL_ID}
              className="flex h-12 w-full items-center justify-between gap-4 px-4 text-on-scrim sm:h-16 sm:px-5"
            >
              <span className="text-base font-medium sm:text-lg">{active}</span>
              <span className="sr-only"> menu</span>
              <span
                aria-hidden="true"
                className={`relative h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-6 sm:w-6 ${shown ? 'rotate-45' : ''}`}
              >
                <span className="absolute top-0 left-1/2 h-5 w-[1.5px] -translate-x-1/2 bg-current sm:h-6" />
                <span className="absolute top-1/2 left-0 h-[1.5px] w-5 -translate-y-1/2 bg-current sm:w-6" />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                {open && (
                  <nav
                    id={PANEL_ID}
                    aria-label="Main"
                    className={`px-5 pb-5 transition-opacity delay-100 duration-200 starting:opacity-0 ${closing ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <ul className="flex flex-col gap-1">
                      {nav.links.map((link, index) => (
                        <li
                          key={link.label}
                          style={{ transitionDelay: `${String(0.05 * index)}s` }}
                          className={`transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] starting:-translate-x-2.5 starting:opacity-0 ${closing ? '-translate-x-2.5 opacity-0' : ''}`}
                        >
                          <a
                            href={link.href}
                            onClick={() => {
                              setClosing(true)
                              setActive(link.label)
                              focusBlock(link.href)
                            }}
                            className={`block py-1.5 text-lg font-medium text-on-scrim underline-offset-4 ${active === link.label ? 'underline' : 'hover:underline'}`}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
