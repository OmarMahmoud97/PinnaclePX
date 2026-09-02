import type { ReactNode } from 'react'

type Props = { icon: ReactNode; children: string }

// Pill label with a leading icon, shown above a heading.
export function Badge({ icon, children }: Props) {
  return (
    <p className="flex max-w-full items-center gap-2 rounded-full bg-surface-raised px-4 py-1.5 shadow-badge">
      <span aria-hidden="true" className="flex size-4 shrink-0 items-center [&_svg]:size-4">
        {icon}
      </span>
      <span className="truncate text-sm font-medium">{children}</span>
    </p>
  )
}
