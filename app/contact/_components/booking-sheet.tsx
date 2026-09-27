'use client'

import { X } from 'lucide-react'
import { type CSSProperties, useEffect, useEffectEvent, useRef, useState } from 'react'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { sectionLead, titleHeading } from '@/app/_components/section-styles'
import { BookingPageLink } from '@/app/contact/_components/book-call'
import {
  announceBooked,
  type BookingRequest,
  onBookingRequest,
} from '@/app/contact/_components/booking-bus'
import { CALL, SHEET } from '@/app/contact/_components/contact-copy'
import { Button, buttonStyles } from '@/components/ui/button'
import { tapLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'
import { loadCal, mountCal } from '@/lib/booking/cal'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// open: the ink blooms from the press. closing: it drains back into the control, and only then
// does the dialog close. The phone menu's phases (mobile-nav.tsx).
type Phase = 'closed' | 'open' | 'closing'
// Where the calendar is: not asked for yet, on its way, ready to use, or not opened in time.
type Calendar = 'idle' | 'loading' | 'ready' | 'failed'
type Stage = 'ready' | 'failed' | 'booked'

// The longest a close waits for the drain to report its end before closing anyway: twice the
// drain, which is the header's step at the page's pace (900 ms against 450), the menu's rule.
const CLOSE_FAIL_SAFE_MS = CONFIG.motion.headerStepMs * CONFIG.contact.pace * 2

// What the status line says as the calendar opens, once, for a screen reader.
const STATUS: Readonly<Record<Calendar, string>> = {
  idle: '',
  loading: SHEET.loading,
  ready: SHEET.ready,
  failed: SHEET.failed,
}

// Each part's place in the sheet's settle-in (app/_styles/contact.css, .contact-sheet-part).
const part = (index: number) => ({ '--i': index }) as CSSProperties

// The skeleton's month of days and its column of times (.contact-skeleton), which stand in the
// card while the calendar loads; the deeper days are the stylesheet's.
const DAYS = Array.from({ length: 35 }, (_, day) => day)
const TIMES = Array.from({ length: 5 }, (_, time) => time)

// The calendar's sheet on /contact (ADR 0040): Cal.com's own booking page in its light theme, on
// a white card with the panels' cyan halo, over the whole screen on the ink's foot. A booking
// control in either card opens it (book-call.tsx, through booking-bus.ts) as a modal dialog, so
// the page under it is inert and covered; the ink blooms from the press, the head, the card and
// the foot settle in after it, and the close button before the calendar takes the focus. Closing,
// they fade and the ink drains back into the control.
//
// Nothing from Cal.com loads before the first open. Then the loader and the calendar come
// (lib/booking/cal.ts), a skeleton holds the card until the calendar says it is ready, and if it
// has not within CONFIG.contact.booking.readyMs, or it fails, the card offers another try and the
// booking page itself; a calendar ready after all still takes the card. A second open finds the
// calendar where the first left it. The frame's own title is replaced with the sheet's heading.
//
// It closes by the round button before the calendar, the Close after it (Escape may never leave
// Cal.com's frame, and Tab always does), or Escape from the page. The ink drains back into the
// control that opened it, which takes the focus back. A booking made in the calendar is counted,
// said on the sheet's status line and told to the call card, and the sheet stays open on
// Cal.com's own confirmation.
export function BookingSheet() {
  const [phase, setPhase] = useState<Phase>('closed')
  const [calendar, setCalendar] = useState<Calendar>('idle')
  // A call booked in the calendar, which the status line then says in place of the calendar's.
  const [isBooked, setBooked] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const readyTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Each stage is counted once a page view, however often the sheet opens or the frame reports.
  const counted = useRef(new Set<Stage>())

  function count(stage: Stage) {
    if (counted.current.has(stage)) return
    counted.current.add(stage)
    trackEvent('booking', { stage })
  }

  function ready() {
    clearTimeout(readyTimer.current)
    setCalendar('ready')
    const frame = frameRef.current?.querySelector('iframe')
    if (frame instanceof HTMLIFrameElement) frame.title = BOOK_CALL.label
    count('ready')
  }

  function failed() {
    clearTimeout(readyTimer.current)
    setCalendar((current) => (current === 'ready' ? current : 'failed'))
    count('failed')
  }

  function booked() {
    count('booked')
    setBooked(true)
    announceBooked()
  }

  function startCal() {
    const frame = frameRef.current
    if (frame === null) return
    setCalendar('loading')
    mountCal(frame, { ready, failed, booked })
    loadCal().catch(failed)
    clearTimeout(readyTimer.current)
    readyTimer.current = setTimeout(failed, CONFIG.contact.booking.readyMs)
  }

  const open = useEffectEvent((request: BookingRequest) => {
    const dialog = dialogRef.current
    if (dialog === null || dialog.open) return
    trigger.current = request.trigger
    dialog.style.setProperty('--press-at', request.at)
    dialog.showModal()
    setPhase('open')
    closeRef.current?.focus()
    if (calendar === 'idle') startCal()
  })

  useEffect(() => {
    const stop = onBookingRequest((request) => {
      open(request)
    })
    const timer = readyTimer
    return () => {
      stop()
      clearTimeout(timer.current)
    }
  }, [])

  // Closed once the ink has drained, or under reduced motion once the dialog has faded: the
  // transitions of the dialog and its ink, and nothing inside the calendar's card. getAnimations()
  // flushes style, so it returns the ones this commit has just started, and allSettled lets one
  // cancelled on the way count as ended (mobile-nav.tsx).
  useEffect(() => {
    const dialog = dialogRef.current
    if (phase !== 'closing' || dialog === null) return
    let live = true
    const done = () => {
      if (live) dialog.close()
    }
    const failSafe = setTimeout(done, CLOSE_FAIL_SAFE_MS)
    const ink = inkRef.current?.getAnimations() ?? []
    const ends = [...dialog.getAnimations(), ...ink].map((animation) => animation.finished)
    void Promise.allSettled(ends).then(done)
    return () => {
      live = false
      clearTimeout(failSafe)
    }
  }, [phase])

  function close() {
    setPhase((current) => (current === 'open' ? 'closing' : current))
  }

  // The dialog has closed: after the drain, or at once where the browser closes it without asking
  // (a second Escape with no press between them). Either way the control that opened it takes
  // the focus back; running twice does no harm.
  function closed() {
    setPhase('closed')
    const control = trigger.current
    if (control?.isConnected === true) control.focus()
  }

  // Another try clears the frame and mounts the calendar afresh; the focus waits on the close
  // button, one Tab before the calendar, since the button pressed has gone.
  function retry() {
    frameRef.current?.replaceChildren()
    startCal()
    closeRef.current?.focus()
  }

  return (
    <dialog
      ref={dialogRef}
      id="booking"
      aria-labelledby="booking-heading"
      data-phase={phase}
      data-lenis-prevent=""
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClose={closed}
      className="contact-sheet"
    >
      {/* The ink, a layer of its own that blooms and drains, and the sheet's words and calendar
          over it, which arrive once it has covered the page and leave before it drains
          (app/_styles/contact.css). */}
      <div ref={inkRef} aria-hidden="true" className="contact-sheet-ink" />
      <div className="contact-sheet-scroll">
        <div className="contact-sheet-inner">
          <div style={part(0)} className="contact-sheet-part contact-sheet-head contact-ink">
            <div className="flex flex-col gap-2">
              <h2 id="booking-heading" className={titleHeading}>
                {BOOK_CALL.label}
              </h2>
              <p className={sectionLead}>{SHEET.lead}</p>
            </div>
            <Button
              ref={closeRef}
              variant="outline"
              size="icon-lg"
              aria-label={SHEET.close}
              onClick={close}
              className="shrink-0"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>

          <div
            style={part(1)}
            data-cal={calendar}
            className="contact-sheet-part contact-sheet-card"
          >
            <div aria-hidden="true" className="contact-skeleton">
              <div className="contact-skeleton-month">
                <span />
                <span />
                <span />
              </div>
              <div className="contact-skeleton-days">
                {DAYS.map((day) => (
                  <span key={day} />
                ))}
              </div>
              <div className="contact-skeleton-times">
                {TIMES.map((time) => (
                  <span key={time} />
                ))}
              </div>
            </div>
            {/* Cal.com's host: the loader adds its element and frame here, and nothing else in the
              component writes inside it. */}
            <div ref={frameRef} className="contact-cal" />
            {calendar === 'failed' && (
              <div className="contact-sheet-failed">
                <p className="text-body">{SHEET.failed}</p>
                <button
                  type="button"
                  onClick={retry}
                  className={buttonStyles({ variant: 'primary', size: 'lg' })}
                >
                  {SHEET.retry}
                </button>
                <BookingPageLink location="contact-sheet-fallback" className={tapLinkStyles}>
                  {CALL.ownPage}
                </BookingPageLink>
              </div>
            )}
            <p role="status" className="sr-only">
              {isBooked ? CALL.booked : STATUS[calendar]}
              {isBooked && SITE.calConfirms && ` ${CALL.bookedNote}`}
            </p>
          </div>

          <div style={part(2)} className="contact-sheet-part contact-sheet-foot contact-ink">
            <BookingPageLink location="contact-sheet-link" className={`${tapLinkStyles} text-sm`}>
              {CALL.ownPage}
            </BookingPageLink>
            <button
              type="button"
              onClick={close}
              className={`${tapLinkStyles} cursor-pointer text-sm`}
            >
              {SHEET.closeShort}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
