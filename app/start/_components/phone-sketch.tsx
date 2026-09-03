import type { SketchModel } from '@/app/start/_components/sketch-model'
import {
  Bar,
  CtaPill,
  Headline,
  ImageBlock,
  Paragraph,
  Wordmark,
} from '@/app/start/_components/sketch-parts'
import { cn } from '@/lib/cn'

type Props = { model: SketchModel; className?: string | undefined }

// The same answers in a phone frame, laid over the browser's corner the way a mock-up board
// shows both. Small screens show the browser frame alone.
export function PhoneSketch({ model, className }: Props) {
  return (
    <div
      className={cn(
        'w-36 overflow-hidden rounded-[1.25rem] border border-(--sketch-line) bg-(--sketch-bg) text-[8px] text-(--sketch-fg) shadow-dialog ring-4 ring-scrim/5 transition-colors duration-500',
        className,
      )}
    >
      <div className="flex justify-center pt-2 pb-1">
        <Bar className="h-1 w-8" />
      </div>
      <div className="flex flex-col gap-2.5 px-3 pt-1 pb-3">
        <div className="flex items-center justify-between">
          <Wordmark model={model} frame="phone" />
          <span className="flex flex-col gap-0.5">
            <Bar className="h-0.5 w-3" />
            <Bar className="h-0.5 w-3" />
          </span>
        </div>
        <Headline model={model} frame="phone" />
        <Paragraph model={model} frame="phone" />
        <CtaPill model={model} frame="phone" />
        <ImageBlock model={model} className="aspect-4/3" />
      </div>
    </div>
  )
}
