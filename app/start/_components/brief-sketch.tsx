import { Lock } from 'lucide-react'
import { PhoneSketch } from '@/app/start/_components/phone-sketch'
import type { SketchModel } from '@/app/start/_components/sketch-model'
import {
  Bar,
  CtaPill,
  Headline,
  ImageBlock,
  Paragraph,
  PhotoFill,
  Wordmark,
} from '@/app/start/_components/sketch-parts'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { tabLabelFrom } from '@/lib/brief/sketch'

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

const FEATURES = [0, 1, 2] as const

// A schematic homepage drawn from the visitor's answers and nothing else: a browser frame with a
// phone frame over its corner. Dashed slots wait for an answer; grey bars stand for copy we will
// write later. Decorative: sketch-chips.tsx carries the text version. The wrapping element sets
// the model's variables, so the frames and the glow behind them share one palette.
//
// The first photo fills the hero image and the next three the feature cards; the dark style
// turns the whole page dark.
export function BriefSketch({ model }: { model: SketchModel }) {
  const { company } = model

  return (
    <div aria-hidden="true" className="relative w-full max-w-2xl lg:pr-14 lg:pb-20">
      <div className="relative">
        <CornerTicks edges={['top', 'bottom']} />
        <div className="overflow-hidden rounded-xl border border-(--sketch-line) bg-(--sketch-bg) text-[11px] text-(--sketch-fg) shadow-dialog transition-colors duration-500 sm:text-xs">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-(--sketch-line) bg-(--sketch-bg-muted) px-3 py-2 transition-colors duration-500">
            <span className="flex gap-1.5">
              <span className="size-2 rounded-full bg-(--sketch-line)" />
              <span className="size-2 rounded-full bg-(--sketch-line)" />
              <span className="size-2 rounded-full bg-(--sketch-line)" />
            </span>
            <span
              key={company}
              className="sketch-in flex items-center gap-1.5 rounded-md border border-(--sketch-line) bg-(--sketch-bg) px-3 py-0.5 font-mono text-[9px] text-(--sketch-muted)"
            >
              <Lock className="size-2.5" />
              {tabLabelFrom(company)}
            </span>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:gap-6 sm:p-6">
            <div className="flex items-center justify-between">
              <Wordmark model={model} frame="browser" />
              <span className="flex items-center gap-2">
                <Bar className="h-1.5 w-7" />
                <Bar className="h-1.5 w-7" />
                <span className="h-2 w-12 rounded-full bg-(--sketch-strong) transition-colors duration-400" />
              </span>
            </div>

            <div className="grid grid-cols-[1.15fr_1fr] items-center gap-5 sm:gap-6">
              <div className="flex flex-col gap-3">
                <span className="h-1.5 w-10 rounded-full bg-(--sketch-strong)/70 transition-colors duration-400" />
                <Headline model={model} frame="browser" />
                <Paragraph model={model} frame="browser" />
                <CtaPill model={model} frame="browser" />
              </div>
              <ImageBlock model={model} className="aspect-4/3" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {FEATURES.map((n) => {
                const photo = model.photos[n + 1]
                return (
                  <span
                    key={n}
                    className="flex flex-col gap-2 rounded-lg border border-(--sketch-line) p-3"
                  >
                    {photo === undefined ? (
                      <span className="size-5 rounded-md bg-(--sketch-soft) ring-1 ring-(--sketch-strong)/40 transition-colors duration-400" />
                    ) : (
                      <PhotoFill
                        key={photo}
                        url={photo}
                        style={model.imageStyle}
                        className="sketch-in size-5 rounded-md"
                      />
                    )}
                    <span className="mt-1 block h-2 w-2/3 rounded-full bg-(--sketch-dash)" />
                    <Bar className="h-1.5 w-full" />
                    <Bar className="h-1.5 w-4/5" />
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-(--sketch-line) bg-(--sketch-bg-muted) px-5 py-3 font-mono text-[9px] text-(--sketch-muted) transition-colors duration-500 sm:px-6">
            <span key={company} className="sketch-in flex items-center gap-1.5">
              <span>© {YEAR}</span>
              {company === '' ? <Bar className="h-1.5 w-12" /> : <span>{company}</span>}
            </span>
            <span className="flex gap-3">
              <Bar className="h-1.5 w-8" />
              <Bar className="h-1.5 w-8" />
              <Bar className="h-1.5 w-8" />
            </span>
          </div>
        </div>
      </div>

      <PhoneSketch model={model} className="absolute right-0 bottom-0 hidden lg:block" />
    </div>
  )
}
