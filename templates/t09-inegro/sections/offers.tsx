import type { InegroContent } from '../copy-slots'

type Props = { offers: InegroContent['offers'] }

// The source's resources block, as the three value propositions: the label, a line and a
// button across the top (the button only from 768px, as the source hid it on a phone), then
// three boxes each washed from its colour into the ink, its tag pinned in the top corner, its
// title, its line and a white button.
export function InegroOffers({ offers }: Props) {
  return (
    <section
      id="offers"
      className="inegro-block inegro-stack-row"
      data-stack="row"
      aria-labelledby="offers-label"
    >
      <div className="inegro-inner">
        <div className="inegro-offers-head">
          <h2 id="offers-label" className="inegro-label">
            {offers.label}
          </h2>
          <p className="inegro-p">{offers.lead}</p>
          <div className="inegro-offers-all">
            <a className="inegro-btn" href={offers.cta.href}>
              {offers.cta.label}
            </a>
          </div>
        </div>
        <div className="inegro-offers-boxes">
          {offers.items.map((item, index) => (
            <div key={item.title} className="inegro-offers-col">
              <div className="inegro-offer" data-tone={String(index + 1)}>
                <p className="inegro-pill">{item.tag}</p>
                <h3>{item.title}</h3>
                <p className="inegro-p">{item.body}</p>
                <div>
                  <a className="inegro-btn" href={offers.itemCta.href}>
                    {offers.itemCta.label}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
