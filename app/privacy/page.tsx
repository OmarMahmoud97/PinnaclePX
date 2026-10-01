import type { Metadata } from 'next'
import Link from 'next/link'
import { CONTACT } from '@/app/_components/nav-links'
import { displayHeading, titleHeading } from '@/app/_components/section-styles'
import {
  CONTACT_PRIVACY,
  DEVICE_STORAGE,
  PROCESSORS,
  RIGHTS_LINK,
  UNSENT_PICTURES,
} from '@/app/privacy/privacy-copy'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

// Its own canonical: the layout's is the home page's, and metadata merges shallowly, so a page
// that sets none would name the home page as the original of this one.
export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${SITE.name} uses what you tell it, and your rights.`,
  alternates: { canonical: '/privacy' },
}

// The notice the guide asks for at the question that takes an email: who we are, what we do
// with the answers, on what basis, for how long, and what the visitor can do about it. A message
// from the contact page has its own section, which the form links to by its id. Plain words, one
// screen, no legalese it does not need.
export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>
        <Link href="/" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
          Back to site
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-3">
          <h1 className={displayHeading}>How we use what you tell us.</h1>
          <p className="text-on-surface-muted">
            {SITE.legalName} is a one-person web design studio in the UK. {CONTACT_PRIVACY.intro}
          </p>
        </div>

        {/* Scoped to the designs, so "Nothing else" stays true beside the contact page's section. */}
        <Section title="What we collect">
          <p>
            For your designs: your name, your company name, your email address, a sentence about
            your business, and any logo or photographs you add. Nothing else: no cookies for
            tracking, no phone number, no account.
          </p>
        </Section>

        <Section title="What we do with it">
          <p>
            We build homepage designs from your answers and send you the link. Your sentence is
            passed to a writing model to draft the wording; your logo and photographs are stored so
            the designs can show them. We keep the designs at your link for{' '}
            {String(CONFIG.retention.days)} days.
          </p>
          <p>
            Our lawful basis is legitimate interests: you asked to see designs, and this is how they
            are made and looked after. To look after your enquiry we keep a short record with your
            answers: when we read them, whether you booked a call and for when, what we quoted, what
            you decided, and any note we make about your enquiry. It is deleted when your answers
            are. We send one email, with your link. Nobody rings you unless you book a call, and we
            do not add you to a mailing list.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Your answers, your designs, your pictures and our record of your enquiry are deleted{' '}
            {String(CONFIG.retention.days)} days after you send them. If you book a call or hire us,
            we keep them for six months after that, so we can look after your enquiry. We keep a
            record of which designs an address has been shown, as a code that cannot be turned back
            into the address, so a return visit sees new designs.
          </p>
          <p>{UNSENT_PICTURES}</p>
        </Section>

        <Section title={CONTACT_PRIVACY.heading} id="contact">
          <p>
            {CONTACT_PRIVACY.collect} {CONTACT_PRIVACY.use}
          </p>
          <p>
            {CONTACT_PRIVACY.where} {CONTACT_PRIVACY.keep}
          </p>
          <p>{CONTACT_PRIVACY.calendar}</p>
        </Section>

        <Section title="What this browser keeps">
          <p>{DEVICE_STORAGE.join(' ')}</p>
        </Section>

        <Section title="Who works on it for us">
          <ul className="flex flex-col gap-1">
            {PROCESSORS.map(([name, role]) => (
              <li key={name}>
                <span className="font-medium text-on-surface">{name}</span> {role}.
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Your rights">
          <p>
            You can ask for a copy of what we hold, ask us to correct it, or ask us to delete it all
            before the {String(CONFIG.retention.days)} days are up. You can object to our use of
            your details at any time.{' '}
            {SITE.contactEmail === null ? (
              <RightsRoute />
            ) : (
              `Email us at ${SITE.contactEmail} and we will do it within a few days.`
            )}
          </p>
          <p>
            If you are not happy with how we have handled your details, you can complain to the
            Information Commissioner&apos;s Office at{' '}
            <a href="https://ico.org.uk/make-a-complaint/" className="underline underline-offset-4">
              ico.org.uk
            </a>
            .
          </p>
        </Section>
      </main>
    </div>
  )
}

// How to use those rights while the studio has no inbox of its own: through the contact page,
// whose name in the sentence is the link. The sentence stays whole in privacy-copy.ts for the
// copy tests, as emphasised() keeps a heading whole (app/_components/words.tsx).
function RightsRoute() {
  const text = CONTACT_PRIVACY.rightsRoute
  const at = text.indexOf(RIGHTS_LINK)
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <Link href={CONTACT.href} className="whitespace-nowrap underline underline-offset-4">
        {RIGHTS_LINK}
      </Link>
      {text.slice(at + RIGHTS_LINK.length)}
    </>
  )
}

function Section({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex flex-col gap-3 text-on-surface-muted">
      <h2 className={`${titleHeading} text-on-surface`}>{title}</h2>
      {children}
    </section>
  )
}
