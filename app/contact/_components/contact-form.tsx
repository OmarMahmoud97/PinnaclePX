'use client'

import { ArrowRight, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import {
  type CSSProperties,
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { card, cardBody, cardPad, stepHeading } from '@/app/_components/section-styles'
import { submitContact } from '@/app/contact/_components/actions'
import { BookCallTrigger, BookingPageLink } from '@/app/contact/_components/book-call'
import {
  CONTACT_META,
  emailNote,
  ENVELOPE,
  KEPT,
  meterLine,
  NO_SCRIPT,
  SENDING,
  SENT,
  sentHeading,
  STUCK,
  WRITE,
} from '@/app/contact/_components/contact-copy'
import { type Bloom, contactReducer, INITIAL } from '@/app/contact/_components/contact-reducer'
import { failureOf, outcomeOf, sendMessage } from '@/app/contact/_components/send-contact'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { Field, FieldError, fieldStyles } from '@/components/ui/field'
import { tapLinkStyles, textLinkStyles } from '@/components/ui/text-link'
import { trackEvent } from '@/lib/analytics/events'
import { firstNameFrom } from '@/lib/brief/names'
import { CONFIG } from '@/lib/config'
import { CONTACT_FIELDS, checkContact, type ContactField } from '@/lib/contact/checks'
import { subjectLine } from '@/lib/contact/subject'
import { SITE } from '@/lib/site'

// The wait before a part of the form settles in after its card (app/_styles/contact.css,
// .contact-in), in steps of the page's stagger.
const settleAt = (place: number) => ({ '--in-at': place }) as CSSProperties

// The tab's own title, which the sent card replaces and a way back restores.
const PAGE_TITLE = `${CONTACT_META.title} | ${SITE.name}`

// A link in a sentence, kept whole on one line: the privacy answer's, and the call in a refusal.
const wholeLink = `${textLinkStyles} whitespace-nowrap`

// The visitor's own words inside a sentence of ours, isolated, so a name in a right-to-left
// script cannot reorder the words around it.
function isolated(text: string, value: string): ReactNode {
  const at = value === '' ? -1 : text.indexOf(value)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <bdi>{value}</bdi>
      {text.slice(at + value.length)}
    </>
  )
}

type EnvelopeProps = Readonly<{ id?: string | undefined; name: string; email: string }>

// What lands (lib/contact/subject.ts): the subject the studio sees, the very string its email
// carries, and the address a reply goes to once there is one. Under the fields as the visitor
// types, so a mistyped address is caught before Send at every width, and again as the receipt.
function Envelope({ id, name, email }: EnvelopeProps) {
  const address = email.trim()
  return (
    <dl id={id} className="contact-envelope">
      <div>
        <dt>{ENVELOPE.subject}</dt>
        <dd>
          <bdi>{subjectLine(name)}</bdi>
        </dd>
      </div>
      {address !== '' && (
        <div>
          <dt>{ENVELOPE.from}</dt>
          <dd>
            <bdi>{address}</bdi>
          </dd>
        </div>
      )}
    </dl>
  )
}

// The writing route (ADR 0040): the white card, built like the hero's prompt card and /start's
// question card, with the message first, then the name and the address, the privacy answer before
// Send, and the envelope that shows what will land. Light checks run here as the visitor leaves a
// field and as they send (lib/contact/checks.ts); the Server Action checks again with the same
// words (actions.ts).
//
// The form never posts by itself. Its method is dialog, which outside a <dialog> does nothing,
// so before hydration no name or message reaches a URL, and without JavaScript the fields and
// Send are hidden and the card offers the call instead: there is never a Send that does nothing.
// Words typed before hydration are carried into the first controlled render.
//
// The send is the house's bloom (app/_styles/contact.css, .contact-bloom), inside the card: the
// ink opens at Send, measured from Send itself, holds while the message is on its way, then runs
// on over the card, which becomes the ink card's twin with a receipt, or drains back with the
// reason and every word kept. The hold ends only once its animation has played and
// CONFIG.contact.send.minHoldMs has passed, so "Off it goes." is always read.
//
// Send carries `hero-cta`, the id the header watches (app/_components/header-chrome.tsx), so the
// header's blue ask waits until Send has scrolled away and two blue buttons never show at once.
// The header reads it once, at mount, so Send is the same node for the page's life: the form is
// hidden once the message has gone, never unmounted.
export function ContactForm() {
  const [state, dispatch] = useReducer(contactReducer, INITIAL)
  const { fields, errors, status, bloom, failure, failures } = state
  const busy = status === 'sending'
  const uid = useId()
  const meterId = `${uid}-meter`

  const cardRef = useRef<HTMLElement>(null)
  const sendRef = useRef<HTMLButtonElement>(null)
  const bloomRef = useRef<HTMLDivElement>(null)
  const sentRef = useRef<HTMLHeadingElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  // When the form was opened, so the server can tell a person's pace from a bot's, and when Send
  // was pressed, for the hold's floor. Both set outside rendering.
  const openedAt = useRef(0)
  const pressedAt = useRef(0)
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // What takes the focus the next time the form is showing: the first field with an error after a
  // send that did not pass its checks, or the field a way back from the sent card returns to.
  const focusNext = useRef<ContactField | 'first-invalid' | null>(null)
  // A field left for Send is checked by the send a moment later, so it is not checked on the way
  // out as well: its message would appear between the press and the release, push Send from under
  // the pointer, and the click would miss. Set as Send is pressed, cleared as a field is entered.
  const pressingSend = useRef(false)

  useEffect(() => {
    openedAt.current = Date.now()
    const timer = holdTimer
    return () => {
      clearTimeout(timer.current)
    }
  }, [])

  // Words typed before the page woke up are still in the fields, where hydration left them; the
  // first controlled render would clear them, so they are read back into the state first.
  const restore = useEffectEvent(() => {
    const typed = {
      message: messageRef.current?.value ?? '',
      name: nameRef.current?.value ?? '',
      email: emailRef.current?.value ?? '',
    }
    if (Object.values(typed).some((value) => value !== '')) {
      dispatch({ type: 'restore', fields: typed })
    }
  })
  useLayoutEffect(() => {
    restore()
  }, [])

  // The focus moves once the form shows what it should. After a send that failed its checks, the
  // first field marked invalid takes it and its message is scrolled clear of the header (the
  // root's scroll padding), since a screen reader hears the message through the control's
  // description; a way back from the sent card lands on the field it names.
  useEffect(() => {
    const next = focusNext.current
    if (next === null || status !== 'editing') return
    focusNext.current = null
    const field = next === 'first-invalid' ? CONTACT_FIELDS.find((each) => each in errors) : next
    if (field === undefined) return
    const control = { message: messageRef, name: nameRef, email: emailRef }[field].current
    if (control === null) return
    control.focus()
    if (next === 'first-invalid') {
      document
        .getElementById(`${control.id}-error`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }
  }, [errors, status])

  // Sent: the heading takes the focus without moving the page, and the tab says the message went.
  useEffect(() => {
    if (status !== 'sent') return
    sentRef.current?.focus({ preventScroll: true })
    document.title = `${SENT.docTitle} | ${SITE.name}`
  }, [status])

  // The hold has played; it ends once the floor since the press has passed too.
  function holdEnded() {
    clearTimeout(holdTimer.current)
    const left = CONFIG.contact.send.minHoldMs - (performance.now() - pressedAt.current)
    holdTimer.current = setTimeout(
      () => {
        dispatch({ type: 'held' })
      },
      Math.max(0, left),
    )
  }

  // A phase with nothing to play, as without the page's sheet, ends at once rather than holding
  // the card, as SendBloom's does on /start.
  const unplayed = useEffectEvent((phase: Bloom) => {
    if (phase === 'hold') holdEnded()
    else dispatch({ type: 'bloomEnd' })
  })
  useLayoutEffect(() => {
    if (bloom !== null && bloomRef.current?.getAnimations().length === 0) unplayed(bloom)
  }, [bloom])

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status !== 'editing') return
    const found = checkContact(fields)
    if (Object.keys(found).length > 0) {
      focusNext.current = 'first-invalid'
      dispatch({ type: 'invalid', errors: found })
      trackEvent('contact_submit', { outcome: 'validation' })
      return
    }
    const hidden = new FormData(event.currentTarget).get('website')
    const website = typeof hidden === 'string' ? hidden : ''
    // The ink's start and the card's height, read once as the message goes: Send's centre, never
    // the pointer or the focus, and the form's height, which the sent card starts from. From 64rem
    // the sent card eases to the call card's height beside it, so that is read too.
    const box = cardRef.current
    const send = sendRef.current
    if (box !== null && send !== null) {
      const from = box.getBoundingClientRect()
      const ask = send.getBoundingClientRect()
      box.style.setProperty('--contact-card-h', `${String(box.offsetHeight)}px`)
      const call = document.getElementById('call')
      if (call !== null) box.style.setProperty('--contact-call-h', `${String(call.offsetHeight)}px`)
      box.style.setProperty(
        '--press-at',
        `${String(ask.left + ask.width / 2 - from.left)}px ${String(ask.top + ask.height / 2 - from.top)}px`,
      )
    }
    // A send from the keyboard, Enter in the address or Ctrl or Cmd+Enter in the message, starts in
    // a field the send is about to make inert, which would drop the focus to the page. It moves to
    // Send first, the one control that rides over the ink, and a failure finds it there.
    if (send !== null && document.activeElement !== send) send.focus({ preventScroll: true })
    dispatch({ type: 'send' })
    pressedAt.current = performance.now()
    const opened = openedAt.current
    const result = await sendMessage({
      submit: () => submitContact({ fields, openedForMs: Date.now() - opened, website }),
      waitMs: Math.max(0, CONFIG.form.minMs - (Date.now() - opened)),
      timeoutMs: CONFIG.contact.send.timeoutMs,
    })
    dispatch({ type: 'answer', result })
    trackEvent('contact_submit', { outcome: result.ok ? 'sent' : outcomeOf(result.reason) })
  }

  // Back to the form from the sent card: to write again, with the name and address kept, or to
  // fix the address, with every word kept.
  function back(to: 'again' | 'fix') {
    focusNext.current = to === 'again' ? 'message' : 'email'
    document.title = PAGE_TITLE
    dispatch({ type: to })
  }

  const edit = (field: ContactField) => (value: string) => {
    dispatch({ type: 'edit', field, value })
  }
  const enter = () => {
    pressingSend.current = false
  }
  const leave = (field: ContactField) => () => {
    if (!pressingSend.current) dispatch({ type: 'blur', field })
  }

  const refused = failure !== null && status === 'editing' ? failureOf(failure) : null
  const describedBy = refused === null ? 'contact-envelope' : 'contact-envelope contact-alert'

  return (
    <section
      ref={cardRef}
      id="write"
      aria-labelledby="write-heading"
      data-state={status}
      className={`contact-card ${card} ${cardPad}`}
    >
      <form
        method="dialog"
        noValidate
        hidden={status === 'sent'}
        onSubmit={(event) => {
          void submit(event)
        }}
        className="contact-form flex flex-col gap-6"
      >
        {/* A field for bots. Out of the tab order and hidden from assistive technology; a person
            never sees or fills it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {/* The heading and the lead arrive with the card itself, never after it: below 48rem the
            lead is the page's largest paint (app/_styles/contact.css). */}
        <div inert={busy} className="contact-quiet flex flex-col gap-3">
          <h2 id="write-heading" className={stepHeading}>
            {WRITE.heading}
          </h2>
          <p className={cardBody}>{WRITE.lead}</p>
          {/* The call on a phone's first screen, before the fields: the control that opens the
              calendar's sheet, as the call card's does. The call card keeps the call in reach
              from 48rem, and the booking page is one card below and in the sheet's foot. */}
          <p className="text-sm text-on-surface-muted md:hidden noscript:hidden">
            {WRITE.ratherTalk} <BookCallTrigger location="contact-form" className={tapLinkStyles} />
          </p>
          <noscript>
            <p className="text-sm text-on-surface-muted">
              {NO_SCRIPT.lead}{' '}
              <a href={SITE.bookingUrl} className={textLinkStyles}>
                {BOOK_CALL.label.toLowerCase()}
              </a>
              {NO_SCRIPT.tail}
            </p>
          </noscript>
        </div>

        <div
          inert={busy}
          style={settleAt(3)}
          className="contact-in contact-quiet flex flex-col gap-5 noscript:hidden"
        >
          <div className="flex flex-col gap-1.5">
            <Field
              id={`${uid}-message`}
              label={WRITE.messageLabel}
              hint={WRITE.messageHint}
              notes={[meterId]}
              error={errors.message}
            >
              {(attributes) => (
                <textarea
                  {...attributes}
                  ref={messageRef}
                  name="message"
                  rows={4}
                  autoCapitalize="sentences"
                  spellCheck
                  value={fields.message}
                  onChange={(event) => {
                    edit('message')(event.target.value)
                  }}
                  onFocus={enter}
                  onBlur={leave('message')}
                  onKeyDown={(event) => {
                    // Enter is a new line; with Ctrl or Cmd it sends, quietly, with no hint.
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault()
                      event.currentTarget.form?.requestSubmit()
                    }
                  }}
                  className={`${fieldStyles} contact-message`}
                />
              )}
            </Field>
            {/* Read after the hint, never announced as it counts: it is empty until the last
                stretch, then the words left or over. */}
            <p id={meterId} className="contact-meter text-sm text-on-surface-muted">
              {meterLine(fields.message)}
            </p>
          </div>
          <div className="contact-row">
            <Field id={`${uid}-name`} label={WRITE.name} error={errors.name}>
              {(attributes) => (
                <input
                  {...attributes}
                  ref={nameRef}
                  type="text"
                  name="name"
                  autoComplete="name"
                  autoCapitalize="words"
                  spellCheck={false}
                  enterKeyHint="next"
                  maxLength={CONFIG.start.names.personMax}
                  value={fields.name}
                  onChange={(event) => {
                    edit('name')(event.target.value)
                  }}
                  onFocus={enter}
                  onBlur={leave('name')}
                  onKeyDown={(event) => {
                    // Enter goes on to the address, as the keyboard's Next key does.
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                      event.preventDefault()
                      emailRef.current?.focus()
                    }
                  }}
                  className={fieldStyles}
                />
              )}
            </Field>
            <Field
              id={`${uid}-email`}
              label={WRITE.email}
              notes={['contact-email-note']}
              error={errors.email}
            >
              {(attributes) => (
                <input
                  {...attributes}
                  ref={emailRef}
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  value={fields.email}
                  onChange={(event) => {
                    edit('email')(event.target.value)
                  }}
                  onFocus={enter}
                  onBlur={leave('email')}
                  className={fieldStyles}
                />
              )}
            </Field>
          </div>
          {/* The privacy answer comes before Send, in reading order and on screen. Its link opens
              a new document in a new tab, which a prefetch in this one could never serve. */}
          <p id="contact-email-note" className="text-sm text-on-surface-muted">
            {emailNote()}{' '}
            <Link href="/privacy#contact" target="_blank" prefetch={false} className={wholeLink}>
              {WRITE.detailsLink}
              <span className="sr-only"> {SITE.newTab}</span>
            </Link>
          </p>
          <Envelope id="contact-envelope" name={fields.name} email={fields.email} />
        </div>

        {/* Why the message did not go, which Send names as its description: the words kept after
            a failure a second try may clear, the call once the day's sends are spent, and the
            call again once such failures come in a row (CONFIG.contact.send.stuckAfter). The call
            is the booking page in a new tab, as /start's alert offers it, kept whole, so its
            label never breaks at the hyphen in "20-minute". */}
        {refused !== null && (
          <FieldError id="contact-alert" role="alert">
            <span>
              {refused.message}
              {refused.kept && ` ${KEPT}`}
              {refused.call && (
                <>
                  {' '}
                  <BookingPageLink location="contact-limit" className={wholeLink}>
                    {BOOK_CALL.label}
                  </BookingPageLink>
                </>
              )}
              {!refused.call && failures >= CONFIG.contact.send.stuckAfter && (
                <>
                  {' '}
                  {STUCK.lead}{' '}
                  <BookingPageLink location="contact-stuck" className={wholeLink}>
                    {BOOK_CALL.label}
                  </BookingPageLink>
                  {STUCK.tail}
                </>
              )}
            </span>
          </FieldError>
        )}

        {/* The hero prompt's row, class for class: the caption first in the DOM, so on a phone
            the full-width Send sits above it, and from md the two share a line. */}
        <div
          style={settleAt(4)}
          className="contact-in contact-actions flex flex-wrap-reverse items-center justify-end gap-3 md:gap-4 noscript:hidden"
        >
          <p
            className={`${captionStyles} contact-quiet w-full text-center text-balance md:w-auto md:text-small`}
          >
            {WRITE.reassurance}
          </p>
          <button
            ref={sendRef}
            id="hero-cta"
            type="submit"
            aria-disabled={busy || undefined}
            aria-describedby={describedBy}
            onPointerDown={() => {
              pressingSend.current = true
            }}
            className={buttonStyles({
              variant: 'cta',
              size: 'lg',
              className: 'w-full pr-6 max-md:px-5 md:w-auto',
            })}
          >
            {busy ? (
              <>
                <LoaderCircle aria-hidden="true" className="contact-spinner size-4" />
                {SENDING.ask}
              </>
            ) : (
              <>
                {WRITE.send}
                <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
              </>
            )}
          </button>
        </div>
      </form>

      {bloom !== null && (
        <div
          ref={bloomRef}
          aria-hidden="true"
          data-phase={bloom}
          className="contact-bloom"
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return
            if (event.animationName === 'contact-hold') holdEnded()
            else if (
              event.animationName === 'contact-run' ||
              event.animationName === 'contact-drain'
            )
              dispatch({ type: 'bloomEnd' })
          }}
        >
          <p className="contact-words emphasis">
            <em>{SENDING.ink}</em>
          </p>
        </div>
      )}

      {status === 'sent' && (
        <div className="contact-sent contact-ink flex flex-col items-start gap-5">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="contact-check">
            <path pathLength={1} d="M20 6 9 17l-5-5" />
          </svg>
          <h2
            ref={sentRef}
            id="contact-sent-heading"
            tabIndex={-1}
            className={`${stepHeading} outline-none`}
          >
            {isolated(sentHeading(fields.name), firstNameFrom(fields.name))}
          </h2>
          <Envelope name={fields.name} email={fields.email} />
          {SITE.contactReplies && (
            <p className={cardBody}>
              {isolated(SENT.replyTo(fields.email.trim()), fields.email.trim())}
            </p>
          )}
          <p className="text-sm text-on-surface-muted">
            {SENT.fixLead}{' '}
            <button
              type="button"
              onClick={() => {
                back('fix')
              }}
              className={`${textLinkStyles} cursor-pointer`}
            >
              {SENT.fix}
            </button>
          </p>
          <button
            type="button"
            onClick={() => {
              back('again')
            }}
            className={buttonStyles({ variant: 'outline', size: 'lg' })}
          >
            {SENT.again}
          </button>
        </div>
      )}

      {/* Said once as the message goes and once as it lands; outside the form, so it survives the
          form being hidden. */}
      <p role="status" className="sr-only">
        {busy ? SENDING.status : status === 'sent' ? SENT.status : ''}
      </p>
    </section>
  )
}
