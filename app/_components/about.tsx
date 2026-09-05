import { ABOUT } from '@/app/_components/about-items'
import { stickyColumn, titleHeading } from '@/app/_components/section-styles'
import { LogoMark } from '@/components/brand/logo-mark'
import { captionStyles } from '@/components/ui/caption'
import { TrackedAnchor } from '@/components/ui/tracked-link'
import { SITE } from '@/lib/site'

// A real organisation in a real place. Every row renders only once the owner has supplied its
// value, so nothing here is ever invented.
function AddressCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-muted p-5">
      <div className="flex items-center gap-3">
        <LogoMark size={40} className="text-brand-deeper" />
        <span className="font-semibold tracking-tight">{SITE.legalName}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-small">
        {SITE.town !== null && (
          <>
            <dt className={captionStyles}>Town</dt>
            <dd>{SITE.town}, UK</dd>
          </>
        )}
        {SITE.contactEmail !== null && (
          <>
            <dt className={captionStyles}>Email</dt>
            <dd>
              <TrackedAnchor
                href={`mailto:${SITE.contactEmail}`}
                event="contact_click"
                location="about"
                className="underline underline-offset-4 hover:text-brand-deeper"
              >
                {SITE.contactEmail}
              </TrackedAnchor>
            </dd>
          </>
        )}
        <dt className={captionStyles}>Phone</dt>
        <dd>By booking only</dd>
      </dl>
    </div>
  )
}

export function About() {
  return (
    <section id="about" className="scroll-mt-16">
      <div className="grid md:grid-cols-6 md:divide-x md:divide-border">
        <div className={`flex flex-col gap-6 p-column max-md:pb-3 md:col-span-2 ${stickyColumn}`}>
          <h2 className={titleHeading}>{ABOUT.heading}</h2>
          {(SITE.town !== null || SITE.contactEmail !== null) && <AddressCard />}
        </div>
        <div className="flex flex-col gap-5 p-column text-lead text-pretty text-on-surface-muted max-md:pt-6 md:col-span-4">
          <p className="max-w-prose">
            <span className="font-medium text-on-surface">{SITE.legalName}</span>
            {ABOUT.studio.slice(SITE.legalName.length)} {ABOUT.pattern}
          </p>
          <p className="max-w-prose">{ABOUT.first}</p>
          <p className="max-w-prose">{ABOUT.built}</p>
        </div>
      </div>
    </section>
  )
}
