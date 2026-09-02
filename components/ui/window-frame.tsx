import type { ReactNode } from 'react'

const LIGHTS = ['bg-danger', 'bg-warning', 'bg-success'] as const

type Props = { title?: string | undefined; children: ReactNode }

// Mock application window: traffic lights, optional title, monospace body.
export function WindowFrame({ title, children }: Props) {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-3">
        <div aria-hidden="true" className="flex gap-2">
          {LIGHTS.map((light) => (
            <span key={light} className={`size-3 rounded-full ${light}`} />
          ))}
        </div>
        {title !== undefined && <span className="ml-2 text-xs text-on-surface-muted">{title}</span>}
      </div>
      <div className="bg-surface p-4 font-mono text-xs md:p-6 md:text-sm">{children}</div>
    </div>
  )
}
