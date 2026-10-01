import type { ReactNode } from 'react'
import { card, cardHeading, cardPad } from '@/app/_components/section-styles'
import type { BriefView } from '@/app/admin/_components/brief-view'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'

type Link = Readonly<{ label: string; url: string }>

type Props = Readonly<{ brief: BriefView }>

// One brief on the site's card: its company and when it came, then every answer as a labelled
// row, and the designs as links. Plain HTML, no script: one column on a phone, the label beside
// its value from sm up.
export function BriefCard({ brief }: Props) {
  const heading = `brief-${brief.slug}`
  const { designs, colour, logo } = brief
  return (
    <article className={`${card} ${cardPad} flex flex-col gap-5`} aria-labelledby={heading}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id={heading} className={cardHeading}>
          {brief.company}
        </h2>
        <p className={captionStyles}>{brief.submitted}</p>
      </header>
      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[max-content_1fr]">
        <Row label="Name">{brief.name}</Row>
        <Row label="Email">
          <a href={`mailto:${brief.email}`} className={textLinkStyles}>
            {brief.email}
          </a>
        </Row>
        <Row label="About">{brief.description}</Row>
        <Row label="Logo">
          {logo.url === null ? (
            logo.label
          ) : (
            <a href={logo.url} className={textLinkStyles}>
              {logo.label}
            </a>
          )}
        </Row>
        <Row label="Look">{brief.look}</Row>
        <Row label="Photos">
          {brief.photos.length === 0 ? 'None uploaded' : <Links links={brief.photos} />}
        </Row>
        <Row label="Colour">
          <span className="inline-flex flex-wrap items-center gap-2">
            {colour.hex !== null && (
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: colour.hex }}
              />
            )}
            {colour.label}
            {colour.hex !== null && <span className={captionStyles}>{colour.hex}</span>}
          </span>
        </Row>
        <Row label="Designs">
          {designs.note ?? (
            <Links
              links={
                designs.hub === null
                  ? designs.links
                  : [...designs.links, { label: 'All designs', url: designs.hub }]
              }
            />
          )}
        </Row>
        <Row label="Outcome">{brief.outcome}</Row>
      </dl>
    </article>
  )
}

function Row({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <>
      <dt className={captionStyles}>{label}</dt>
      <dd className="text-body wrap-anywhere">{children}</dd>
    </>
  )
}

function Links({ links }: Readonly<{ links: readonly Link[] }>) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1">
      {links.map((link) => (
        <li key={link.url}>
          <a href={link.url} className={textLinkStyles}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
