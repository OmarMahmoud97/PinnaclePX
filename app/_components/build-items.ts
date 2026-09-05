import { CONFIG } from '@/lib/config'

// The paid step as a process the buyer can picture. Every line here is true by the page's
// existing promises (a fixed quote and a timeline on the call, wording from the conversation, a
// site designed from scratch). A step whose facts the owner has not confirmed is absent, not
// softened: ownership, the check before launch, the change round, the page list and the care
// plan join once each decision is recorded (docs/home-page-content-plan.md, section 3.8), and
// the counter renumbers itself. Numbers render from CONFIG.build and CONFIG.care, which are
// null until the studio has measured them.
type BuildStep = Readonly<{ title: string; body: string; more?: string }>

export const REAL_BUILD = {
  heading: 'If you like one, here is what happens next.',
  lead: 'Each step says who does what, and what we need from you. The quote is fixed before the build starts. It is a whole site, designed from scratch, not one of the three designs made bigger.',
} as const

export const BUILD_STEPS: readonly BuildStep[] = [
  {
    title: 'We agree the plan on the call',
    body: 'You say what is wrong with your designs, what you sell and who you want more of. You leave with a fixed quote and a timeline.',
  },
  {
    title: 'You send your photos and prices',
    body: 'Your logo file, your photos if you have them, and your prices or services. Nothing technical.',
  },
  {
    title: 'We write the wording',
    body: 'Every page is written for you from what you told us on the call. Not a first draft this time.',
  },
  {
    title: 'We design and build your site',
    body: 'Designed for you from scratch, around what you liked in your three designs. Built for a phone first, then a bigger screen.',
    more: 'Built so Google and the chat assistants people now ask can read every page. Your bookings, payments or forms connected. You can see how many people visit.',
  },
  {
    title: 'Launch at your web address',
    body: 'It goes up at your web address.',
  },
]

// How long the build takes: a range only once real builds have been measured into CONFIG.
export function timelineLine(weeks: typeof CONFIG.build.weeks): string {
  return weeks === null
    ? 'We agree a timeline on the call.'
    : `Most sites take ${String(weeks.min)} to ${String(weeks.max)} weeks from the call to launch.`
}

// After launch: the block exists only once the owner has confirmed who hosts and who cares for
// the site (decisions 7 and 10). Null until then, and the section ends at launch.
type AfterLaunch = Readonly<{ heading: string; body: string }>

export const AFTER_LAUNCH = null as AfterLaunch | null

// The care plan's inclusions, each rendered from the value the studio actually runs, in words.
const IN_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

function inWords(count: number): string {
  return IN_WORDS[count] ?? String(count)
}

export function careLines(care: NonNullable<typeof CONFIG.care>): readonly string[] {
  const days = care.replyWorkingDays === 1 ? 'working day' : 'working days'
  return [
    'Hosting, with the padlock certificate kept renewed.',
    care.backupsPerDay === 1
      ? 'A backup every day, stored away from the site and tested.'
      : `${inWords(care.backupsPerDay)} backups a day, stored away from the site and tested.`,
    'Software kept up to date, tried on a test version first.',
    `A check every ${inWords(care.checkMinutes)} minutes that the site is up.`,
    `Up to ${inWords(care.changesPerMonth)} small changes each month: a price, a photo, a new service.`,
    `A reply within ${inWords(care.replyWorkingDays)} ${days}.`,
    'Rolling monthly. Cancel any time and keep everything.',
  ]
}
