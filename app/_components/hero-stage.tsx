'use client'

import dynamic from 'next/dynamic'
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react'
import { buildLoop, EMPTY, FINISHED, type Frame, type Loop } from '@/app/_components/hero-loop'
import { BOOK_CALL, CTA } from '@/app/_components/nav-links'
import { EXAMPLE_FILES } from '@/app/_components/photos'
import { setSentence } from '@/app/_components/sentence-store'
import { BriefSketch } from '@/components/sketch/brief-sketch'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { PhoneSketch } from '@/components/sketch/phone-sketch'
import { SketchChips } from '@/components/sketch/sketch-chips'
import { type SketchFiles, sketchModelFrom } from '@/components/sketch/sketch-model'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { CornerTicks } from '@/components/ui/corner-ticks'
import { Field, fieldStyles } from '@/components/ui/field'
import { GlowBackdrop } from '@/components/ui/glow-backdrop'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import { trackEvent } from '@/lib/analytics/events'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { writeDraft } from '@/lib/brief/draft'
import { answeredAt, answersAt, FINAL_STAGE } from '@/lib/brief/example-brief'
import { isSentenceComplete } from '@/lib/brief/sentence'
import { CONFIG } from '@/lib/config'
import { loadGsap, whenIdle } from '@/lib/motion/gsap'
import { useMotionAllowed } from '@/lib/motion/use-motion-allowed'
import { SITE } from '@/lib/site'

const NO_FILES: SketchFiles = { logo: null, photos: [] }

// The finished page the sketch builds into. Never server-rendered: only a client that allows
// motion ever shows it, and the chunk, its fonts and its photograph load with it.
const BuiltPage = dynamic(
  () => import('@/app/_components/built-page').then((module) => module.BuiltPage),
  { ssr: false },
)

type Status = 'waiting' | 'playing' | 'unavailable'

