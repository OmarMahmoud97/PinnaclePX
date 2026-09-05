import manifest from '@/app/_images/work/manifest.json'

// The six sites the studio has designed and built, shown with each client's permission (owner,
// 5 September 2026; docs/claims-register.md). Every line is a fact about the work or a result the
// studio measured, in the order the owner chose: the two service businesses first, then the four
// brands of one group. Trades are the clients' own descriptions of themselves; results carry the
// studio's records and are the only figures on the page (copy.test.ts exempts them by string).
// The pictures and their dates come from app/_images/work/manifest.json, written by
// scripts/capture-work.mjs.
export type ClientItem = Readonly<{
  slug: string
  name: string
  trade: string
  did: string
  result?: string
  url: string
}>

export const WORK = {
  heading: 'Six sites we designed and built.',
  lead: 'Real businesses, live today, from a dog walker to a fitness app. Open any of them on your phone.',
  group: 'Four of the six are brands of one group, whose rebrand we led.',
  // The band's ask: proof, then the first step, in one line.
  ask: 'Yours starts the same way: five questions, three designs, then a conversation.',
  visit: (name: string) => `Visit the ${name} site`,
  phone: 'Phone',
  desktop: 'Desktop',
  viewLegend: (name: string) => `See the ${name} site on a phone or a desktop`,
} as const

export const CLIENT_ITEMS: readonly ClientItem[] = [
  {
    slug: 'go-wild',
    // "Go Wild": the trade line says the rest, and the link stays on one line on a phone.
    name: 'Go Wild',
    trade: 'Dog walking, North London',
    did: 'Designed and built from scratch, with booking a chat one tap away.',
    url: 'https://gowilddogwalking.co.uk/',
  },
  {
    slug: 'vetpres',
    name: 'VetPres',
    trade: 'Veterinary prescription software',
    did: 'Designed and built by us. We still look after it.',
    url: 'https://vetpres.com/',
  },
  {
    slug: 'trvlwell',
    name: 'TrvlWell',
    trade: 'Travel wellness app',
    did: 'Rebranded, rebuilt and relaunched.',
    result: 'Demo requests rose 40% after the relaunch.',
    url: 'https://trvlwell.co/',
  },
  {
    slug: 'withu',
    name: 'WithU',
    trade: 'Audio fitness app',
    did: 'Built as WithU became a brand in its own right. Their team edits it themselves.',
    url: 'https://www.withuapp.com/',
  },
  {
    slug: 'mvmnt',
    name: 'Mvmnt',
    trade: 'At-home fitness app',
    did: 'A new identity, and a new site built to carry it.',
    result: 'Bounce rate down 18%. Email sign-ups up 47%.',
    url: 'https://www.mvmnt.com/',
  },
  {
    slug: 'urunn',
    name: 'URUNN',
    trade: 'Running coaching app',
    did: 'The whole site, built for phones first.',
    result: 'From unranked to page one on Google.',
    url: 'https://www.urunn.com/',
  },
]

// The figures on the page, exempt from the copy test's ban on percentages because each carries
// the studio's own records (docs/claims-register.md).
export const MEASURED_RESULTS: readonly string[] = CLIENT_ITEMS.flatMap((client) =>
  client.result === undefined ? [] : [client.result],
)

type Capture = Readonly<{ slug: string; url: string; capturedAt: string }>

// When each picture was taken, from the manifest, so the caption and the file can never drift.
export function captureFor(slug: string): Capture {
  const entry = manifest.clients.find((client) => client.slug === slug)
  if (entry === undefined) throw new Error(`No capture in the work manifest for ${slug}`)
  return { slug: entry.slug, url: entry.url, capturedAt: entry.capturedAt }
}

// "5 September 2026" from an ISO date, for the caption.
export function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '')
}
