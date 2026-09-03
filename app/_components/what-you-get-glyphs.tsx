import type { Glyph } from '@/app/_components/what-you-get-items'

// Four small drawings in the sketch's own vocabulary: page layouts, a mark beside swatches, bars
// becoming a line of text, and the address pill. One stroke weight, the border token for the
// paper and currentColor (brand-deeper) for the ink, so they belong to the wireframe the hero
// draws rather than to an icon set.
const GLYPHS: Readonly<Record<Glyph, () => React.JSX.Element>> = {
  layouts: () => (
    <>
      <rect x="1.5" y="3.5" width="15" height="33" rx="1.5" className="stroke-border" />
      <rect x="4" y="7" width="10" height="7" rx="1" className="fill-current opacity-70" />
      <rect x="4" y="17" width="10" height="1.5" rx="0.75" className="fill-border" />
      <rect x="4" y="21" width="7" height="1.5" rx="0.75" className="fill-border" />
      <rect x="20.5" y="3.5" width="15" height="33" rx="1.5" className="stroke-border" />
      <rect x="25" y="8" width="6" height="1.5" rx="0.75" className="fill-border" />
      <rect x="23" y="12" width="10" height="7" rx="1" className="fill-current opacity-70" />
      <rect x="25" y="22" width="6" height="1.5" rx="0.75" className="fill-border" />
      <rect x="39.5" y="3.5" width="15" height="33" rx="1.5" className="stroke-border" />
      <rect x="42" y="7" width="4.5" height="12" rx="1" className="fill-current opacity-70" />
      <rect x="48.5" y="8" width="4" height="1.5" rx="0.75" className="fill-border" />
      <rect x="48.5" y="12" width="4" height="1.5" rx="0.75" className="fill-border" />
      <rect x="42" y="23" width="10.5" height="1.5" rx="0.75" className="fill-border" />
    </>
  ),
  colours: () => (
    <>
      <rect x="1.5" y="8.5" width="23" height="23" rx="4" className="fill-current" />
      <text
        x="13"
        y="24.5"
        textAnchor="middle"
        className="fill-surface font-sans text-[13px] font-semibold"
      >
        Ab
      </text>
      <rect x="31" y="8.5" width="24" height="7" rx="1.5" className="fill-current opacity-35" />
      <rect x="31" y="16.5" width="24" height="7" rx="1.5" className="fill-current opacity-65" />
      <rect x="31" y="24.5" width="24" height="7" rx="1.5" className="fill-current" />
    </>
  ),
  wording: () => (
    <>
      <rect x="1.5" y="9" width="22" height="2.5" rx="1.25" className="fill-border" />
      <rect x="1.5" y="16" width="16" height="2.5" rx="1.25" className="fill-border" />
      <path d="M27 17.5h4l4-8 3 16 3-8h4" className="stroke-current" strokeLinecap="round" />
      <rect x="1.5" y="28" width="36" height="2.5" rx="1.25" className="fill-current" />
      <rect x="41" y="28" width="13" height="2.5" rx="1.25" className="fill-current opacity-40" />
    </>
  ),
  link: () => (
    <>
      <rect x="1.5" y="11.5" width="53" height="17" rx="8.5" className="stroke-border" />
      <rect x="9" y="17.5" width="6" height="5" rx="1" className="stroke-current" />
      <path d="M10 17.5v-1.5a2 2 0 0 1 4 0v1.5" className="stroke-current" />
      <text x="20" y="22.5" className="fill-current font-mono text-[6px]">
        your-company
      </text>
    </>
  ),
}

export function WhatYouGetGlyph({ name }: { name: Glyph }) {
  const Shape = GLYPHS[name]
  return (
    <svg
      viewBox="0 0 56 40"
      width={56}
      height={40}
      aria-hidden="true"
      fill="none"
      strokeWidth={1.25}
      className="text-brand-deeper"
    >
      <Shape />
    </svg>
  )
}