// The hero's stage: the headline and subhead (server-rendered children), the actions, and the
// sketch painting the example brief and building it into a finished page, on a loop. The server
// renders the finished sketch; a client that allows motion rewinds it before paint and plays the
// loop once the hero is on screen and the browser is idle, pausing it off screen. Reduced motion
// and JavaScript off keep the finished sketch, and so does a visitor whose GSAP chunk never
// arrives. At lg a field under the sketch takes the visitor's own sentence: the loop stops for
// good, the sketch redraws with their words, and the button carries the sentence to /start.
export function HeroStage({ children }: { children: ReactNode }) {
  const motionAllowed = useMotionAllowed()
  const [frame, setFrame] = useState<Frame>(FINISHED)
  const [status, setStatus] = useState<Status>('waiting')
  const [built, setBuilt] = useState(false)
  const [builtReady, setBuiltReady] = useState(false)
  const [own, setOwn] = useState<string | null>(null)
  const fieldId = useId()
  const stageRef = useRef<HTMLDivElement>(null)
  const loopRef = useRef<Loop | null>(null)
  const ownRef = useRef(false)
  const onScreenRef = useRef(false)

  const markBuiltReady = useCallback(() => {
    setBuiltReady(true)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!motionAllowed || !builtReady || stage === null) return
    let cancelled = false
    let cancelIdle: (() => void) | undefined
    const roots = [...stage.querySelectorAll<HTMLElement>('[data-frame]')]
    const observer = new IntersectionObserver(
      ([entry]) => {
        const onScreen = entry?.isIntersecting === true
        onScreenRef.current = onScreen
        const loop = loopRef.current
        if (loop !== null) {
          if (!onScreen) loop.pause()
          else loop.play()
          return
        }
        if (!onScreen || ownRef.current) return
        cancelIdle ??= whenIdle(() => {
          loadGsap()
            .then((gsap) => {
              if (cancelled || ownRef.current) return
              // A phone's paragraph shows two lines, so the brief types only what it can show
              // there and completes the sentence in one step the clamp hides.
              const wide = window.matchMedia('(min-width: 48rem)').matches
              const loop = buildLoop(
                gsap,
                roots,
                {
                  setFrame,
                  setBuilt,
                  onStart: () => {
                    setStatus('playing')
                  },
                },
                wide ? Number.POSITIVE_INFINITY : CONFIG.demo.typing.phoneChars,
              )
              if (!onScreenRef.current) loop.pause()
              loopRef.current = loop
            })
            .catch(() => {
              if (!cancelled) setStatus('unavailable')
            })
        })
      },
      { threshold: CONFIG.demo.startThreshold },
    )
    observer.observe(stage)
    return () => {
      cancelled = true
      observer.disconnect()
      cancelIdle?.()
      loopRef.current?.revert()
      loopRef.current = null
    }
  }, [motionAllowed, builtReady])

  // What is drawn: the visitor's own words once they type, else the finished frame unless a
  // client that allows motion is about to play it.
  const shown =
    !motionAllowed || status === 'unavailable' ? FINISHED : status === 'waiting' ? EMPTY : frame
  const answers =
    own === null ? answersAt(shown.stage, shown.chars) : { ...BLANK_ANSWERS, description: own }
  const model = sketchModelFrom(
    answers,
    own === null ? shown.stage : 1,
    own === null ? EXAMPLE_FILES : NO_FILES,
  )
  const ownValid = own !== null && isSentenceComplete(own)
  const captionKey = own !== null ? 'yours' : built ? 'built' : 'example'
  const showBuilt = motionAllowed && own === null

  // The first keystroke ends the example for good; the sketch is theirs from then on.
  function takeOver(value: string) {
    if (own === null) {
      ownRef.current = true
      loopRef.current?.revert()
      loopRef.current = null
      setBuilt(false)
      trackEvent('brief_focus', { location: 'hero' })
    }
    setOwn(value)
    setSentence(value)
  }

  function carrySentence() {
    if (own === null) return
    writeDraft({ ...BLANK_ANSWERS, description: own })
    if (ownValid) trackEvent('brief_step', { step: 1, location: 'hero' })
  }

  return (
    <section
      id="hero"
      data-tinted={model.imageStyle !== null && shown.stage === FINAL_STAGE ? '' : undefined}
      data-live={status === 'waiting' ? undefined : ''}
      data-built={built ? '' : undefined}
      style={model.vars}
      className="group relative isolate px-6 py-section"
    >
      <CornerTicks />
      <GlowBackdrop tinted />

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col items-center gap-6 text-center lg:col-span-5 lg:items-start lg:text-left">
          {children}
          <form
            className="w-full max-w-xl text-left"
            onSubmit={(event) => {
              event.preventDefault()
              document.getElementById('hero-cta')?.click()
            }}
          >
            <Field
              id={fieldId}
              label="What does your business do?"
              hint="Yours fills the sketch as you type."
            >
              {(attributes) => (
                <input
                  {...attributes}
                  type="text"
                  autoComplete="off"
                  maxLength={CONFIG.form.maxChars}
                  value={own ?? ''}
                  onChange={(event) => {
                    takeOver(event.target.value)
                  }}
                  className={fieldStyles}
                />
              )}
            </Field>
          </form>
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <TrackedLink
              href={ownValid ? '/start?q=2' : CTA.href}
              event="cta_click"
              location="hero"
              id="hero-cta"
              onClick={carrySentence}
              className={buttonStyles({ variant: 'cta', size: 'lg' })}
            >
              {CTA.label}
            </TrackedLink>
            <p className="text-small text-on-surface-muted">{SITE.reassurance}</p>
          </div>
          <p className="text-small text-on-surface-muted">
            Rather talk first?{' '}
            <TrackedLink
              href={BOOK_CALL.href}
              event="call_click"
              location="hero"
              className={textLinkStyles}
            >
              {BOOK_CALL.label}
            </TrackedLink>
          </p>
        </div>

        <div ref={stageRef} className="flex flex-col gap-3 lg:col-span-7">
          {/* From md the browser frame with the phone over its corner, narrower than on desktop
              so the sketch's photograph, painted in the first screen at stage 5, stays smaller
              than the subhead and never becomes the largest contentful paint. Below md the phone
              alone, in full, under the button. */}
          <div className="mx-auto hidden w-full max-w-xl md:block lg:max-w-2xl">
            <BriefSketch
              model={model}
              ticks={false}
              phoneFrom="md"
              built={showBuilt ? <BuiltPage frame="browser" onReady={markBuiltReady} /> : undefined}
              phoneBuilt={showBuilt ? <BuiltPage frame="phone" /> : undefined}
            />
          </div>
          <div aria-hidden="true" className="mx-auto w-full max-w-xs md:hidden">
            <PhoneSketch
              model={model}
              zoom={1.5}
              className="mx-auto"
              built={showBuilt ? <BuiltPage frame="phone" /> : undefined}
            />
          </div>

          {/* Tall enough for the longest caption at each size, because the loop swaps this text
              on every pass and a shorter one must not pull the copy below it up. */}
          <p
            key={captionKey}
            className={`${captionStyles} min-h-13 text-center group-data-live:animate-sketch-in md:min-h-9 lg:text-left`}
          >
            {SKETCH_CAPTION[captionKey]}
          </p>
          <SketchChips
            answers={answers}
            answered={own === null ? answeredAt(shown.stage) : 0}
            prefix={own === null ? 'Example brief so far' : 'Your brief so far'}
            chipsClassName="hidden justify-center md:flex lg:justify-start"
          />
        </div>
      </div>
    </section>
  )
}
