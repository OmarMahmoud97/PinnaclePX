'use client'

import Image from 'next/image'
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { InegroContent, InegroLink, InegroService } from '../copy-slots'
import { ArrowMark } from './icons'
import { InegroLogo } from './logo'

type Props = {
  brand: InegroContent['brand']
  nav: InegroContent['nav']
  // The two picture cards every dropdown shows (the source's two latest episodes): the first two
  // services, with the pill that leads to the ask.
  highlights: readonly InegroService[]
  highlightCta: InegroLink
}

type Scroll = 'up' | 'down' | undefined

const WIDE = '(min-width: 1024.02px)'

// The bar hides when the page goes down past its own height and comes back, as glass, when it
// goes up, ignoring moves of two pixels or less and never hiding at the page's foot, as the
// source's script did.
function useScrollState(): Scroll {
  const [state, setState] = useState<Scroll>(undefined)
  useEffect(() => {
    let last = window.scrollY
    let frame = 0
    const check = () => {
      frame = 0
      const y = window.scrollY
      if (Math.abs(last - y) <= 2) return
      const bar = document.querySelector('.inegro-header')?.getBoundingClientRect().height ?? 0
      if (y > last && y > bar) setState('up')
      else if (y + window.innerHeight < document.documentElement.scrollHeight) setState('down')
      last = y
    }
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(check)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return state
}

// Whether the bar is the desktop one; the server renders the desktop bar.
function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE)
  query.addEventListener('change', onChange)
  return () => {
    query.removeEventListener('change', onChange)
  }
}

function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  )
}

function Highlight({ service, cta }: { service: InegroService; cta: InegroLink }) {
  return (
    <div className="inegro-highlight">
      <a href={cta.href}>
        {service.image !== null && (
          <Image
            src={service.image.src}
            alt=""
            width={service.image.width}
            height={service.image.height}
            sizes="235px"
          />
        )}
        <strong className="inegro-highlight-title">{service.name}</strong>
        <span className="inegro-highlight-intro">{service.line}</span>
        <span className="inegro-pill">{cta.label}</span>
      </a>
    </div>
  )
}

