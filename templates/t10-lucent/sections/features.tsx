import type { LucentContent } from '../copy-slots'
import { Arrow, Eyebrow, Lines, MaskHeading, Picture } from './ui'

type Props = Pick<LucentContent, 'features'>

// The source's rail of four feature cards (its owner's reference was Apple's "Get the
// highlights"): the active card almost the page's width with the next one's edge showing, snapping
// as it scrolls sideways, and a dot per card under it. The first three are white; the last is
// black, its heading in the brand's colour, and that heading starts as a cloud of dots that
// gathers into the words at a tap anywhere on its text (sections/particles.ts). The third card
// shows its picture as a framed tile, as the source's tablet card did; the others show theirs
// in a window that runs past the card's foot, where the source showed a phone. The bar's second
// link opens the last card, as the source's did. The dots and the jumps are sections/rail.ts.
export function LucentFeatures({ features }: Props) {
  return (
    <section className="lc-ai lc-ai--rail" id="features">
      <div className="lc-rail" data-rail="" tabIndex={0} role="group" aria-label="Highlights">
        <div className="lc-rail__track">
          {features.items.map((item, index) => {
            const dark = index === 3
            const framed = index === 2
            const headingId = `feature-${String(index + 1)}-title`
            const classes = [
              'lc-ai__card',
              dark ? '' : 'lc-ai__card--light',
              'lc-rail__slide',
              framed ? 'lc-rail__slide--tablet' : '',
            ]
            return (
              <article
                key={headingId}
                className={classes.filter(Boolean).join(' ')}
                id={`feature-${String(index + 1)}`}
                aria-labelledby={headingId}
              >
                <div className="lc-ai__grid">
                  <div className="lc-ai__text">
                    <Eyebrow night={dark}>
                      {item.label}
                      {item.badge !== null && (
                        <>
                          {' '}
                          <i className="lc-beta">{item.badge}</i>
                        </>
                      )}
                    </Eyebrow>
                    <div className="lc-ai__title-wrap">
                      {dark && <canvas className="lc-particles" aria-hidden="true" hidden />}
                      <MaskHeading className="lc-ai__title" id={headingId}>
                        <Lines lines={item.heading} />
                      </MaskHeading>
                    </div>
                    <p data-reveal="">{item.body}</p>
                    <a
                      className="lc-ai__more"
                      data-reveal=""
                      href={item.more.href}
                      aria-describedby={headingId}
                    >
                      {item.more.label}
                      <Arrow />
                    </a>
                  </div>
                  {framed ? (
                    <figure className="lc-ai__media lc-ai__media--framed">
                      <Picture
                        image={item.image}
                        className="lc-ai__frame-img"
                        sizes="(max-width: 860px) 85vw, 480px"
                      />
                    </figure>
                  ) : (
                    <figure className="lc-ai__media">
                      <div className="lc-ai__phone">
                        <Picture
                          image={item.image}
                          className="lc-ai__shot"
                          sizes="(max-width: 960px) 85vw, 480px"
                        />
                      </div>
                    </figure>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
      <div className="lc-rail__dots">
        {features.items.map((item, index) => (
          <button
            key={`dot-${String(index)}`}
            className={index === 0 ? 'lc-rail__dot is-active' : 'lc-rail__dot'}
            type="button"
            aria-label={`Show ${item.label}`}
            aria-current={index === 0 ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
