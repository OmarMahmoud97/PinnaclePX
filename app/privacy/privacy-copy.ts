import { CONFIG } from '@/lib/config'
import { numberWord } from '@/lib/site'

// The privacy page's lists, and the lines the questionnaire's first release added to it (ADR 0014,
// amended by docs/start-page-journey-plan.md, D30), kept here so the copy tests read them
// (app/_components/copy-corpus.ts): a page module may export nothing but the page.

// Who processes the visitor's answers on the studio's behalf, named plainly.
export const PROCESSORS = [
  ['Vercel', 'hosts the site, stores your pictures and runs the pipeline'],
  ['Neon', 'holds the database'],
  ['Inngest', 'runs the steps that build your designs'],
  ['Anthropic', 'writes the wording from your sentence, and judges stock photographs'],
  ['Pexels', 'supplies stock photographs when you add none of your own'],
  ['Resend', 'sends the email with your link'],
  ['Cal.com', 'takes your booking if you choose a time for a call'],
] as const

const HOURS_A_DAY = 24

// A picture that is never sent goes in the first nightly sweep after it is unsentHours old
// (lib/inngest/functions/orphan-upload-sweep.ts), so it can wait up to one more day than that.
const UNSENT_DAYS = numberWord(Math.ceil(CONFIG.retention.unsentHours / HOURS_A_DAY) + 1)

// What the browser keeps (plan 7.3), and why. Each piece only makes what the visitor asked for
// work as they expect, a refresh that loses nothing, so none needs consent (PECR regulation
// 6(4)); the page says what each holds and when it goes.
export const DEVICE_STORAGE = [
  'While you answer, this tab keeps your answers, so a refresh does not lose them.',
  'They are cleared when you send them or close the tab.',
  'After you send, this tab keeps your first name, business name and email until you close it.',
  `This browser also keeps your page's address until ${String(CONFIG.start.done.restoreHours)} hours after your designs are due.`,
  'That way a refresh brings your designs back.',
  'It also counts the briefs sent from it today, so it can tell you when you reach the limit.',
  'None of this is used to track you, and nothing that names you stays once the tab is closed.',
] as const

export const UNSENT_PICTURES = `If you add pictures but never send your answers, we delete them within ${UNSENT_DAYS} days.`
