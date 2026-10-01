import type { LucentContent } from '../copy-slots'
import { BrandLockup } from './ui'

type Props = Pick<LucentContent, 'brand' | 'nav'>

// The source's bar: a glass pill fixed over the page with the brand at its left, four links and
// the ask at its right. The lens that bends the page under it and the thicker tint once the page
// scrolls are sections/glass.ts and sections/scroll.ts. Below 961px the links go, as the
// source's did, and the ask moves to the right.
export function LucentNav({ brand, nav }: Props) {
  return (
    <header className="lc-nav" data-nav="">
      <span className="lc-nav__glass" aria-hidden="true">
        <i />
      </span>
      <a className="lc-brand" href="#top" aria-label={`${brand.name} home`}>
        <BrandLockup brand={brand} sizes="160px" />
      </a>
      <nav className="lc-nav__links" aria-label="Primary">
        {nav.items.map((item) => (
          <a key={`${item.label}${item.href}`} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="lc-btn lc-btn--solid lc-btn--sm" data-magnetic="" href={nav.cta.href}>
        <span>{nav.cta.label}</span>
      </a>
    </header>
  )
}
