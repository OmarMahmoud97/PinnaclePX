'use client'

import { useEffect, useRef, useState } from 'react'
import type { LucentPlanItem, LucentPricing } from '../copy-slots'
import { Eyebrow, Lines, MaskHeading } from './ui'

type Props = { pricing: LucentPricing }
type Period = 'monthly' | 'yearly'

// The source's rolling number: half a second from the shown amount to the new one, easing out on
// a cubic, two decimals throughout.
const ROLL_MS = 500
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

function Item({ item }: { item: LucentPlanItem }) {
  return (
    <li>
      {item.strong !== '' && <b>{item.strong}</b>}
      {item.text}
    </li>
  )
}

// The source's pricing: a heading, a switch between monthly and yearly whose orange thumb slides
// to the chosen option on a spring, and two plans, the second's price rolling to the new amount
// and its note and period changing with the switch. The plans clear out of a blur one after the
// other as they come into view (sections/scroll.ts). Optional: the brief holds no prices, so a
// visitor's page leaves it out.
export function LucentPricingSection({ pricing }: Props) {
  const { toggle, free, pro } = pricing
  const [period, setPeriod] = useState<Period>('monthly')
  const [amount, setAmount] = useState(pro.monthly)
  const shown = useRef(pro.monthly)
  const frame = useRef(0)
  const switcher = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)

  // The thumb takes an option's width and place: the first option's once the first frame has
  // laid the switch out, as the source placed it, the chosen one's again on every resize, and the
  // pressed one's in the press itself, as the source moved it.
  const place = (option: HTMLElement | null | undefined) => {
    const knob = thumb.current
    if (option == null || knob === null) return
    knob.style.width = `${String(option.offsetWidth)}px`
    knob.style.transform = `translateX(${String(option.offsetLeft - 5)}px)`
  }
  useEffect(() => {
    const active = () => {
      place(switcher.current?.querySelector<HTMLElement>('[aria-pressed="true"]'))
    }
    const first = requestAnimationFrame(active)
    window.addEventListener('resize', active)
    return () => {
      cancelAnimationFrame(first)
      window.removeEventListener('resize', active)
    }
  }, [])

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
    },
    [],
  )

  const choose = (next: Period, option: HTMLElement) => {
    place(option)
    setPeriod(next)
    const from = shown.current
    const to = next === 'yearly' ? pro.yearly : pro.monthly
    cancelAnimationFrame(frame.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shown.current = to
      setAmount(to)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / ROLL_MS, 1)
      shown.current = from + (to - from) * easeOutCubic(p)
      setAmount(shown.current)
      if (p < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  return (
    <section className="lc-pricing" id="pricing">
      <div className="lc-pricing__head">
        <Eyebrow>{pricing.label}</Eyebrow>
        <MaskHeading>
          <Lines lines={pricing.heading} />
        </MaskHeading>
        <div
          className="lc-toggle"
          data-reveal=""
          role="group"
          aria-label="Billing period"
          ref={switcher}
        >
          <button
            className="lc-toggle__opt"
            type="button"
            aria-pressed={period === 'monthly'}
            onClick={(event) => {
              choose('monthly', event.currentTarget)
            }}
          >
            {toggle.monthly}
          </button>
          <button
            className="lc-toggle__opt"
            type="button"
            aria-pressed={period === 'yearly'}
            onClick={(event) => {
              choose('yearly', event.currentTarget)
            }}
          >
            {toggle.yearly} <i>{toggle.saving}</i>
          </button>
          <span className="lc-toggle__thumb" aria-hidden="true" ref={thumb} />
        </div>
      </div>
      <div className="lc-plans" data-plans="">
        <article className="lc-plan">
          <header>
            <h3>{free.name}</h3>
            <div className="lc-plan__price">{free.price}</div>
          </header>
          <p>{free.note}</p>
          <ul>
            {free.items.map((item) => (
              <Item key={`${item.strong}${item.text}`} item={item} />
            ))}
          </ul>
          <a className="lc-btn lc-btn--ghost lc-btn--block" data-magnetic="" href={free.cta.href}>
            <span>{free.cta.label}</span>
          </a>
        </article>
        <article className="lc-plan lc-plan--pro">
          <div className="lc-plan__flag">{pro.flag}</div>
          <header>
            <h3>{pro.name}</h3>
            <div className="lc-plan__price">
              <span className="lc-plan__amt">{`${pro.currency}${amount.toFixed(2)}`}</span>{' '}
              <small className="lc-plan__per">{pro.per[period]}</small>
            </div>
          </header>
          <p>{pro.note[period]}</p>
          <ul>
            {pro.items.map((item) => (
              <Item key={`${item.strong}${item.text}`} item={item} />
            ))}
          </ul>
          <a className="lc-btn lc-btn--solid lc-btn--block" data-magnetic="" href={pro.cta.href}>
            <span>{pro.cta.label}</span>
          </a>
        </article>
      </div>
    </section>
  )
}
