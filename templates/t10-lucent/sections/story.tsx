import Image from 'next/image'
import type { LucentContent } from '../copy-slots'
import { Eyebrow, graphemes, isMark, Lines, MaskHeading, Picture } from './ui'

// The blocks between the hero and the rail, in the source's order: the wide film, the overview,
// the white card, the reminder and the steps. Each heading rises out of a mask (or, in the white
// card, line by line out of a blur), each small line and paragraph rises as it comes into view,
// and the pictures move with the scroll as the source's did (sections/scroll.ts, mask.ts).

// The source's promo film, which grew from its inset as the page scrolled towards it, and zoomed
// within its frame. A picture here, as the pipeline has no film; the source's sound button goes
// with the sound.
export function LucentPromo({ promo }: Pick<LucentContent, 'promo'>) {
  return (
    <section className="lc-promo">
      <figure className="lc-promo__media" data-promo="">
        <Picture
          image={promo.image}
          className="lc-promo__video"
          sizes="(max-width: 1320px) 90vw, 1152px"
        />
      </figure>
    </section>
  )
}

export function LucentOverview({ overview }: Pick<LucentContent, 'overview'>) {
  return (
    <section className="lc-work" id="overview">
      <div className="lc-work__head">
        <Eyebrow>{overview.label}</Eyebrow>
        <MaskHeading>
          <Lines lines={overview.heading} />
        </MaskHeading>
      </div>
      <div className="lc-lede">
        <figure className="lc-lede__media" data-parallax="">
          <Picture
            image={overview.image}
            className="lc-lede__img"
            sizes="(max-width: 960px) 90vw, 640px"
          />
        </figure>
        <div className="lc-lede__text">
          <p data-reveal="">{overview.body}</p>
          <ul className="lc-ticks" data-reveal="">
            {overview.ticks.map((tick) => (
              <li key={tick}>{tick}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// The white card. Its heading's three lines rise one after another out of a blur, the last in the
// brand's colour; each line is its own span so a desktop breaks them as the source's <br> did and
// a phone runs them on.
export function LucentBreakdown({ breakdown }: Pick<LucentContent, 'breakdown'>) {
  const [first, second, third] = breakdown.heading
  return (
    <section className="lc-split">
      <div className="lc-split__text">
        <Eyebrow>{breakdown.label}</Eyebrow>
        <h2 data-reveal="" data-rise="">
          <span className="lc-rise-line">{first} </span>
          <span className="lc-rise-line">{second} </span>
          <span className="lc-rise-line">
            <em>{third}</em>
          </span>
        </h2>
        <p data-reveal="">{breakdown.body}</p>
      </div>
      <figure className="lc-split__media" data-parallax="">
        <Picture
          image={breakdown.image}
          className="lc-split__img"
          sizes="(max-width: 960px) 90vw, 620px"
        />
      </figure>
    </section>
  )
}

// The reminder: a picture onto which a notice drops when it comes into view, and which then
// drifts down the picture as the page scrolls while the picture drifts the other way.
export function LucentReminder({ reminder, brand }: Pick<LucentContent, 'reminder' | 'brand'>) {
  const { notice } = reminder
  const { logo } = brand
  return (
    <section className="lc-reminder">
      <Eyebrow>{reminder.label}</Eyebrow>
      <MaskHeading>
        <Lines lines={reminder.heading} />
      </MaskHeading>
      <p data-reveal="">{reminder.body}</p>
      <figure className="lc-reminder__card" data-reminder="">
        <Picture
          image={reminder.image}
          className="lc-reminder__bg"
          sizes="(max-width: 840px) 90vw, 760px"
          alt=""
        />
        <div className="lc-notice">
          <span className="lc-notice__under lc-notice__under--2" aria-hidden="true" />
          <span className="lc-notice__under lc-notice__under--1" aria-hidden="true" />
          <div className="lc-notice__card">
            <span className="lc-notice__icon" aria-hidden="true">
              {logo.kind === 'image' && isMark(logo) ? (
                <Image src={logo.src} alt="" width={logo.width} height={logo.height} sizes="72px" />
              ) : (
                graphemes(brand.name)[0]
              )}
            </span>
            <span className="lc-notice__body">
              <span className="lc-notice__title">{notice.title}</span>
              <span className="lc-notice__text">{notice.text}</span>
            </span>
            <span className="lc-notice__time">{notice.time}</span>
          </div>
        </div>
      </figure>
    </section>
  )
}

// The steps: text beside a tall picture, and the three steps as numbered pills that clear out
// of a blur one after another.
export function LucentSteps({ steps }: Pick<LucentContent, 'steps'>) {
  return (
    <section className="lc-import" id="steps">
      <div className="lc-import__text">
        <Eyebrow>{steps.label}</Eyebrow>
        <MaskHeading>{steps.heading}</MaskHeading>
        <p data-reveal="">{steps.body}</p>
        <ol className="lc-import__steps" data-steps="">
          {steps.items.map((item, index) => (
            <li key={item}>
              <span aria-hidden="true">{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
      <figure className="lc-import__media" data-reveal="">
        <Picture
          image={steps.image}
          className="lc-import__shot"
          sizes="(max-width: 900px) 90vw, 560px"
        />
      </figure>
    </section>
  )
}
