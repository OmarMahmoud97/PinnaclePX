import { ABOUT } from '@/app/_components/about-items'
import { revealDelay } from '@/app/_components/reveal'
import {
  card,
  cardWash,
  sectionGrid,
  shell,
  stickyColumn,
  titleHeading,
} from '@/app/_components/section-styles'
import { LogoMark } from '@/components/brand/logo-mark'
import { eyebrowStyles } from '@/components/ui/caption'
import { TrackedAnchor } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// A real organisation in a real place. Every row renders only once the owner has supplied its
// value, so nothing here is ever invented. A white card under the studio tile, with the rows'
// labels in the eyebrow register.
function AddressCard() {
  return (
    <div style={revealDelay(1)} className={`flex flex-col gap-4 ${card} p-5`}>
      <div className="flex items-center gap-3">
        <LogoMark size={32} />
        <span className="font-semibold tracking-tight">{SITE.legalName}</span>
      </div>
      {/* Label beside value, except in the 205px column at md, where each row stacks instead. */}
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 text-small md:grid-cols-1 lg:grid-cols-[auto_1fr]">
        {SITE.town !== null && (
          <>
            <dt className={eyebrowStyles}>Town</dt>
            <dd>{SITE.town}, UK</dd>
          </>
        )}
        {SITE.contactEmail !== null && (
          <>
            <dt className={eyebrowStyles}>Email</dt>
            {/* An address cannot wrap at a space, and the column is 205px at md. */}
            <dd className="wrap-anywhere">
              <TrackedAnchor
                href={`mailto:${SITE.contactEmail}`}
                event="contact_click"
                location="about"
                className="underline underline-offset-4 hover:text-brand-ink"
              >
                {SITE.contactEmail}
              </TrackedAnchor>
            </dd>
          </>
        )}
        <dt className={eyebrowStyles}>Phone</dt>
        <dd>By booking only</dd>
      </dl>
    </div>
  )
}

// The studio's seal: the mark on a wash tile with one corner lit, ringed like a stamp. The ring
// is complete in the markup; from md up motion/about.ts draws it on as the tile scales in. Below
// md the tile is 80px and the ring would hug its edge, so the mark stands alone there. From md
// the tile is 128px (144px at lg) with a 64px mark, so the seal reads as a real mark beside the
// H2 rather than an icon under it.
//
// The slot is the column's reveal child and CSS alone moves it; GSAP scales the tile inside.
// They must be two elements: GSAP folds an element's own CSS translate and scale into its
// transform and pins them to none, so sharing one element would freeze the reveal's rise and
// snap it at the end of the tween.
function StudioTile() {
  return (
    <div aria-hidden="true" className="about-tile-slot">
      <div
        className={`about-tile glow-corner grid size-20 place-items-center md:size-32 lg:size-36 ${cardWash}`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          className="absolute inset-0 hidden size-full text-brand-ink/40 md:block"
        >
          {/* pathLength is what the draw-on counts down from (motion/about.ts reads it): GSAP
              rounds a px value to whole pixels, so a length of 1 would snap at its midpoint. */}
          <circle
            className="about-seal"
            cx="50"
            cy="50"
            r="40"
            pathLength="100"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            transform="rotate(-90 50 50)"
          />
        </svg>
        {/* The mark is landscape, so size is its height; the ring is drawn round its box. */}
        <LogoMark size={60} />
      </div>
    </div>
  )
}

// The heading, the tile and the address card share one reveal group, so on a phone the tile
// rises with the heading; the right column reveals on its own line.
//
// The two paragraphs sit in a white card with the shared corner light, the same device as the
// tile beside it, so the band is a ground and two lit surfaces like its neighbours rather than
// the page's one bare paragraph. The padding is written out (not cardPad) because the card takes
// a step more than the recipe at md; phones take p-5 and the tighter 2xl corner. The card has
// no --i of its own: the reveal reads that as a stagger, so it lights its default corner.
export function About() {
  return (
    <section id="about" className="scroll-mt-16 bg-surface py-band">
      <div className={`${shell} ${sectionGrid}`}>
        <div data-reveal className={`flex flex-col gap-6 md:col-span-2 ${stickyColumn}`}>
          <h2 className={titleHeading}>{ABOUT.heading}</h2>
          <StudioTile />
          {(SITE.town !== null || SITE.contactEmail !== null) && <AddressCard />}
        </div>
        <div
          data-reveal
          className={`glow-corner flex flex-col gap-6 text-lead text-pretty text-on-surface-muted md:col-span-4 ${card} p-5 max-md:rounded-2xl md:p-8`}
        >
          <p className="max-w-prose">
            <span className="font-medium text-on-surface">{SITE.legalName}</span>
            {ABOUT.first.slice(SITE.legalName.length)}
          </p>
          <p style={revealDelay(1)} className="max-w-prose">
            {ABOUT.second}
          </p>
        </div>
      </div>
    </section>
  )
}
