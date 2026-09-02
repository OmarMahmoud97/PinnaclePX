import { Check } from 'lucide-react'

type Props = { intro: string; items: readonly string[] }

export function FeatureList({ intro, items }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <p className="text-sm font-medium text-on-surface-muted">{intro}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
