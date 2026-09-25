'use client'

import { type KeyboardEvent, useId, useState } from 'react'
import { validateQuestion } from '@/app/start/_components/brief-reducer'
import { COLOURS } from '@/app/start/_components/start-copy'
import type { StepProps } from '@/app/start/_components/step-props'
import { ChoiceCard } from '@/components/ui/choice-card'
import { Field, fieldStyles } from '@/components/ui/field'
import { toSixDigitHex } from '@/lib/brief/hex'
import { PALETTES } from '@/lib/brief/palettes'
import type { ColoursAnswer } from '@/lib/brief/schema'
import { brandHexFrom } from '@/lib/brief/sketch'
import { SITE } from '@/lib/site'

// What the native picker shows while the typed code does not yet read as a colour: white, so the
// well sits empty in its white card, as the sketch sits grey, rather than showing black as though
// black had been chosen.
const FALLBACK_PICKER_VALUE = '#ffffff'

// A code complete enough to retint the sketch while it is typed: six digits. Three digits count
// only once the field is left, since they may be the start of six (plan 4.7).
const SIX_DIGITS = /^#[0-9a-f]{6}$/i

type Props = StepProps & {
  // The logo's own colour, when the browser found one (lib/logo/accent.ts).
  logoColour: string | null
  onPreview: (value: ColoursAnswer | null) => void
}

type Choice = 'palette' | 'own' | 'logo'

function choiceOf(colours: ColoursAnswer, logoColour: string | null): Choice {
  if (colours.kind === 'palette') return 'palette'
  return logoColour !== null && toSixDigitHex(colours.hex) === logoColour ? 'logo' : 'own'
}

// A swatch beside the name of a colour of the visitor's own, their data, so it keeps its colour
// under forced colours; before a code reads as a colour it shows the whole wheel
// (app/_styles/start.css).
function Swatch({ hex }: { hex: string | null }) {
  return (
    <span
      aria-hidden="true"
      style={hex === null ? undefined : { backgroundColor: hex }}
      className="start-swatch size-8 shrink-0 rounded-lg"
    />
  )
}

