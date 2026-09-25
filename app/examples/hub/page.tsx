import type { Metadata } from 'next'
import { Hub } from '@/app/preview/_components/hub'
import type { FoundView } from '@/lib/brief/status'
import type { SlotImage } from '@/lib/copy-slots/assets'
import { AppError } from '@/lib/errors'
import { EDGE_COMPANIES, EXAMPLE_SLUG, exampleView } from '@/lib/preview/example'
import { KESTREL } from '@/templates/t01-aurora/example/content'
// The designs page's own rules and its posters', as its route imports them
// (app/preview/[slug]/page.tsx).
import '../../_styles/design-poster.css'
import '../../_styles/preview.css'

export const metadata: Metadata = {
  title: 'Designs page, example',
  robots: { index: false, follow: false },
}

const STATES = [
  'building',
  'ready',
  'partial',
  'exhausted',
  'failed',
] as const satisfies readonly FoundView['status'][]

// Kestrel, the Aurora example's invented business, with that example's two photographs, so the
// posters show pictures a real build could have chosen for it.
const KESTREL_BRIEF = { company: KESTREL.brand.name, description: KESTREL.brand.tagline }
const PHOTOS = [KESTREL.hero.image, KESTREL.statement.image].filter(
  (image): image is SlotImage => image !== null,
)

// A deadline no visit reaches, so the example builds for as long as it is looked at, due at the time
// the plan's own example gives.
const DEADLINE = new Date('2099-01-01T14:32:00Z')

// The two photographs in turn, by the template's number (t01, t02...).
function photoFor(templateId: string): SlotImage {
  const photo = PHOTOS[Number.parseInt(templateId.slice(1, 3), 10) % PHOTOS.length]
  if (photo === undefined) throw new AppError('The Kestrel example has no photographs')
  return photo
}

// The designs page (app/preview/[slug]/page.tsx) drawing an example build in the state the address
// names (?state=ready; building when it names none), for design review and for the specs that walk
// it, which answer its status poll (e2e/brief-hub.spec.ts). ?name=unbroken or ?name=longest draws
// a name at the edges (lib/preview/example.ts); the address picks from those and never supplies
// words, so no link can put its own text on the page. ?utm_source=email arrives as the email's
// link does. The real page reads its row from the database, which no spec may reach. Not linked
// from the site and not indexed, like the template examples beside it.
export default async function HubExamplePage({ searchParams }: PageProps<'/examples/hub'>) {
  const query = await searchParams
  const state = STATES.find((candidate) => candidate === query.state) ?? 'building'
  const company =
    Object.entries(EDGE_COMPANIES).find(([key]) => key === query.name)?.[1] ?? KESTREL_BRIEF.company
  const view = exampleView(state, {
    slug: EXAMPLE_SLUG,
    conceptCount: 3,
    deadlineAt: DEADLINE,
    brief: { ...KESTREL_BRIEF, company },
    photo: photoFor,
  })
  return (
    <Hub
      slug={EXAMPLE_SLUG}
      company={company}
      view={view}
      from={query.utm_source === 'email' ? 'email' : 'hub'}
    />
  )
}
