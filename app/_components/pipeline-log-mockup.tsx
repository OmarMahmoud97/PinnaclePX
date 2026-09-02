import { WindowFrame } from '@/components/ui/window-frame'

// Mirrors the five pipeline stages and their event names.
const STAGES = [
  { event: 'pipeline/brief.completed', detail: '12 ms' },
  { event: 'pipeline/select.completed', detail: 'Meridian' },
  { event: 'pipeline/copy.completed', detail: '7 slots' },
  { event: 'pipeline/imagery.completed', detail: '4 images' },
  { event: 'pipeline/tokens.completed', detail: 'AA contrast' },
] as const

export function PipelineLogMockup() {
  return (
    <WindowFrame>
      <div className="space-y-1">
        <p>
          <span className="text-brand">$</span>
          <span className="ml-2">pinnaclepx generate --brief 8f3a</span>
        </p>
        {STAGES.map(({ event, detail }) => (
          <p key={event} className="flex justify-between gap-4 text-on-surface-muted">
            <span>{event}</span>
            <span className="font-semibold text-on-surface">{detail}</span>
          </p>
        ))}
        <p className="text-on-surface-muted">✓ Preview ready at /preview/8f3a</p>
      </div>
    </WindowFrame>
  )
}
