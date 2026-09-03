import type { ReactNode } from 'react'
import type { SketchModel } from '@/components/sketch/sketch-model'
import {
  Bar,
  CtaPill,
  Headline,
  ImageBlock,
  Paragraph,
  Wordmark,
} from '@/components/sketch/sketch-parts'
import { cn } from '@/lib/cn'

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

const FEATURES = [0, 1, 2] as const

type Props = {
  model: SketchModel
  // CSS zoom, not a transform: the frame lays out at the zoomed size and its text stays crisp.
  zoom?: number | undefined
  className?: string | undefined
  // A finished page laid under the sketch's screen, for the hero's build.
  built?: ReactNode | undefined
}

// The same answers in a phone frame, at a phone's proportions (9:19), laid over the browser's
// corner the way a mock-up board shows both, or on its own at a larger zoom where the browser
// frame has no room. Below the hero the page carries on: three feature rows and a footer.
export function PhoneSketch({ model, zoom = 1, className, built }: Props) {
  const { company } = model

  return (
    <div
      data-frame="phone"
      style={zoom === 1 ? undefined : { zoom }}
      className={cn(
        'flex aspect-[9/19] w-36 flex-col overflow-hidden rounded-[1.25rem] border border-(--sketch-line) bg-(--sketch-bg) text-[8px] text-(--sketch-fg) shadow-dialog ring-4 ring-scrim/5 transition-colors duration-500',
        className,
      )}
    >
      <div className="flex justify-center pt-2 pb-1">
        <Bar className="h-1 w-8" />
      </div>
      <div className="relative isolate flex flex-1 flex-col">
        {built}
        <div
          data-layer="sketch"
          className="relative z-10 flex flex-1 flex-col gap-2.5 px-3 pt-1 pb-3"
        >
          <div className="flex items-center justify-between">
            <Wordmark model={model} frame="phone" />
            <span data-part="menu" className="flex flex-col gap-0.5">
              <Bar className="h-0.5 w-3" />
              <Bar className="h-0.5 w-3" />
            </span>
          </div>
          <Headline model={model} frame="phone" />
          <Paragraph model={model} frame="phone" />
          <CtaPill model={model} frame="phone" />
          <ImageBlock model={model} className="aspect-4/3" />
          <div className="flex flex-col gap-1.5">
            {FEATURES.map((n) => (
              <span
                key={n}
                data-part="card"
                className="flex items-center gap-2 rounded-md border border-(--sketch-line) p-1.5"
              >
                <span className="size-3 shrink-0 rounded bg-(--sketch-soft) ring-1 ring-(--sketch-strong)/40 transition-colors duration-400" />
                <span className="flex flex-1 flex-col gap-1">
                  <span className="block h-1 w-1/2 rounded-full bg-(--sketch-dash)" />
                  <Bar className="h-0.5 w-4/5" />
                </span>
              </span>
            ))}
          </div>
          <div
            data-part="footer"
            className="mt-auto flex items-center justify-between border-t border-(--sketch-line) pt-2 font-mono text-[6px] text-(--sketch-muted)"
          >
            <span key={company} className="flex animate-sketch-in items-center gap-1">
              <span>© {YEAR}</span>
              {company === '' ? <Bar className="h-1 w-8" /> : <span>{company}</span>}
            </span>
            <Bar className="h-1 w-6" />
          </div>
        </div>
      </div>
    </div>
  )
}
