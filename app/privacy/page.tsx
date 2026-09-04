import type { Metadata } from 'next'
import Link from 'next/link'
import { displayHeading, titleHeading } from '@/app/_components/section-styles'
import { Logo } from '@/components/brand/logo'
import { buttonStyles } from '@/components/ui/button'
import { CONFIG } from '@/lib/config'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${SITE.name} uses what you tell it, and your rights.`,
}

// Who processes the visitor's answers on the studio's behalf, named plainly.
const PROCESSORS = [
  ['Vercel', 'hosts the site, stores your pictures and runs the pipeline'],
  ['Neon', 'holds the database'],
  ['Inngest', 'runs the steps that build your designs'],
  ['Anthropic', 'writes the wording from your sentence, and judges stock photographs'],
  ['Pexels', 'supplies stock photographs when you add none of your own'],
  ['Resend', 'sends the email with your link'],
] as const

// The notice the guide asks for at the question that takes an email: who we are, what we do
// with the answers, on what basis, for how long, and what the visitor can do about it. Plain
// words, one screen, no legalese it does not need.
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
            {SITE.legalName} is a one-person web design studio in the UK. This page says what
            happens to the five answers, in plain words.
          </p>
        </div>

        <Section title="What we collect">
          <p>
            Your name, your company name, your email address, a sentence about your business, and
            any logo or photographs you add. Nothing else: no cookies for tracking, no phone number,
            no account.
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
            are made. We send one email, with your link. Nobody rings you unless you book a call,
            and we do not add you to a mailing list.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Your answers, your designs and your pictures are deleted {String(CONFIG.retention.days)}{' '}
            days after you send them. We keep a record of which designs an address has been shown,
            as a code that cannot be turned back into the address, so a return visit sees new
            designs.
          </p>
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
            your details at any time. Email us
            {SITE.contactEmail === null
              ? ' at the address on the home page'
              : ` at ${SITE.contactEmail}`}{' '}
            and we will do it within a few days.
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 text-on-surface-muted">
      <h2 className={`${titleHeading} text-on-surface`}>{title}</h2>
      {children}
    </section>
  )
}
