'use client'

import { useId } from 'react'
import type { StepProps } from '@/app/start/_components/step-props'
import { captionStyles } from '@/components/ui/caption'
import { ChoiceCard } from '@/components/ui/choice-card'
import { Field, fieldStyles } from '@/components/ui/field'
import { PALETTES } from '@/lib/brief/palettes'
import type { ColoursAnswer } from '@/lib/brief/schema'
import { brandHexFrom } from '@/lib/brief/sketch'
import { SITE } from '@/lib/site'

// What the native picker shows while the typed code does not yet read as a colour: white, so the
// well sits empty in its white card, as the sketch sits grey, rather than showing black as though
// black had been chosen.
const FALLBACK_PICKER_VALUE = '#ffffff'
// The code the empty hex field offers before any colour reads, the same one the hex error names.
const EXAMPLE_HEX = '#2F6F4E'

type Props = StepProps & { onPreview: (value: ColoursAnswer | null) => void }

// The last question. The swatches sit on the badge shadow, the own-colour line is a caption with
// air rather than a rule, and the native picker is a small white card beside the hex field, with
// the same outline and forced-colours border as every control here. Enter in the hex field sends
// the brief, so its key says Go. The hex field's placeholder is the chosen palette's code, so the
// grey code and the swatch beside it always agree.
export function ColoursStep({ answers, errors, dispatch, onPreview }: Props) {
  const id = useId()
  const { colours } = answers
  const customHex = colours.kind === 'custom' ? colours.hex : ''
  const brandHex = brandHexFrom(colours)
  const pickerValue = brandHex ?? FALLBACK_PICKER_VALUE
  const hexPlaceholder = (brandHex ?? EXAMPLE_HEX).toUpperCase()
  // The palette card holding the group's Tab stop. A custom hex leaves no palette chosen, and
  // then the first card holds it, or the group would drop out of the Tab order.
  const chosen = PALETTES.findIndex(
    ({ id: paletteId }) => colours.kind === 'palette' && colours.paletteId === paletteId,
  )

  function setHex(hex: string) {
    dispatch({ type: 'set-colours', value: { kind: 'custom', hex } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Palette" className="grid gap-2 sm:grid-cols-2">
        {PALETTES.map(({ id: paletteId, label, hex }, index) => (
          <ChoiceCard
            key={paletteId}
            selected={index === chosen}
            tabbable={index === Math.max(chosen, 0)}
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
                className="size-8 shrink-0 rounded-lg shadow-badge"
              />
            }
          />
        ))}
      </div>

      <p className={`${captionStyles} pt-2`}>or your own colour</p>

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
              enterKeyHint="go"
              placeholder={hexPlaceholder}
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
              className="size-12 shrink-0 cursor-pointer rounded-xl bg-surface p-1 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink forced-colors:border"
            />
          </span>
        )}
      </Field>

      <p className="text-sm text-on-surface-muted">{SITE.colourPromise}</p>
    </div>
  )
}