// The fourth question (docs/start-page-journey-plan.md, 4.6 and 4.7): one radio group of the four
// palettes, then "My own colour", then the logo's own colour when the browser found one in it.
// The palettes are tiles filled with their colour, labelled in white (5.99:1 at the least); a
// colour of the visitor's own, whose white label could fail, is a plain tile with a swatch.
// Choosing "My own colour" shows the hex field after the group and leaves the focus where it was;
// the promise about the visitor's colour then joins the field's hint, which is where it applies,
// and keeps a 900 px desk from scrolling with the field open (plan 4.3's first cut).
// Arrows and, with a fine pointer, digits choose (components/ui/choice-card.tsx). A hover or focus
// previews a colour in the sketch; a code being typed retints it only once it is complete, so the
// sketch never flashes through the colours of half a code.
export function ColoursStep({ answers, errors, dispatch, logoColour, onPreview }: Props) {
  const id = useId()
  const setId = `${id}-set`
  const { colours } = answers
  const choice = choiceOf(colours, logoColour)
  const hex = colours.kind === 'custom' ? colours.hex : ''
  // The visitor's own code, kept while a palette is tried, so choosing their colour again brings it
  // back; whether Enter has just found it good; and the last answer complete enough to show, which
  // the sketch keeps while a code is half-typed.
  const [ownHex, setOwnHex] = useState(choice === 'own' ? hex : '')
  const [confirmed, setConfirmed] = useState(false)
  const [held, setHeld] = useState<ColoursAnswer>(colours)
  const typing = choice === 'own' && !SIX_DIGITS.test(hex.trim())

  function choose(value: ColoursAnswer) {
    setConfirmed(false)
    if (value.kind === 'palette' || SIX_DIGITS.test(value.hex.trim())) setHeld(value)
    dispatch({ type: 'set-colours', value })
  }

  function setHex(value: string) {
    setOwnHex(value)
    choose({ kind: 'custom', hex: value })
    onPreview(SIX_DIGITS.test(value.trim()) ? null : held)
  }

  // Leaving the field completes a three-digit code; anything shorter keeps the last colour shown.
  function settleHex() {
    if (toSixDigitHex(hex) === null) {
      onPreview(held)
      return
    }
    setHeld(colours)
    onPreview(null)
  }

  // Enter in the hex field checks the code and keeps the focus where it is, saying what it found
  // in the field's description. It never sends the brief: a field's Enter would submit the form,
  // and sending runs the paid build (plan 4.7). The phone keyboard's key says Done to match. Not
  // while an input method is composing, where Enter belongs to the word.
  function checkOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    dispatch({ type: 'check', question: 'colours' })
    setConfirmed(Object.keys(validateQuestion('colours', answers)).length === 0)
  }

  const cards = [
    ...PALETTES.map(({ id: paletteId, label, hex: paletteHex }) => ({
      key: paletteId,
      value: { kind: 'palette', paletteId } as const,
      selected: colours.kind === 'palette' && colours.paletteId === paletteId,
      title: label,
      detail: undefined,
      fill: paletteHex,
      swatch: undefined,
    })),
    {
      key: 'own',
      value: { kind: 'custom', hex: ownHex } as const,
      selected: choice === 'own',
      title: COLOURS.ownColour,
      detail: COLOURS.ownColourDetail,
      fill: undefined,
      swatch: toSixDigitHex(ownHex),
    },
    ...(logoColour === null
      ? []
      : [
          {
            key: 'logo',
            value: { kind: 'custom', hex: logoColour } as const,
            selected: choice === 'logo',
            title: COLOURS.logoColour,
            detail: COLOURS.logoColourDetail,
            fill: undefined,
            swatch: logoColour,
          },
        ]),
  ]

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={COLOURS.group} className="grid gap-2 sm:grid-cols-2">
        {cards.map((card) => (
          <ChoiceCard
            key={card.key}
            selected={card.selected}
            tabbable={card.selected}
            onSelect={() => {
              choose(card.value)
            }}
            onPreview={(active) => {
              onPreview(active ? card.value : typing ? held : null)
            }}
            title={card.title}
            detail={card.detail}
            fill={card.fill}
            media={card.swatch === undefined ? undefined : <Swatch hex={card.swatch} />}
          />
        ))}
      </div>

      {choice === 'own' && (
        <Field
          id={id}
          label={COLOURS.hexLabel}
          hint={
            <>
              {COLOURS.hexHint} {SITE.colourPromise}
            </>
          }
          notes={confirmed ? [setId] : []}
          error={errors.colours}
        >
          {(attributes) => (
            <span className="flex items-center gap-2">
              <input
                {...attributes}
                type="text"
                spellCheck={false}
                enterKeyHint="done"
                placeholder={COLOURS.hexPlaceholder}
                value={hex}
                onChange={(e) => {
                  setHex(e.target.value)
                }}
                onBlur={settleHex}
                onKeyDown={checkOnEnter}
                className={fieldStyles}
              />
              <input
                type="color"
                aria-label={COLOURS.picker}
                value={brandHexFrom(colours) ?? FALLBACK_PICKER_VALUE}
                onChange={(e) => {
                  setHex(e.target.value)
                }}
                className="size-12 shrink-0 cursor-pointer rounded-xl bg-surface p-1 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink forced-colors:border"
              />
            </span>
          )}
        </Field>
      )}
      {choice === 'own' && confirmed && (
        <p id={setId} className="text-sm text-on-surface-muted">
          {COLOURS.hexSet}
        </p>
      )}

      {choice !== 'own' && <p className="text-sm text-on-surface-muted">{SITE.colourPromise}</p>}
    </div>
  )
}