// The source's header: the logo, the four links (the first two open dropdowns), and its search
// button, which is the page's ask here, outlined with a small arrow. From 1024px a dropdown is a
// white panel under the bar with the links on the left, a dark button, and two picture cards on
// the right, over a frosted veil; below 1024px a round toggle opens the links as a white sheet
// under the bar, where a dropdown opens in place and a strip of the picture cards scrolls along
// the foot. Escape closes whichever is open, as does a press on the veil.
export function InegroHeader({ brand, nav, highlights, highlightCta }: Props) {
  const scroll = useScrollState()
  const wide = useWide()
  const [openPanel, setPanel] = useState<number | null>(null)
  const [openSheet, setSheet] = useState(false)
  const [openSub, setSub] = useState<number | null>(null)
  // What is open belongs to one layout: a dropdown to the desktop bar, the sheet and its open
  // section to the phone's. Crossing the breakpoint hides the other layout's.
  const panel = wide ? openPanel : null
  const sheet = !wide && openSheet
  const sub = wide ? null : openSub

  useEffect(() => {
    if (panel === null && !sheet) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setPanel(null)
      setSheet(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [panel, sheet])

  // The sheet holds the page still while it is open, as the source's did.
  useEffect(() => {
    if (!sheet) return
    const root = document.documentElement
    const before = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = before
    }
  }, [sheet])

  const cards = highlights.slice(0, 2)
  const close = () => {
    setPanel(null)
    setSheet(false)
  }

  return (
    <>
      <header className="inegro-header" data-scroll={scroll}>
        <div className="inegro-header-inner">
          <div className="inegro-nav-wrap">
            <a className="inegro-logo" href="#top" aria-label={brand.name}>
              <InegroLogo brand={brand} />
            </a>
            <div className="inegro-nav-right">
              <nav
                id="inegro-sheet"
                className="inegro-nav"
                aria-label={brand.name}
                data-open={sheet ? '' : undefined}
              >
                <div className="inegro-nav-scroll">
                  <ul className="inegro-menu" data-open={sub === null ? undefined : ''}>
                    {nav.items.map((item, index) => {
                      const hasChildren = item.children.length > 0
                      if (!hasChildren) {
                        return (
                          <li key={item.label}>
                            <a
                              className="inegro-menu-link inegro-focus"
                              href={item.href}
                              onClick={close}
                            >
                              {item.label}
                            </a>
                          </li>
                        )
                      }
                      const expanded = wide ? panel === index : sub === index
                      return (
                        <li key={item.label}>
                          <button
                            type="button"
                            className="inegro-menu-link inegro-focus"
                            aria-expanded={expanded}
                            aria-controls={
                              wide ? `inegro-panel-${String(index)}` : `inegro-sub-${String(index)}`
                            }
                            onClick={() => {
                              if (wide) setPanel(panel === index ? null : index)
                              else setSub(sub === index ? null : index)
                            }}
                          >
                            <span className="inegro-dd">{item.label}</span>
                          </button>
                          <div
                            id={`inegro-sub-${String(index)}`}
                            className="inegro-sub"
                            data-open={sub === index ? '' : undefined}
                          >
                            <ul>
                              {item.children.map((child) => (
                                <li key={`${child.label}${child.href}`}>
                                  <a
                                    href={child.href}
                                    onClick={close}
                                    tabIndex={sub === index ? undefined : -1}
                                  >
                                    {child.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="inegro-nav-btns">
                    <a className="inegro-btn inegro-btn-line" href={nav.cta.href} onClick={close}>
                      {nav.cta.label}
                      <span className="inegro-arrow">
                        <ArrowMark />
                      </span>
                    </a>
                  </div>
                </div>
                {cards.length > 0 && (
                  <div className="inegro-nav-posts">
                    <div className="inegro-nav-posts-row">
                      {cards.map((service) => (
                        <Highlight key={service.name} service={service} cta={highlightCta} />
                      ))}
                    </div>
                    <div className="inegro-nav-posts-cta">
                      <a
                        className="inegro-btn inegro-btn-dark inegro-btn-wide"
                        href={nav.cta.href}
                        onClick={close}
                      >
                        {nav.cta.label}
                      </a>
                    </div>
                  </div>
                )}
              </nav>
              <div className="inegro-nav-btns">
                <a className="inegro-btn inegro-btn-line" href={nav.cta.href}>
                  {nav.cta.label}
                  <span className="inegro-arrow">
                    <ArrowMark />
                  </span>
                </a>
              </div>
              <button
                type="button"
                className="inegro-toggle"
                aria-expanded={sheet}
                aria-controls="inegro-sheet"
                aria-label="Menu"
                onClick={() => {
                  setSheet(!sheet)
                }}
              >
                <span className="inegro-edge" />
              </button>
            </div>
            {nav.items.map((item, index) =>
              item.children.length === 0 ? null : (
                <div
                  key={item.label}
                  id={`inegro-panel-${String(index)}`}
                  className="inegro-panel"
                  data-open={panel === index ? '' : undefined}
                >
                  <div className="inegro-panel-clip">
                    <div className="inegro-panel-body">
                      <div className="inegro-panel-links">
                        <ul>
                          {item.children.map((child) => (
                            <li key={`${child.label}${child.href}`}>
                              <a href={child.href} onClick={close}>
                                {child.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                        <a
                          className="inegro-btn inegro-btn-dark"
                          href={nav.cta.href}
                          onClick={close}
                        >
                          {nav.cta.label}
                        </a>
                      </div>
                      <div className="inegro-panel-cards">
                        {cards.map((service) => (
                          <Highlight key={service.name} service={service} cta={highlightCta} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </header>
      <div
        className="inegro-veil"
        data-open={panel === null ? undefined : ''}
        aria-hidden="true"
        onClick={close}
      />
    </>
  )
}
