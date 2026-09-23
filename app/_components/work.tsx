import { CTA } from '@/app/_components/nav-links'
import { revealDelay } from '@/app/_components/reveal'
import {
  cardHeading,
  cardInk,
  headingBlock,
  sectionLead,
  shell,
  titleHeading,
} from '@/app/_components/section-styles'
import { WORK_IMAGES, type WorkPicture } from '@/app/_components/work-images'
import { captureFor, CLIENT_ITEMS, hostOf, longDate, WORK } from '@/app/_components/work-items'
import { BrowserFrame } from '@/components/sketch/browser-frame'
import { PhoneFrame } from '@/components/sketch/phone-frame'
import { sketchModelFrom } from '@/components/sketch/sketch-model'
import { buttonStyles } from '@/components/ui/button'
import { captionStyles } from '@/components/ui/caption'
import { tapLinkStyles } from '@/components/ui/text-link'
import { TrackedAnchor, TrackedLink } from '@/components/ui/tracked-link'
import { BLANK_ANSWERS } from '@/lib/brief/answers'

// The frames borrow the sketch's chrome, so they paint with its variables; an uncoloured model
// gives the neutral shell, and each picture carries its own colour. The section sits inside the
// page's dark scope, where --surface is the hero's foot, so the bezel and the browser bar come
// out dark and the captures read as the sites they are (plan 7.1, question 14).
const NEUTRAL = sketchModelFrom(BLANK_ANSWERS, 1, { logo: null, photos: [] })

// The two radio buttons that choose the view, on a borderless segmented track: native inputs and
// the CSS :has() selector, so the switch works with JavaScript off and the default is the phone,
// which is where most visitors are. The checked pill is the light ink on the dark ground. Each
// pill is 28 px tall, above the 24 px a tap target needs, and the focus ring's offset takes the
// track's own colour so it reads as a ring and not a halo.
const SEGMENT =
  'flex h-7 cursor-pointer items-center rounded-full px-3 text-label font-medium text-on-surface-muted transition-colors duration-(--motion-tap) has-[:checked]:bg-on-surface has-[:checked]:text-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-ink has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface'

// One tile. The frame is 192 px wide until lg, where three columns give it room for 224 px, the
// ceiling before the capture upscales (constraint 11). Below md the tile drops to the phone
// radius and padding the plan gives it; from lg it takes the card's own.
const TILE =
  'work-tile group/card relative isolate flex flex-col gap-4 p-4 transition-colors duration-(--motion-tap) focus-within:bg-surface-tint hover:bg-surface-tint max-md:rounded-2xl lg:p-7'

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

// The sites the studio has designed and built, one dark tile each on the hero's own foot: the
// first screen of the live site, on a phone or a desktop as the visitor chooses, lit from behind
// by a soft cyan pool, the client's name and trade, one line on what was done and the result
// where one was measured, a dated caption and a link to the site itself. Nothing here is a
// mock-up: every picture is a capture of the page the link opens.
//
// The heading block reveals by CSS, so the night with white type reads first; the tiles are a
// group the scroll choreography owns from md up (app/_components/motion/work.ts), and below md,
// or without the choreography, the same CSS reveal carries them.
export function Work() {
  return (
    <section id="work" className="scroll-mt-16 pt-band-sm pb-band" style={NEUTRAL.vars}>
      <div className={shell}>
        <div data-reveal className={headingBlock}>
          <h2 className={titleHeading}>{WORK.heading}</h2>
          <p className={sectionLead}>{WORK.lead}</p>
        </div>

        <ul
          data-reveal
          data-choreo="tiles"
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 md:gap-5 lg:grid-cols-3"
        >
          {CLIENT_ITEMS.map((client, index) => {
            const image = WORK_IMAGES[client.slug]
            if (image === undefined) throw new Error(`No picture for ${client.slug}`)
            const capture = captureFor(client.slug)
            const group = `view-${client.slug}`
            return (
              <li key={client.slug} style={revealDelay(index)} className={`${cardInk} ${TILE}`}>
                <fieldset className="inline-flex self-center rounded-full bg-surface p-1">
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

                {/* The pool behind the frame. It sits under the frame in the tile's own stacking
                    context, fades in with the tile's reveal and brightens under the pointer
                    (app/_styles/work.css): colour and opacity only, so it runs under reduced
                    motion too. */}
                <div
                  aria-hidden
                  className="work-backlight pointer-events-none absolute inset-x-0 top-12 -z-1 h-3/5 bg-radial-[at_50%_40%] from-(--backlight) to-transparent to-70%"
                />

                {/* The phone view fills its frame edge to edge: the frame takes the picture's own
                    height instead of the 9:19 the sketch draws, so nothing is cropped. */}
                <div className="flex flex-1 items-start justify-center group-has-[input[value=desktop]:checked]/card:hidden">
                  <PhoneFrame className="aspect-auto w-full max-w-48 lg:max-w-56">
                    <Picture picture={image.phone} sizes="(min-width: 1024px) 224px, 192px" />
                  </PhoneFrame>
                </div>
                <div className="hidden flex-1 items-center group-has-[input[value=desktop]:checked]/card:flex">
                  <BrowserFrame company={client.name} coloured={false} className="w-full">
                    <Picture
                      picture={image.desktop}
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 80vw"
                    />
                  </BrowserFrame>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className={cardHeading}>{client.name}</h3>
                  <p className={captionStyles}>{client.trade}</p>
                </div>
                <p className="text-small text-pretty text-on-surface-muted">{client.did}</p>
                {client.result !== undefined && (
                  <p className="text-small font-medium text-pretty text-brand-ink">
                    {client.result}
                  </p>
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
                    className={tapLinkStyles}
                  >
                    {WORK.visit(client.name)}
                  </TrackedAnchor>
                </p>
              </li>
            )
          })}
        </ul>

        {/* On the band ground, never inside a tile: a filled button on the card colour would not
            clear 3:1 at its edge (plan 2.3). */}
        <div className="mt-10 flex flex-col items-start gap-4 md:mt-12">
          <p className={captionStyles}>{WORK.group}</p>
          {/* Proof, then the action: the reader who is convinced by six live sites should not have
              to reach for the header. The button is the ask, so no sentence introduces it. */}
          <TrackedLink
            href={CTA.href}
            event="cta_click"
            location="work"
            className={buttonStyles({ size: 'lg', className: 'w-full sm:w-fit' })}
          >
            {CTA.label}
          </TrackedLink>
        </div>
      </div>
    </section>
  )
}
