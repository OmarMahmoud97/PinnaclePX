'use client'

import Image from 'next/image'
import { type CSSProperties, useState } from 'react'
import type { InegroContent } from '../copy-slots'
import { graphemes } from './letters'

type Props = {
  brand: InegroContent['brand']
  services: InegroContent['services']
}

// A name's letters, twice over, for the roll under the pointer (inegro.css): the first copy in
// place, the second under it, each letter rising in turn a hundredth of a second after the one
// before, as the source's script built them.
function Roll({ text }: { text: string }) {
  const letters = graphemes(text)
  const copy = (key: string) => (
    <span key={key} className="inegro-roll-copy" aria-hidden="true">
      {letters.map((letter, index) => (
        <span
          key={index}
          className="inegro-roll-letter"
          style={{ '--i': String(index + 1) } as CSSProperties}
        >
          {letter === ' ' ? ' ' : letter}
        </span>
      ))}
    </span>
  )
  return (
    <>
      <span className="sr-only">{text}</span>
      {copy('a')}
      {copy('b')}
    </>
  )
}

// The source's list of guests, as the list of services: every name big, the first open. A name
// opens its line and its picture card and closes the one that was open; it closes itself on a
// second press, as the source's did. The card carries the service's picture, the brand's mark
// over it, the card's title and line at its right, the brand's name on a tab at its foot, and
// under it the service's number and a pill that leads to the ask.
export function InegroServices({ brand, services }: Props) {
  const [open, setOpen] = useState<number | null>(0)
  const mark = brand.logo.kind === 'image' ? brand.logo : null
  return (
    <section
      id="services"
      className="inegro-block inegro-stack-row"
      data-stack="row"
      aria-labelledby="services-label"
    >
      <div className="inegro-inner inegro-services-top">
        <h2 id="services-label" className="inegro-label">
          {services.label}
        </h2>
        <ul className="inegro-services-list">
          {services.items.map((item, index) => {
            const isOpen = open === index
            const panel = `service-${String(index + 1)}-panel`
            return (
              <li key={item.name} className="inegro-service" data-open={isOpen ? '' : undefined}>
                <h3 className="inegro-service-name">
                  <button
                    type="button"
                    className="inegro-focus"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => {
                      setOpen(isOpen ? null : index)
                    }}
                  >
                    <Roll text={item.name} />
                  </button>
                </h3>
                <div id={panel}>
                  <p className="inegro-service-line">{item.line}</p>
                  <a className="inegro-service-card" href={services.itemCta.href}>
                    <span className="inegro-card-picture">
                      {item.image === null ? (
                        <span className="inegro-card-blank" />
                      ) : (
                        <Image
                          src={item.image.src}
                          alt={item.image.alt}
                          width={item.image.width}
                          height={item.image.height}
                          sizes="(min-width: 1024px) 470px, (min-width: 768px) 400px, 100vw"
                        />
                      )}
                      <span className="inegro-card-info">
                        {mark !== null && (
                          <span className="inegro-card-mark">
                            <Image
                              src={mark.src}
                              alt=""
                              width={mark.width}
                              height={mark.height}
                              sizes="64px"
                            />
                          </span>
                        )}
                        <span className="inegro-card-title">{item.title}</span>
                        <span className="inegro-card-tagline">{item.tagline}</span>
                      </span>
                      <span className="inegro-card-brand">{brand.name}</span>
                    </span>
                    <span className="inegro-card-foot">
                      <span className="inegro-card-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="inegro-pill">{services.itemCta.label}</span>
                    </span>
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="inegro-services-all">
          <a className="inegro-btn" href={services.cta.href}>
            {services.cta.label}
          </a>
        </div>
      </div>
    </section>
  )
}
