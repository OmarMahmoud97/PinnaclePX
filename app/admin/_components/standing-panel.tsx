import type { ReactNode } from 'react'
import { card, cardHeading, cardPad } from '@/app/_components/section-styles'
import { PendingButton } from '@/app/admin/_components/pending-button'
import { StandingForm } from '@/app/admin/_components/standing-form'
import { buildLine, callLine, sweepLine } from '@/app/admin/_components/standing'
import { captionStyles } from '@/components/ui/caption'
import { addMinutes, formatLondonRelative, nextWholeHour, toLondonLocal } from '@/lib/brief/time'
import { CONFIG } from '@/lib/config'
import type { BriefOverviewRow } from '@/lib/db/briefs'

// A field on the panel: the site's tokens, 16px so iOS never zooms it, the authored focus outline.
const inputStyles =
  'w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-on-surface caret-brand-ink placeholder:text-on-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink'

const STAGES = [
  ['quoted', 'Quoted'],
  ['won', 'Won'],
  ['lost', 'Lost'],
] as const

type Props = Readonly<{
  row: BriefOverviewRow
  now: Date
  // Cal.com bookings that matched no brief, soonest first, for the time field to offer.
  unmatched: readonly Date[]
  briefsOfPerson: number
  // The example route draws the panel with nothing wired, so a browser carrying the owner's
  // credentials can never post from it.
  example?: boolean | undefined
}>

// Where a brief stands and the taps that move it (ADR 0047): how the build ended, the call, the
// outcome with its quote, and a note, in one form so every button carries the note and the quote
// with it. The outcome row is never hidden: a quote or a win can be recorded while a call is
// still ahead. Every word records what the visitor did; the owner's taps undo one another.
export function StandingPanel({ row, now, unmatched, briefsOfPerson, example = false }: Props) {
  const call = callLine(row, now)
  const ahead = unmatched.find((at) => addMinutes(at, CONFIG.call.minutes) > now)
  const prefill = ahead ?? nextWholeHour(now)
  const callAhead =
    row.callState === 'booked' &&
    row.callStartsAt !== null &&
    addMinutes(row.callStartsAt, CONFIG.call.minutes) > now
  const body = (
    <>
      <input type="hidden" name="slug" value={row.slug} />
      {briefsOfPerson > 1 && (
        <p className={captionStyles}>
          This person has {briefsOfPerson} briefs; the standing below is theirs, shared.
        </p>
      )}
      <Block label="Build">
        <p>{buildLine(row, now)}</p>
        <p className={captionStyles}>{sweepLine(row, now)}</p>
      </Block>
      <Block label="Call">
        {call.text !== '' && <p>{call.text}</p>}
        {call.control === 'book' && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <span className={captionStyles}>When (London time, optional)</span>
              <input
                type="datetime-local"
                name="startsAt"
                defaultValue={toLondonLocal(prefill)}
                className={inputStyles}
              />
              {ahead !== undefined && (
                <span className={captionStyles}>From a Cal.com booking that matched no brief.</span>
              )}
            </label>
            <PendingButton intent="book" variant="outline" size="lg">
              Mark as booked
            </PendingButton>
          </div>
        )}
        {call.control === 'not_happening' && (
          <Aside caption="Use if Cal.com no longer shows this call.">
            <PendingButton intent="unbook" variant="outline" size="lg">
              Not happening
            </PendingButton>
          </Aside>
        )}
        {call.control === 'unbook' && (
          <PendingButton intent="unbook" variant="outline" size="lg" className="self-start">
            Unmark
          </PendingButton>
        )}
        {call.control === 'no_show' && (
          <PendingButton intent="no_show" variant="outline" size="lg" className="self-start">
            No-show
          </PendingButton>
        )}
      </Block>
      <Block label="Outcome">
        {callAhead && row.callStartsAt !== null && (
          <p>Call is {formatLondonRelative(row.callStartsAt, now)}.</p>
        )}
        <label className="flex max-w-xs flex-col gap-1">
          <span className={captionStyles}>Quote, whole pounds</span>
          <input
            name="quotePounds"
            inputMode="numeric"
            pattern="[0-9]*"
            defaultValue={row.quotePounds ?? CONFIG.price.from}
            className={inputStyles}
          />
        </label>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {STAGES.map(([intent, label]) => (
            <PendingButton
              key={intent}
              intent={intent}
              size="lg"
              variant={row.enquiryStage === intent ? 'contrast' : 'outline'}
              pressed={row.enquiryStage === intent}
            >
              {label}
            </PendingButton>
          ))}
        </div>
        <p className={captionStyles}>
          Tap Quoted when the quote goes out. Tap the filled one again to clear it. Lost keeps the
          quote as a fact.
        </p>
      </Block>
      <Block label="Note">
        <textarea
          name="note"
          rows={3}
          maxLength={CONFIG.admin.noteMaxChars}
          defaultValue={row.note}
          placeholder="What was agreed. Nothing you would not show them."
          className={`${inputStyles} field-sizing-content min-h-24`}
        />
        <p className={captionStyles}>
          Deleted with their last brief. They may ask to read it. Keep to the enquiry; no phone
          numbers.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <PendingButton intent="note" size="lg">
            Save note
          </PendingButton>
          {row.noteAt !== null && (
            <span className={captionStyles}>Saved {formatLondonRelative(row.noteAt, now)}</span>
          )}
        </div>
      </Block>
      <div className="border-t border-border pt-4">
        <PendingButton intent="unopen" variant="ghost">
          Mark as new
        </PendingButton>
      </div>
    </>
  )
  return (
    <section className={`${card} ${cardPad} flex flex-col gap-5`} aria-labelledby="standing">
      <h2 id="standing" className={cardHeading}>
        Where it stands
      </h2>
      {example ? (
        <form className="flex flex-col gap-5">
          <fieldset disabled className="flex flex-col gap-5">
            {body}
          </fieldset>
          <p className={captionStyles}>Example page: the buttons do nothing.</p>
        </form>
      ) : (
        <StandingForm>{body}</StandingForm>
      )}
    </section>
  )
}

function Block({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className={captionStyles}>{label}</h3>
      {children}
    </div>
  )
}

function Aside({ caption, children }: Readonly<{ caption: string; children: ReactNode }>) {
  return (
    <div className="flex flex-col items-start gap-1">
      {children}
      <span className={captionStyles}>{caption}</span>
    </div>
  )
}
