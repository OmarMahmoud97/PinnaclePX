import { ArrowUpRight, Share } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { BOOK_CALL } from '@/app/_components/nav-links'
import { cardBody, displayHeading, sectionLead } from '@/app/_components/section-styles'
import { DEADLINE_WORDS } from '@/app/preview/_components/deadline-words'
import { DesignLink } from '@/app/preview/_components/design-link'
import { DesignPoster } from '@/app/preview/_components/design-poster'
import { DoneBy } from '@/app/preview/_components/done-by'
import { FollowBuild } from '@/app/preview/_components/follow-build'
import { ShareLine } from '@/app/preview/_components/share-line'
import {
  headingText,
  HUB_STOPPED,
  PARTIAL_NOTES,
  readyHeading,
  SHARE_WORDS,
} from '@/app/start/_components/done-copy'
import { SLOT_LINES } from '@/app/start/_components/done-lines'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { textLinkStyles } from '@/components/ui/text-link'
import { TrackedLink } from '@/components/ui/tracked-link'
import type { FoundView } from '@/lib/brief/status'
import { descriptorOf, designLinkName, designName, layoutOf } from '@/lib/preview/descriptors'
import { PRICE, SITE } from '@/lib/site'

type Props = Readonly<{
  slug: string
  company: string
  view: FoundView
  // How the visitor arrived, for design_open: by the email's link, or any other way.
  from: 'hub' | 'email'
}>

// The designs page, the address a visitor keeps and shares (docs/start-page-journey-plan.md,
// 8.4): on the ink, with no rule anywhere, the designs as posters that fill as the build goes and
// open once it has settled. The server draws all of it from the build's view, and FollowBuild has
// it drawn again each time the status poll finds the build has moved on. So the page's words and
// posters never become scripts: the browser gets only the small islands below, none of which
// shares a module with /start's first scripts that /preview did not already share.
export function Hub({ slug, company, view, from }: Props) {
  const stopped = view.status === 'failed' || view.status === 'exhausted'
  return (
    <div
      data-theme="dark"
      className="hub"
      style={
        view.palette === null ? undefined : ({ '--hub-fill': view.palette.hex } as CSSProperties)
      }
    >
      <FollowBuild slug={slug} initial={view} />
      <header className="hub-bar">
        {/* The name gives way on a phone, where the call beside it needs the room (the studio bar
            and /start's island do the same). */}
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo nameClassName="hidden sm:inline" />
        </Link>
        <TrackedLink
          href={BOOK_CALL.href}
          event="call_click"
          location="preview-hub"
          className={buttonStyles({ variant: 'primary', size: 'sm' })}
        >
          {BOOK_CALL.label}
        </TrackedLink>
      </header>
      <main id="main" className="hub-main">
        {stopped ? (
          <Stopped status={view.status} />
        ) : (
          <Designs slug={slug} company={company} view={view} from={from} />
        )}
      </main>
    </div>
  )
}

// The words for a build with nothing to open, and the call, which is the next step.
function Stopped({ status }: Readonly<{ status: 'failed' | 'exhausted' }>) {
  const { heading, lead } = HUB_STOPPED[status]
  return (
    <div className="hub-words">
      <h1 className={displayHeading}>{heading}</h1>
      <p className={sectionLead}>{lead}</p>
      <p className={cardBody}>
        {PRICE.build} {PRICE.scope} {PRICE.basis}
      </p>
      <TrackedLink
        href={BOOK_CALL.href}
        event="call_click"
        location="preview-hub"
        className={buttonStyles({ variant: 'primary', size: 'lg', className: 'self-start' })}
      >
        {BOOK_CALL.label}
      </TrackedLink>
    </div>
  )
}

// The page while the designs build and once they are built: the time while building, what a
// partial build set simply, the share, and the designs. The status line under the share is the
// page's one live region, and says the designs are ready when they turn ready while it is open.
function Designs({ slug, company, view, from }: Props) {
  const count = view.conceptCount
  const notes = [
    ...(view.stages.copy.state === 'fallback' ? [PARTIAL_NOTES.headlines] : []),
    ...(view.stages.imagery.state === 'fallback' ? [PARTIAL_NOTES.photos] : []),
  ]
  const fill = view.palette?.hex ?? null

  return (
    <>
      <div className="hub-words">
        <h1 className={`${displayHeading} wrap-anywhere`}>
          <bdi>{company}</bdi>, your {count === 1 ? 'design' : 'designs'}.
        </h1>
        <p className={sectionLead}>Built from your five answers. {SITE.callPromise}</p>
        <p className={cardBody}>
          {PRICE.taster} {PRICE.build} {PRICE.scope} {PRICE.basis}
        </p>
        {view.status === 'building' && (
          <p className="hub-time">
            <DoneBy deadlineAt={view.deadlineAt} words={DEADLINE_WORDS} />
          </p>
        )}
        {notes.map((note) => (
          <p key={note} className={cardBody}>
            {note}
          </p>
        ))}
        <ShareLine
          path={`/preview/${slug}`}
          location="preview-hub"
          copied={SHARE_WORDS.copied}
          said={view.status === 'building' ? '' : headingText(readyHeading('', count))}
          className={`${textLinkStyles} inline-flex cursor-pointer items-center gap-2 py-1`}
        >
          <Share aria-hidden="true" className="size-4" />
          {SHARE_WORDS.share}
        </ShareLine>
      </div>
      <ol aria-label="Your designs" className="hub-designs">
        {view.concepts.map((concept, index) => {
          const { href, templateId } = concept
          const descriptor = descriptorOf(templateId)
          const open = href !== null && templateId !== null
          const content = (
            <>
              <DesignPoster
                company={company}
                headline={concept.headline}
                photo={concept.photo?.src ?? null}
                fill={fill}
                layout={layoutOf(templateId)}
              />
              <span className="hub-design-caption">
                <span className="hub-design-name">
                  {designName(index)}
                  {descriptor !== null && (
                    <span className="text-label text-on-surface-muted">{descriptor}</span>
                  )}
                </span>
                {open ? (
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-brand-ink" />
                ) : (
                  <span className="hub-design-state">
                    <span aria-hidden="true" className="hub-design-dot" />
                    {SLOT_LINES.beingBuilt}
                  </span>
                )}
              </span>
            </>
          )
          return (
            <li key={designName(index)}>
              {open ? (
                <DesignLink
                  href={href}
                  label={designLinkName(index, templateId)}
                  template={templateId}
                  from={from}
                >
                  {content}
                </DesignLink>
              ) : (
                <div className="hub-design">{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}
