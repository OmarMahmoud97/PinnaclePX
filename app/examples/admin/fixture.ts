import type { BriefOverviewRow } from '@/lib/db/briefs'

const MINUTE = 60_000
const DAY = 86_400_000

// Slugs with a character the real alphabet never uses (lib/identity/slug.ts has no l, o or 0),
// so an example can never name a real brief.
const SLUGS = {
  garden: 'exampleone00',
  physio: 'exampletwo00',
  bakeryOld: 'exampleold00',
  bakeryNew: 'examplenew00',
} as const

// Four visibly invented briefs on reserved addresses: one new and still building, one opened
// with a Cal.com call ahead, and one person with two briefs, won on the older one so the newer
// one shows the fact as earlier. Every time is set from `now`, so the page reads the same on any
// day.
export function exampleRows(now: Date): BriefOverviewRow[] {
  const at = (ms: number) => new Date(now.getTime() + ms)
  const base = {
    identityHash: 'x'.repeat(64),
    logoFile: null,
    logoUrl: null,
    look: 'warm',
    photoUrls: [] as string[],
    colour: 'forest',
    templateIds: ['t01-aurora', 't02-monolith', 't03-meridian'],
    conceptCount: 3,
    stageSelect: 'done' as const,
    stageTokens: 'done' as const,
    stageBrief: 'done' as const,
    stageCopy: 'done' as const,
    stageImagery: 'done' as const,
    enquiryStage: 'open' as const,
    quotePounds: null,
    stageAt: null,
    note: '',
    noteAt: null,
    callState: null,
    callSource: null,
    callStartsAt: null,
    callEndsAt: null,
    callAt: null,
  }
  const paths = (slug: string) => base.templateIds.map((id) => `/preview/${slug}/${id}`)
  return [
    {
      ...base,
      slug: SLUGS.garden,
      createdAt: at(-2 * MINUTE),
      deadlineAt: at(3 * MINUTE),
      name: 'A. Example',
      email: 'a.example@example.com',
      company: 'Example Garden Centre',
      description: 'A garden centre in an example town, with a cafe and a plant nursery.',
      designPaths: paths(SLUGS.garden),
      emailSentAt: null,
      settledAt: null,
      stageCopy: 'running',
      stageImagery: 'running',
      ownerOpenedAt: null,
    },
    {
      ...base,
      slug: SLUGS.physio,
      identityHash: 'y'.repeat(64),
      createdAt: at(-2 * DAY),
      deadlineAt: at(-2 * DAY + 5 * MINUTE),
      name: 'B. Example',
      email: 'b.example@example.com',
      company: 'Example Physio',
      description: 'A physiotherapy clinic in an example town for runners and lifters.',
      designPaths: paths(SLUGS.physio),
      emailSentAt: at(-2 * DAY + 4 * MINUTE),
      settledAt: at(-2 * DAY + 4 * MINUTE),
      ownerOpenedAt: at(-1 * DAY),
      callState: 'booked',
      callSource: 'cal',
      callStartsAt: at(DAY),
      callEndsAt: at(DAY + 20 * MINUTE),
      callAt: at(-60 * MINUTE),
    },
    {
      ...base,
      slug: SLUGS.bakeryNew,
      identityHash: 'z'.repeat(64),
      createdAt: at(-1 * DAY),
      deadlineAt: at(-1 * DAY + 5 * MINUTE),
      name: 'C. Example',
      email: 'c.example@example.com',
      company: 'Example Bakery',
      description: 'A bakery in an example town, open early, with a wholesale round.',
      designPaths: paths(SLUGS.bakeryNew),
      emailSentAt: at(-1 * DAY + 4 * MINUTE),
      settledAt: at(-1 * DAY + 4 * MINUTE),
      ownerOpenedAt: at(-3 * 60 * MINUTE),
      enquiryStage: 'won',
      quotePounds: 1429,
      stageAt: at(-5 * DAY),
      note: 'Agreed a five-page site with a shop page. Starts next month.',
      noteAt: at(-5 * DAY),
    },
    {
      ...base,
      slug: SLUGS.bakeryOld,
      identityHash: 'z'.repeat(64),
      createdAt: at(-10 * DAY),
      deadlineAt: at(-10 * DAY + 5 * MINUTE),
      name: 'C. Example',
      email: 'c.example@example.com',
      company: 'Example Bakery',
      description: 'A bakery in an example town, open early, with a wholesale round.',
      designPaths: paths(SLUGS.bakeryOld),
      emailSentAt: at(-10 * DAY + 4 * MINUTE),
      settledAt: at(-10 * DAY + 4 * MINUTE),
      ownerOpenedAt: at(-9 * DAY),
      enquiryStage: 'won',
      quotePounds: 1429,
      stageAt: at(-5 * DAY),
      note: 'Agreed a five-page site with a shop page. Starts next month.',
      noteAt: at(-5 * DAY),
    },
  ]
}

// A Cal.com booking that matched no brief, two days out.
export function exampleUnmatched(now: Date): Date[] {
  return [new Date(now.getTime() + 2 * DAY)]
}

export const EXAMPLE_PANEL_SLUG = SLUGS.physio
