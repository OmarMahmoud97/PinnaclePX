'use client'

import Image from 'next/image'
import { useState } from 'react'
import { DEMO_ITEMS, type DemoItem } from '@/app/_components/demo-items'
import { cn } from '@/lib/cn'

const PANEL_ID = 'demo-panel'

export function DemoTabs() {
  const [active, setActive] = useState<DemoItem>(DEMO_ITEMS[0])

  return (
    <section id="demo" className="w-full">
      {/* gap-px over a border-coloured background draws the hairlines between cells. */}
      <div
        role="tablist"
        aria-label="How PinnaclePX works"
        className="grid grid-cols-2 gap-px border-b border-border bg-border lg:grid-cols-4"
      >
        {DEMO_ITEMS.map((item) => {
          const selected = item.id === active.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={PANEL_ID}
              onClick={() => {
                setActive(item)
              }}
              className={cn(
                'relative min-h-11 cursor-pointer bg-surface p-5 text-sm font-semibold whitespace-nowrap transition-colors hover:bg-accent',
                selected ? 'text-on-surface' : 'text-on-surface-muted',
              )}
            >
              {item.label}
              {selected && (
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-brand" />
              )}
            </button>
          )
        })}
      </div>

      <div id={PANEL_ID} role="tabpanel" aria-labelledby={`tab-${active.id}`} className="p-4">
        <Image
          src={active.image.src}
          alt={active.image.alt}
          width={1600}
          height={900}
          priority
          className="min-h-100 w-full rounded-xl border border-border object-cover p-1"
        />
      </div>
    </section>
  )
}
