'use client'

import { useId } from 'react'
import type { StepProps } from '@/app/start/_components/step-props'
import { ChoiceCard } from '@/components/ui/choice-card'
import { Field, fieldStyles } from '@/components/ui/field'
import { PALETTES } from '@/lib/brief/palettes'
import type { ColoursAnswer } from '@/lib/brief/schema'
import { brandHexFrom } from '@/lib/brief/sketch'
import { SITE } from '@/lib/site'

// What the native picker shows while the typed code does not yet read as a colour.
const FALLBACK_PICKER_VALUE = '#000000'

type Props = StepProps & { onPreview: (value: ColoursAnswer | null) => void }

export function ColoursStep({ answers, errors, dispatch, onPreview }: Props) {
  const id = useId()
  const { colours } = answers
  const customHex = colours.kind === 'custom' ? colours.hex : ''
  const pickerValue = brandHexFrom(colours) ?? FALLBACK_PICKER_VALUE

  function setHex(hex: string) {
    dispatch({ type: 'set-colours', value: { kind: 'custom', hex } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Palette" className="grid gap-2 sm:grid-cols-2">
        {PALETTES.map(({ id: paletteId, label, hex }) => (
          <ChoiceCard
            key={paletteId}
            selected={colours.kind === 'palette' && colours.paletteId === paletteId}
            onSelect={() => {
              dispatch({ type: 'set-colours', value: { kind: 'palette', paletteId } })
            }}
            onPreview={(active) => {
              onPreview(active ? { kind: 'palette', paletteId } : null)
            }}
            title={label}
            media={
              <span
                aria-hidden="true"
                style={{ backgroundColor: hex }}
                className="size-8 shrink-0 rounded-lg border border-border"
              />
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm text-on-surface-muted">
        <span className="h-px flex-1 bg-border" />
        or your own colour
        <span className="h-px flex-1 bg-border" />
      </div>

      <Field
        id={id}
        label="Brand colour"
        hint="Your hex code, if you know it."
        error={errors.colours}
      >
        {(attributes) => (
          <span className="flex items-center gap-2">
            <input
              {...attributes}
              type="text"
              spellCheck={false}
              placeholder="#2F6F4E"
              value={customHex}
              onChange={(e) => {
                setHex(e.target.value)
              }}
              className={fieldStyles}
            />
            <input
              type="color"
              aria-label="Pick a colour"
              value={pickerValue}
              onChange={(e) => {
                setHex(e.target.value)
              }}
              className="size-11 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1 outline-none focus-visible:ring-2 focus-visible:ring-brand-deeper focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            />
          </span>
        )}
      </Field>

      <p className="text-sm text-on-surface-muted">{SITE.colourPromise}</p>
    </div>
  )
}
