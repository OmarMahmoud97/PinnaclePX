import { BrowserFrame } from '@/components/sketch/browser-frame'
import { PhoneSketch } from '@/components/sketch/phone-sketch'
import type { SketchModel } from '@/components/sketch/sketch-model'
import {
  Bar,
  CtaPill,
  Headline,
  ImageBlock,
  Paragraph,
  PhotoFill,
  Wordmark,
} from '@/components/sketch/sketch-parts'

// Read once at load, outside render, so the footer line never differs between two renders.
const YEAR = new Date().getFullYear()

const FEATURES = [0, 1, 2] as const

// Below lg the phone stands alone beside the brief list at 0.7 of its size (101 by 213) (half
// size on a screen under 760 tall, app/_styles/start.css), which keeps the region inside the
// 320 px that brief.spec.ts "the page fits a phone" allows; from lg it sits over the browser's
// corner at full size. CSS zoom, not a transform, so the row lays out at the zoomed size. The
// min-height of 0 from lg keeps the frame at 9:19 in Safari, which otherwise grows the absolutely
// placed frame to fit its screen (367 px tall, not 304) and changes its height as answers land.
// Literal classes so Tailwind can see them.
const PHONE = 'max-lg:[zoom:0.7] lg:absolute lg:right-0 lg:bottom-0 lg:min-h-0'

type Props = { model: SketchModel }

// A schematic homepage drawn from the visitor's answers and nothing else. The phone frame shows
// at every width; the browser frame joins it from lg, with the phone over its corner. Both stay
// in the DOM at every width, so the region always holds one sketch and the same marks. Dashed
// slots wait for an answer; grey bars stand for copy we will write later. Decorative:
// sketch-chips.tsx carries the text version. The caller sets the model's variables, so the
// frames and the pool behind them share one palette.
//
// The first photo fills the hero image and the next three the feature cards; the dark style
// turns the whole page dark.
export function BriefSketch({ model }: Props) {
  const { company } = model

  return (
    <div aria-hidden="true" className="relative lg:w-full lg:max-w-2xl lg:pr-14 lg:pb-10">
      <BrowserFrame company={company} coloured={model.coloured} className="hidden lg:block">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <Wordmark model={model} frame="browser" />
            <span className="flex items-center gap-2">
              <Bar part="nav-link" className="h-1.5 w-7" />
              <Bar part="nav-link" className="h-1.5 w-7" />
              <span
                data-part="nav-cta"
                className="h-2 w-12 rounded-full bg-(--sketch-strong) transition-colors duration-400"
              />
            </span>
          </div>

          <div className="grid grid-cols-[1.15fr_1fr] items-center gap-6">
            <div className="flex flex-col gap-3">
              <span
                data-part="eyebrow"
                className="h-1.5 w-10 rounded-full bg-(--sketch-strong)/70 transition-colors duration-400"
              />
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
                  data-part="card"
                  className="flex flex-col gap-2 rounded-lg border border-(--sketch-line) p-3"
                >
                  {photo === undefined ? (
                    <span className="size-5 rounded-md bg-(--sketch-soft) ring-1 ring-(--sketch-strong)/40 transition-colors duration-400" />
                  ) : (
                    <PhotoFill
                      key={photo}
                      url={photo}
                      style={model.imageStyle}
                      className="size-5 animate-sketch-in rounded-md"
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

        <div
          data-part="footer"
          className="flex items-center justify-between border-t border-(--sketch-line) bg-(--sketch-bg-muted) px-6 py-3 text-[9px] text-(--sketch-muted) tabular-nums transition-colors duration-500"
        >
          <span key={company} className="flex animate-sketch-in items-center gap-1.5">
            <span>© {YEAR}</span>
            {company === '' ? <Bar className="h-1.5 w-12" /> : <span>{company}</span>}
          </span>
          <span className="flex gap-3">
            <Bar className="h-1.5 w-8" />
            <Bar className="h-1.5 w-8" />
            <Bar className="h-1.5 w-8" />
          </span>
        </div>
      </BrowserFrame>

      <PhoneSketch model={model} className={PHONE} />
    </div>
  )
}
