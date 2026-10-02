// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { AtlasContent } from './copy-slots'
import { AtlasNav } from './sections/nav'

// The header's two menus by keyboard (decision 15): Escape from inside the toggle's links folds
// them away with focus back on the toggle, and with the drop-down open inside them Escape closes
// the drop-down first, onto its own button.
const brand: AtlasContent['brand'] = {
  name: 'Kestrel',
  legalName: 'Kestrel',
  logo: { kind: 'wordmark' },
}
const nav: AtlasContent['nav'] = {
  links: [
    { label: 'Get started', href: '#start' },
    { label: 'Why us', href: '#why' },
  ],
  menu: {
    label: 'More',
    items: [
      { label: 'Questions', href: '#faq' },
      { label: 'Back to top', href: '#top' },
    ],
  },
  secondary: { label: 'How it works', href: '#how-it-works' },
  cta: { label: 'Get in touch', href: '#contact' },
}

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root

beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => {
    root.render(<AtlasNav brand={brand} nav={nav} />)
  })
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  host.remove()
})

const find = (selector: string): HTMLElement => {
  const element = host.querySelector<HTMLElement>(selector)
  if (element === null) throw new Error(`No ${selector}`)
  return element
}
const press = (target: Element, key: string) => {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}
const click = (target: HTMLElement) => {
  act(() => {
    target.click()
  })
}

describe('the Atlas header menus', () => {
  it('folds the toggle links away on Escape, with focus back on the toggle', () => {
    const toggle = find('button[aria-label="Menu"]')
    click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    const link = find('a[href="#why"]')
    link.focus()
    press(link, 'Escape')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })

  it('closes the drop-down first, then the toggle links', () => {
    const toggle = find('button[aria-label="Menu"]')
    const more = find('button[aria-controls="atlas-menu"]')
    click(toggle)
    click(more)
    expect(more.getAttribute('aria-expanded')).toBe('true')
    const entry = find('#atlas-menu a[href="#faq"]')
    entry.focus()
    press(entry, 'Escape')
    expect(more.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(more)
    press(more, 'Escape')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })
})
