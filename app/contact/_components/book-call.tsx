'use client'

import { type MouseEvent, type ReactNode, useEffect, useState, useSyncExternalStore } from 'react'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { onBooked, requestBooking } from '@/app/contact/_components/booking-bus'
import { CALL } from '@/app/contact/_components/contact-copy'
import { buttonStyles } from '@/components/ui/button'
import { tapLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { trackEvent } from '@/lib/analytics/events'
import { cn } from '@/lib/cn'
import { SITE } from '@/lib/site'

// useSyncExternalStore needs a subscribe function; hydration never changes again, so it is inert.
const subscribeToNothing = () => () => {
  // nothing to unsubscribe
}

type TriggerProps = Readonly<{ location: string; className: string }>

// "Book a 20-minute call" on /contact (ADR 0040). Until the page has woken up, and for good
// without JavaScript, it is the booking page itself in a new tab, so it always goes somewhere.
// Once hydrated it is a button that opens the calendar's sheet (booking-sheet.tsx) with the same
// classes, blooming from where it was pressed: the pointer, or the button's middle for Enter or
// Space. Cal.com loads from this press and nothing else, and only from one the visitor made, so
// a script's click, a key that moves the focus, a scroll or a return to the page never fetches a
// third party. With no sheet on the page it opens the booking page after all. A text link has no
// pointer of its own as a button, so it is given one.
export function BookCallTrigger({ location, className }: TriggerProps) {
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )

  if (!hydrated) {
    return (
      <a href={SITE.bookingUrl} target="_blank" rel="noreferrer" className={className}>
        {BOOK_CALL.label}
        <span className="sr-only"> {SITE.newTab}</span>
      </a>
    )
  }

  function open(event: MouseEvent<HTMLButtonElement>) {
    trackEvent('call_click', { location })
    const activated =
      event.isTrusted && !('userActivation' in navigator && !navigator.userActivation.isActive)
    if (!activated) return
    const box = event.currentTarget.getBoundingClientRect()
    const at =
      event.detail === 0
        ? `${String(box.left + box.width / 2)}px ${String(box.top + box.height / 2)}px`
        : `${String(event.clientX)}px ${String(event.clientY)}px`
    if (!requestBooking({ at, trigger: event.currentTarget })) {
      window.open(SITE.bookingUrl, '_blank', 'noreferrer')
    }
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-controls="booking"
      onClick={open}
      className={cn(className, 'cursor-pointer')}
    >
      {BOOK_CALL.label}
    </button>
  )
}

type PageLinkProps = Readonly<{ location: string; className: string; children: ReactNode }>

// The booking page itself, in a new tab, with the call counted where it was offered: under the
// call card's control, in the form's refusals, and in the calendar's sheet.
export function BookingPageLink({ location, className, children }: PageLinkProps) {
  return (
    <TrackedLink
      href={BOOK_CALL.href}
      target="_blank"
      rel="noreferrer"
      event="call_click"
      location={location}
      className={className}
    >
      {children}
      <span className="sr-only"> {SITE.newTab}</span>
    </TrackedLink>
  )
}

// The call card's ask (call-card.tsx): the booking control, the booking page as a plain link
// under it for a middle click, a modified one or a visitor who would rather leave the page, and,
// once a call is booked in the sheet, a line that says so where the ask was. The plain link is
// hidden without JavaScript, where the control is that link already. Cal.com's own email is
// promised only once the owner confirms it (SITE.calConfirms).
export function CallActions() {
  const [booked, setBooked] = useState(false)

  useEffect(
    () =>
      onBooked(() => {
        setBooked(true)
      }),
    [],
  )

  return (
    <div className="contact-call-actions flex flex-col items-start gap-3">
      <BookCallTrigger
        location="contact-card"
        className={buttonStyles({ variant: 'contrast', size: 'lg', className: 'w-full md:w-auto' })}
      />
      <BookingPageLink
        location="contact-card-link"
        className={`${tapLinkStyles} text-sm noscript:hidden`}
      >
        {CALL.ownPage}
      </BookingPageLink>
      {booked && (
        <p className="contact-booked text-sm">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="contact-check">
            <path pathLength={1} d="M20 6 9 17l-5-5" />
          </svg>
          <span>
            {CALL.booked}
            {SITE.calConfirms && ` ${CALL.bookedNote}`}
          </span>
        </p>
      )}
    </div>
  )
}
