import type { HarborContent } from '../copy-slots'
import { container } from '../styles'

type Props = { partners: NonNullable<HarborContent['partners']> }

// The source's Partners: a quieter band between hairlines with a tracked line centred, then a
// marquee of names in faint black capitals, each behind a small accent dot, two copies of the
// row sliding left forever behind a fade at either edge (harbor.css), each name brightening
// and its dot growing under the pointer.
export function HarborPartners({ partners }: Props) {
  const names = [...partners.names, ...partners.names]
  return (
    <section
      id="partners"
      className="overflow-hidden border-y border-border bg-surface-muted py-20"
    >
      <div className={`${container} mb-10`}>
        <div data-fade data-margin="-80px" className="text-center">
          <span className="text-xs font-semibold tracking-[0.25em] text-on-surface/60 uppercase">
            {partners.label}
          </span>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-32 bg-linear-to-r from-surface-muted to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-32 bg-linear-to-l from-surface-muted to-transparent" />
        <div className="harbor-marquee mt-10 flex whitespace-nowrap">
          {names.map((name, index) => (
            <div key={`${name} ${String(index)}`} className="mx-10 flex items-center gap-12">
              <div className="group flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-deeper transition-transform duration-200 group-hover:scale-150" />
                <span className="font-display text-lg font-black tracking-widest text-on-surface/30 uppercase transition-colors duration-200 group-hover:text-on-surface/70">
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
