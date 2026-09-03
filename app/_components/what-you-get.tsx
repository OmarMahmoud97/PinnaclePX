import { WHAT_YOU_GET_ITEMS } from '@/app/_components/what-you-get-items'

export function WhatYouGet() {
  return (
    <section id="what-you-get">
      <h2 className="sr-only">What you get</h2>
      {/* gap-px over a border-coloured background draws the hairlines between cells. */}
      <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {WHAT_YOU_GET_ITEMS.map(({ title, detail, Icon }) => (
          <li key={title} className="flex flex-col gap-2 bg-surface p-6">
            <Icon aria-hidden="true" className="size-5 text-brand-deeper" />
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-on-surface-muted">{detail}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
