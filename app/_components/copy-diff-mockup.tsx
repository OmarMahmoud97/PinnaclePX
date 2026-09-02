import { WindowFrame } from '@/components/ui/window-frame'

const REMOVED = [
  'headline: "Welcome to our website"',
  'subhead: "We offer great services"',
  'cta: "Click here"',
] as const

const ADDED = [
  'headline: "Bookkeeping for busy founders"',
  'subhead: "Month-end close in three days"',
  'cta: "Book a free review"',
] as const

export function CopyDiffMockup() {
  return (
    <WindowFrame title="hero.copy.json">
      <div className="space-y-1">
        <p>{'slots: {'}</p>
        {REMOVED.map((line) => (
          <p
            key={line}
            className="border-l-2 border-danger bg-danger/10 pl-2 text-danger line-through"
          >
            - {line}
          </p>
        ))}
        {ADDED.map((line) => (
          <p key={line} className="border-l-2 border-success bg-success/10 pl-2 text-success">
            + {line}
          </p>
        ))}
        <p>{'}'}</p>
      </div>
    </WindowFrame>
  )
}
