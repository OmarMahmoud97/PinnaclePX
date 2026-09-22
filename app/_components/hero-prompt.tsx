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
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { writeDraft } from '@/lib/brief/draft'
import { isSentenceComplete } from '@/lib/brief/sentence'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// The first question, asked in the hero as a prompt box: one sentence about the business, the
// trigger, and the button that carries the sentence to /start. The sentence is kept for the
// visit (sentence-store) so the sketch loop below and the closing frame redraw with the
// visitor's words. The box is an opaque surface painted above the ink, so the canvas never
// shows through it, and it holds `#hero-cta`, which the header watches to know when the hero's
// own action has scrolled away.
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

  function carry() {
    if (own === '') return
    writeDraft({ ...BLANK_ANSWERS, description: own })
    if (valid) trackEvent('brief_step', { step: 1, location: 'hero' })
  }

  return (
    <form
      className="flex flex-col gap-8 rounded-3xl bg-surface p-5 shadow-dialog focus-within:ring-2 focus-within:ring-brand-deeper/40 md:rounded-[1.5rem] md:p-6"
      onSubmit={(event) => {
        event.preventDefault()
        document.getElementById('hero-cta')?.click()
      }}
    >
      <label htmlFor={id} className="sr-only">
        {HERO.fieldLabel}
      </label>
      {/* text-lg and up: anything under 16px makes iOS Safari zoom the page on focus. */}
      <input
        id={id}
        type="text"
        autoComplete="off"
        maxLength={CONFIG.form.maxChars}
        placeholder={HERO.fieldLabel}
        value={own}
        onChange={(event) => {
          change(event.target.value)
        }}
        className="w-full bg-transparent text-lg caret-brand-deeper outline-none placeholder:text-on-surface-muted/70 md:text-xl"
      />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <p className={captionStyles}>{SITE.reassurance}</p>
        <TrackedLink
          href={valid ? '/start?q=2' : CTA.href}
          event="cta_click"
          location="hero"
          id="hero-cta"
          onClick={carry}
          className={buttonStyles({ variant: 'cta', size: 'lg', className: 'pr-6' })}
        >
          {CTA.label}
          <ArrowRight aria-hidden="true" className="size-5" />
        </TrackedLink>
      </div>
    </form>
  )
}
