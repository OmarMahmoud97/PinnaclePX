import type { LucideIcon } from 'lucide-react'

type Props = { Icon: LucideIcon; children: string }

// Pill label with a leading icon, shown above a heading.
export function Badge({ Icon, children }: Props) {
  return (
    <p className="flex items-center gap-2 rounded-full bg-surface-raised px-4 py-1.5 text-sm font-medium shadow-badge">
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </p>
  )
}
