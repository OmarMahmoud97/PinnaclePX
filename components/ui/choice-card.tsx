'use client'

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useState,
} from 'react'
import { finePointer } from '@/components/ui/fine-pointer'

// Which way each arrow moves through the group: down and right to the next card, up and left to
// the one before. Directions, not tuning numbers, so they stay out of CONFIG.
const ARROW_STEPS: Readonly<Record<string, number>> = {
  ArrowDown: 1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowLeft: -1,
}

// The card a key chooses in its group: an arrow's neighbour, wrapping from the last card to the
// first and back, or with a fine pointer the card a digit numbers, 1 for the first
// (docs/start-page-journey-plan.md, 4.7). Null for any other key.
function chosenBy(event: KeyboardEvent<HTMLButtonElement>): HTMLButtonElement | null {
  if (event.altKey || event.ctrlKey || event.metaKey) return null
  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (group === null) return null
  const radios = [...group.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
  const step = ARROW_STEPS[event.key]
  if (step !== undefined) {
    const at = radios.indexOf(event.currentTarget) + step + radios.length
    return radios[at % radios.length] ?? null
  }
  const digit = /^[1-9]$/.test(event.key) ? Number(event.key) : 0
  return digit > 0 && finePointer() ? (radios[digit - 1] ?? null) : null
}

// A key moves focus to the card it names and chooses it, as a native radio group does, and the
// page must not scroll as well, so the key's default is stopped; focusing the card still scrolls
// it clear of the ask, through the page's scroll padding. Enter sends the form on, as it does from
// a native radio, since a card holds its choice already.
function onKey(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === 'Enter') {
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
    return
  }
  const next = chosenBy(event)
  if (next === null) return
  event.preventDefault()
  next.focus()
  next.click()
}

type Props = {
  selected: boolean
  // Whether this card holds the group's one Tab stop: the chosen card, or the first when none is.
  tabbable: boolean
  onSelect: () => void
  // Called with true while the pointer or focus rests on the card, false when it leaves.
  onPreview?: ((active: boolean) => void) | undefined
  title: string
  detail?: string | undefined
  media?: ReactNode
  // A colour the card is filled with, its label in white: a palette, which is visitor data.
  fill?: string | undefined
}

// A large, tappable option. Radio semantics with one Tab stop per group, on the chosen card or
// the first, and the arrows move the choice through it as a native radio group does, so screen
// readers announce "2 of 4" and the keys do what that announcement promises.
//
// A tile at least 64px tall: a well of the card's ground, or filled with a palette's colour. Chosen
// is two cues, never colour alone: a ring and a drawn check, which sits on the corner of the card's
// picture where it has one, so the words beside it keep the card's width. A press sinks it a touch
// and a choice blooms from where it was pressed, the centre for a key (the tap's point is --tap-x
// and --tap-y).
// Its looks, its hover, and its chosen state under forced colours are /start's own rules, on the
// choice-card hook (app/_styles/start.css), so no new utility reaches the shared sheet. Focus is
// the authored outline and forced colours add a border, for the reasons fieldStyles gives
// (components/ui/field.tsx).
export function ChoiceCard({
  selected,
  tabbable,
  onSelect,
  onPreview,
  title,
  detail,
  media,
  fill,
}: Props) {
  // Where the card was last pressed, and whether it has been chosen since it mounted: a card
  // chosen before the question opened keeps its check and never blooms on arrival.
  const [tap, setTap] = useState<Readonly<{ x: number; y: number }> | null>(null)
  const [chosen, setChosen] = useState(false)
  const check = (
    <span aria-hidden="true" className="start-check">
      <svg viewBox="0 0 24 24">
        <path d="M20 6 9 17l-5-5" pathLength={1} />
      </svg>
    </span>
  )
  const style = {
    ...(fill === undefined ? {} : { backgroundColor: fill }),
    ...(tap === null ? {} : { '--tap-x': `${String(tap.x)}px`, '--tap-y': `${String(tap.y)}px` }),
  } as CSSProperties

  function press(event: PointerEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    setTap({ x: Math.round(event.clientX - box.left), y: Math.round(event.clientY - box.top) })
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabbable ? 0 : -1}
      data-fill={fill === undefined ? undefined : ''}
      data-bloom={chosen ? '' : undefined}
      style={style}
      onClick={(event) => {
        // A click a key made (an arrow's, or Enter's on a button) has no pointer behind it, so it
        // blooms from the centre.
        if (event.detail === 0) setTap(null)
        setChosen(true)
        onSelect()
      }}
      onPointerDown={press}
      onKeyDown={onKey}
      onMouseEnter={() => onPreview?.(true)}
      onMouseLeave={() => onPreview?.(false)}
      onFocus={() => onPreview?.(true)}
      onBlur={() => onPreview?.(false)}
      className="choice-card flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink forced-colors:border"
    >
      {media !== undefined && (
        <span className="start-tile-media">
          {media}
          {check}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-small font-medium">{title}</span>
        {detail !== undefined && <span className="text-sm text-on-surface-muted">{detail}</span>}
      </span>
      {media === undefined && check}
    </button>
  )
}
