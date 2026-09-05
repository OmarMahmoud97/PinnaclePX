import { CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import { cardHeading, titleHeading } from '@/app/_components/section-styles'
import { WORK_IMAGES, type WorkPicture } from '@/app/_components/work-images'
import { captureFor, CLIENT_ITEMS, hostOf, longDate, WORK } from '@/app/_components/work-items'
import { BrowserFrame } from '@/components/sketch/browser-frame'
import { PhoneFrame } from '@/components/sketch/phone-frame'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { captionStyles } from '@/components/ui/caption'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedAnchor, TrackedLink } from '@/components/ui/tracked-link'
import { BLANK_ANSWERS } from '@/lib/brief/answers'

// The frames borrow the sketch's chrome, so they paint with its variables; an uncoloured model
// gives the neutral grey shell, and each picture carries its own colour.
const NEUTRAL = sketchModelFrom(BLANK_ANSWERS, 1, { logo: null, photos: [] })

// The two radio buttons that choose the view. Native inputs and the CSS :has() selector, so the
// switch works with JavaScript off and the default is the phone, which is where most visitors are.
// The hidden view uses `hidden`, so its picture is never fetched until it is asked for.
const SEGMENT =
  'cursor-pointer rounded-full border border-border px-3 py-1 font-mono text-label text-on-surface-muted transition-colors duration-(--motion-tap) has-[:checked]:border-on-surface has-[:checked]:bg-on-surface has-[:checked]:text-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-deeper has-[:focus-visible]:ring-offset-2'

function Picture({ picture, sizes }: { picture: WorkPicture; sizes: string }) {
  const [avif2x, avif3x] = picture.avif
  const [webp2x, webp3x] = picture.webp
  // Both formats are written at the same two widths.
  const w2 = `${String(webp2x.width)}w`
  const w3 = `${String(webp3x.width)}w`
  return (
    <picture className="block">
      {/* Served from public/work/ as it is; see work-images.ts for why it is not imported. */}
      <source type="image/avif" srcSet={`${avif2x} ${w2}, ${avif3x} ${w3}`} sizes={sizes} />
      {/* A committed file at two known sizes, so no optimiser and no client script. */}
      <img
        src={webp2x.src}
        srcSet={`${webp2x.src} ${w2}, ${webp3x.src} ${w3}`}
        sizes={sizes}
        width={webp2x.width}
        height={webp2x.height}
        alt={picture.alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </picture>
  )
}

// The sites the studio has designed and built, one card each on the What you get cell recipe:
// the first screen of the live site, on a phone or a desktop as the visitor chooses, the client's
// name and trade, one line on what was done and the result where one was measured, a dated
// caption and a link to the site itself. Nothing here is a mock-up: every picture is a capture of
// the page the link opens.
export function Work() {
  return (
    <section id="work" className="scroll-mt-16" style={NEUTRAL.vars}>
      <div className="flex flex-col gap-3 p-column max-md:pb-3 md:max-w-3xl">
        <h2 className={titleHeading}>{WORK.heading}</h2>
        <p className="text-lead text-pretty text-on-surface-muted">{WORK.lead}</p>
      </div>

      {/* gap-px over a border-coloured background draws the hairlines between cells. */}
      <ul
        data-reveal
        className="grid grid-cols-2 gap-px border-y border-border bg-border lg:grid-cols-3"
      >
        {CLIENT_ITEMS.map((client, index) => {
          const image = WORK_IMAGES[client.slug]
          if (image === undefined) throw new Error(`No picture for ${client.slug}`)
          const capture = captureFor(client.slug)
          const group = `view-${client.slug}`
          return (
            <li
              key={client.slug}
              style={revealDelay(index)}
              className="group/card flex flex-col gap-3 bg-surface p-4 sm:p-cell"
            >
              <fieldset className="flex justify-center gap-1.5">
                <legend className="sr-only">{WORK.viewLegend(client.name)}</legend>
                <label className={SEGMENT}>
                  <input
                    type="radio"
                    name={group}
                    value="phone"
                    defaultChecked
                    className="sr-only"
                  />
                  {WORK.phone}
                </label>
                <label className={SEGMENT}>
                  <input type="radio" name={group} value="desktop" className="sr-only" />
                  {WORK.desktop}
                </label>
              </fieldset>

              {/* The phone view fills its frame edge to edge: the frame takes the picture's own
                  height instead of the 9:19 the sketch draws, so nothing is cropped. */}
              <div className="flex flex-1 items-start justify-center group-has-[input[value=desktop]:checked]/card:hidden">
                <PhoneFrame className="aspect-auto w-full max-w-56">
                  <Picture picture={image.phone} sizes="(min-width: 1024px) 224px, 45vw" />
                </PhoneFrame>
              </div>
              <div className="hidden flex-1 items-center group-has-[input[value=desktop]:checked]/card:flex">
                <BrowserFrame company={client.name} coloured={false} className="w-full">
                  <Picture picture={image.desktop} sizes="(min-width: 1024px) 400px, 45vw" />
                </BrowserFrame>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className={cardHeading}>{client.name}</h3>
                <p className={captionStyles}>{client.trade}</p>
              </div>
              <p className="text-small text-pretty text-on-surface-muted">{client.did}</p>
              {client.result !== undefined && (
                <p className="text-small font-medium text-pretty">{client.result}</p>
              )}
              <p className={`${captionStyles} mt-auto`}>
                {hostOf(capture.url)}, {longDate(capture.capturedAt)}
              </p>
              <p className="text-small">
                <TrackedAnchor
                  href={client.url}
                  event="client_site_open"
                  location="work"
                  data={{ client: client.slug }}
                  className={`${textLinkStyles} inline-block py-1`}
                >
                  {WORK.visit(client.name)}
                </TrackedAnchor>
              </p>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-1 p-column pt-5 md:pt-6">
        <p className={captionStyles}>{WORK.group}</p>
        <p className={captionStyles}>{WORK.footnote}</p>
        {/* Proof, then the ask: the band never ends with nothing to do. */}
        <p className="pt-3 text-small text-on-surface-muted">
          {WORK.ask}{' '}
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="work"
            className={`${textLinkStyles} inline-block py-1`}
          >
            {CTA.label}
          </TrackedLink>
        </p>
      </div>
    </section>
  )
}
