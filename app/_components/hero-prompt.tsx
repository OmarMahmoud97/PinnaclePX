'use client'

import { ArrowRight } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { CTA } from '@/app/_components/nav-links'
import { HERO } from '@/app/_components/section-copy'
import { setSentence } from '@/app/_components/sentence-store'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { TrackedLink } from '@/components/ui/tracked-link'
import { trackEvent } from '@/lib/analytics/events'
import { writeCarried } from '@/lib/brief/draft'
import { isSentenceComplete } from '@/lib/brief/sentence'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// The first question, asked in the hero as a prompt box: one sentence about the business, the
// trigger, and the button that carries the sentence to /start. The sentence is kept for the visit
// (sentence-store) so the closing frame redraws with the visitor's words. The box is an opaque
// surface painted above the ink, so the canvas never shows through it, and it holds `#hero-cta`,
// which the header watches to know when the hero's own action has scrolled away. The field is a
// pill filled with the wash, the top stop of the hero's own ramp, so it reads as a field at rest,
// and the box floats on the card shadow like every card below the hero.
// The box's height is part of the headline's measurement (ADR 0031): the H1 sits on its ground
// above the box, and its fills (.hero-heading in app/globals.css) were measured where it lands.
// The box is 197.6px tall at 320 and 360 wide, 180.8 at 390 and 156 from md, and the parts below
// add up to those sums; change one and re-measure the fills before the box grows or shrinks.
export function HeroPrompt() {
  const [own, setOwn] = useState('')
  const startedRef = useRef(false)
  const id = useId()
  const valid = isSentenceComplete(own)

  // The first keystroke is the moment the visitor starts their brief; it is counted once.
  function change(value: string) {
    if (!startedRef.current) {
      startedRef.current = true
      trackEvent('brief_focus', { location: 'hero' })
    }
    setOwn(value)
    setSentence(value)
  }

  // The sentence goes to /start in a key of its own, never over a draft the visitor may already
  // have (docs/start-page-journey-plan.md, D4): /start merges it into the draft and counts the
  // hand-off as it lands (sentence_carried). A sentence long enough to brief from opens the name
  // question; a shorter one opens the first question with it filled in.
  function carry() {
    if (own === '') return
    writeCarried(own)
  }
  const href = valid ? '/start?q=2' : own === '' ? CTA.href : '/start?q=1'

  // The action is for a visitor without JavaScript: Enter then lands on question one instead of
  // reloading this page. With JavaScript, onSubmit prevents it and clicks the button, which
  // carries the sentence.
  // The gaps make the heights: on a phone the pill sits 16px above the button and the button 12px
  // above its fine print, so the field and the ask sit further apart than the ask and its terms;
  // from md the pill sits 20px above the row and the caption 16px before the button.
  return (
    <form
      action="/start"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-3xl bg-surface p-5 shadow-card md:gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        document.getElementById('hero-cta')?.click()
      }}
    >
      <label htmlFor={id} className="sr-only">
        {HERO.fieldLabel}
      </label>
      {/* text-base and up: anything under 16px makes iOS Safari zoom the page on focus. The pill
          is the lg button's height, so the field and the ask are two pills of one size.
          Focus is the site's authored outline, not a ring, because forced colours drop a
          box-shadow and keep an outline; the border shows only there, where the wash is
          flattened away. The placeholder ends in an ellipsis where it cannot fit (320 wide).
          enterKeyHint: the phone keyboard's Go key submits the form, as Enter does. */}
      <input
        id={id}
        type="text"
        autoComplete="off"
        enterKeyHint="go"
        maxLength={CONFIG.form.maxChars}
        placeholder={HERO.fieldLabel}
        value={own}
        onChange={(event) => {
          change(event.target.value)
        }}
        className="h-12 w-full rounded-full bg-surface-wash px-5 text-base text-ellipsis caret-brand-ink placeholder:text-on-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink md:text-xl forced-colors:border"
      />
      {/* The caption comes first in the DOM and the row wraps in reverse, so on a phone the
          full-width button sits above its fine print, balanced so "book." is never left alone;
          from md the two share one line, the caption at the button's shoulder in 14px. */}
      <div className="flex flex-wrap-reverse items-center justify-end gap-3 md:gap-4">
        <p className={`${captionStyles} w-full text-center text-balance md:w-auto md:text-small`}>
          {SITE.reassurance}
        </p>
        <TrackedLink
          href={href}
          event="cta_click"
          location="hero"
          id="hero-cta"
          onClick={carry}
          className={buttonStyles({
            variant: 'cta',
            size: 'lg',
            className: 'w-full pr-6 max-md:px-5 md:w-auto',
          })}
        >
          {CTA.label}
          {/* Hidden under 22.4rem, where the label, the arrow and 20px each side no longer fit
              the phone's full-width button (24 September 2026: 202.3 + 8 + 20 + 40 = 270.3px
              against the viewport less 88px). Change the label and re-measure;
              e2e/mobile-hero.spec.ts pins it. */}
          {/* shrink-0 so it is 20px or nothing: without it a label wider than the button's room
              squeezes the arrow to a sliver instead of the rule above taking it away, which is
              what the label's own measurement is for. */}
          <ArrowRight aria-hidden="true" className="size-5 shrink-0 max-[22.4rem]:hidden" />
        </TrackedLink>
      </div>
    </form>
  )
}
