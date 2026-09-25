import { ABOUT } from '@/app/_components/about-items'
import { BUILD_STEPS, REAL_BUILD } from '@/app/_components/build-items'
import { LOGOS } from '@/app/_components/client-logos'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { FOOTER_GROUPS } from '@/app/_components/footer-links'
import { includedGroups, INCLUDED, STAYS_UP } from '@/app/_components/included-items'
import { BOOK_CALL, CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { BEFORE_YOU_PAY, optionRows, YOUR_OPTIONS } from '@/app/_components/option-items'
import {
  CLOSING,
  FAQ,
  FOOTER,
  HERO,
  HOW_IT_WORKS,
  STRAIGHT_ANSWERS,
} from '@/app/_components/section-copy'
import { NOT_READY_SENTENCE, SHARE } from '@/app/_components/share-copy'
import { SECOND_VISIT, straightAnswerItems } from '@/app/_components/straight-answer-items'
import { WORK_IMAGES } from '@/app/_components/work-images'
import { CLIENT_ITEMS, WORK } from '@/app/_components/work-items'
import { DEVICE_STORAGE, PROCESSORS, UNSENT_PICTURES } from '@/app/privacy/privacy-copy'
import {
  BACK_TO_DESIGNS,
  BRIEF_LINE,
  buildingHeading,
  buildingLead,
  buildSaid,
  CALL_AFTER_OPEN,
  EARLY_FINISH,
  emailLine,
  headingText,
  headlinesLine,
  HUB_STOPPED,
  INTERMISSION,
  layoutsLine,
  openDesign,
  PAGE_LINK_LIVE,
  PARTIAL_NOTES,
  photosLine,
  readyHeading,
  readyLead,
  receivedLine,
  ringCentre,
  SHARE_WORDS,
  stageSaid,
  STOPPED,
  tonesLine,
  usuallyDoneBy,
} from '@/app/start/_components/done-copy'
import { SLOT_LINES } from '@/app/start/_components/done-lines'
import {
  DRAFT_CAPTION,
  DRAFT_CHROME,
  DRAFT_NOTES,
  DRAFT_TAGS,
  draftFoot,
  faceNote,
  photosNote,
  signature,
} from '@/app/start/_components/draft-copy'
import {
  BRAND,
  CHANGE_IT,
  COLOURS,
  DESCRIBE,
  DETAILS,
  DONE_LINES,
  doneTitle,
  type HandOff,
  IMAGERY,
  lineText,
  LOGO_STATUS,
  meterWords,
  type Notice,
  NOTICES,
  PICTURES_LINK,
  QUESTIONS,
  questionTitle,
  receiptsFor,
  SEND_FAILED,
  SEND_LIMIT,
  SEND_PICTURE_FAILED,
  SEND_REFUSED,
  SENDING,
  TRY_AGAIN,
  UPLOAD_ERRORS,
  waitingHeading,
} from '@/app/start/_components/start-copy'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import { type Answers, NAME_TOO_LONG } from '@/lib/brief/schema'
import { STYLE_IDS } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'
import { previewLinkEmail } from '@/lib/email/preview-link'
import { DESCRIPTORS, designLinkName, designName } from '@/lib/preview/descriptors'
import { CALL_AGENDA, NO_SCRIPT_CALL, noScriptLine, PRICE, printedPrice, SITE } from '@/lib/site'

// Every sentence a visitor reads on the home page, and every line the questionnaire's releases
// add to /start, its email and /privacy, in one list, for the copy tests. Lines that render from
// a value take a sample of each branch, so a wording that only appears once a decision is
// recorded is still checked today.
const SAMPLE_CARE = { checkMinutes: 5, replyWorkingDays: 1, backupsPerDay: 1, changesPerMonth: 3 }

// The email with the link, as a visitor with a one-word name reads it, in the build's three
// shapes (three designs, a partial build, one design) and without a name. Its addresses are read
// as two plain words: they are not prose, and the reading level would count their letters as
// syllables.
const withoutAddresses = (text: string) => text.replace(/https?:\/\/\S+/g, 'the link')
const SAMPLE_EMAIL = {
  name: 'Sam',
  company: 'Gibbs Plumbing',
  previewUrl: 'https://pinnaclepx.example/preview/abcdefghjkmn',
  bookingUrl: SITE.bookingUrl,
  conceptCount: 3,
  partial: false,
}

// The questions as a visitor with a one-word business name reads them (plan D25's first pass; the
// second, with names at their edges, is start-copy.test.ts): each look and colour answered once, a
// logo added and not, and every way a visit begins and every notice, so each receipt is read.
const SAMPLE_ANSWERS: readonly Answers[] = [
  { ...BLANK_ANSWERS, description: 'Plumber in Leeds. Boilers and leaks.', company: 'Gibbs' },
  {
    ...BLANK_ANSWERS,
    company: 'Gibbs',
    logo: { kind: 'file', id: 'l1', fileName: 'logo.png', url: null },
    imagery: { style: 'warm', photos: [] },
    colours: { kind: 'custom', hex: '#2f6f4e' },
  },
]
const HAND_OFFS: readonly HandOff[] = ['none', 'sentence', 'short']
const SAMPLE_NOTICES: readonly (Notice | null)[] = [null, ...(Object.keys(NOTICES) as Notice[])]
const questionLines = (answers: Answers) =>
  QUESTION_IDS.flatMap((id) => [
    lineText(QUESTIONS[id].helper(answers)),
    ...HAND_OFFS.flatMap((handOff) =>
      SAMPLE_NOTICES.flatMap((notice) =>
        receiptsFor(id, { answers, handOff, notice }).map((receipt) => lineText(receipt.line)),
      ),
    ),
  ])

// A ready build, for the tab's title at done in each count.
const SAMPLE_READY = {
  status: 'ready',
  slug: 'abcdefghjkmn',
  deadlineAt: '2026-09-24T10:05:00.000Z',
  conceptCount: 3,
  concepts: [],
} as const

export const COPY: readonly string[] = [
  SITE.tagline,
  // The price in both VAT states, so the registered wording is checked before the day it renders.
  ...Object.values(PRICE),
  printedPrice(CONFIG.price.from, { vatRegistered: true, vatRate: CONFIG.price.vatRate }),
  SITE.subhead,
  SITE.description,
  SITE.reassurance,
  SITE.callPromise,
  SITE.colourPromise,
  CTA.label,
  BOOK_CALL.label,
  ...NAV_LINKS.map((link) => link.label),
  ...FOOTER_GROUPS.flatMap((group) => [group.heading, ...group.links.map((link) => link.label)]),
  ...Object.values(HERO),
  ...Object.values(LOGOS),
  ...Object.values(SKETCH_CAPTION),
  ...CALL_AGENDA.map((item) => item.what),
  WORK.heading,
  WORK.lead,
  WORK.group,
  ...CLIENT_ITEMS.flatMap((client) => [
    client.name,
    client.trade,
    client.did,
    ...(client.result === undefined ? [] : [client.result]),
    WORK.visit(client.name),
    WORK.viewLegend(client.name),
  ]),
  WORK.phone,
  WORK.desktop,
  ...Object.values(WORK_IMAGES).flatMap((image) => [image.phone.alt, image.desktop.alt]),
  // Both eighth cells: the wording one that renders today and the hosting one that waits.
  ...Object.values(INCLUDED),
  ...includedGroups(null).flatMap((group) => [
    group.label,
    group.scene,
    ...group.cells.flatMap((cell) => [cell.title, cell.body]),
  ]),
  ...includedGroups(SAMPLE_CARE).flatMap((group) => group.cells.map((cell) => cell.body)),
  STAYS_UP.title,
  STAYS_UP.body,
  HOW_IT_WORKS.heading,
  HOW_IT_WORKS.lead,
  ...HOW_IT_WORKS.steps.flatMap((step) => [step.title, step.body]),
  HOW_IT_WORKS.bridge,
  ...Object.values(REAL_BUILD),
  ...BUILD_STEPS.flatMap((step) => [step.title, step.body]),
  ...Object.values(YOUR_OPTIONS),
  ...Object.values(BEFORE_YOU_PAY),
  ...optionRows(0).flatMap((row) => [row.question, row.builder, row.studio]),
  STRAIGHT_ANSWERS.heading,
  STRAIGHT_ANSWERS.lead,
  ...straightAnswerItems(0).flatMap((item) => [item.question, item.answer]),
  ...Object.values(SECOND_VISIT),
  ...Object.values(ABOUT),
  FAQ.heading,
  ...FAQ_ITEMS.flatMap((item) => [
    item.question,
    item.answer,
    ...(item.link === undefined ? [] : [item.link.label]),
  ]),
  `${CLOSING.opening} ${CLOSING.ask}`,
  NOT_READY_SENTENCE,
  SHARE.subject,
  SHARE.body,
  SHARE.copied,
  FOOTER.blurb,
  // The five questions repeat the home page's promises, so they keep its rules
  // (docs/start-page-journey-plan.md, 4.6): every title, ask and line under it, the receipts and
  // helpers as answered, and the words of every control. The meter is read at each of its states.
  ...QUESTION_IDS.flatMap((id) => {
    const { title, ask, under } = QUESTIONS[id]
    return [title, questionTitle(id), ask, under]
  }),
  ...SAMPLE_ANSWERS.flatMap(questionLines),
  CHANGE_IT,
  ...Object.values(DESCRIBE),
  ...['', 'Plumber in Leeds.', 'Plumber in Leeds. Boilers, leaks and radiators fixed.'].map(
    meterWords,
  ),
  meterWords('a'.repeat(CONFIG.form.maxChars - 1)),
  ...Object.values(BRAND),
  ...Object.values(LOGO_STATUS),
  ...Object.values(UPLOAD_ERRORS).flatMap((errors) => Object.values(errors)),
  PICTURES_LINK,
  TRY_AGAIN,
  ...Object.values(IMAGERY),
  ...Object.values(COLOURS),
  ...Object.values(DETAILS),
  ...Object.values(SENDING),
  ...Object.values(SEND_PICTURE_FAILED),
  SITE.reassuranceSend,
  // What the questionnaire's first release made true (docs/start-page-journey-plan.md, P2): the
  // no-JavaScript line with an inbox and without, the name limits' errors, the done page's new
  // lines, every design's name and descriptor, the email, and what /privacy now says.
  noScriptLine(null),
  noScriptLine('hello@pinnaclepx.example'),
  NO_SCRIPT_CALL,
  ...Object.values(NAME_TOO_LONG),
  SITE.partialNote,
  ...Object.values(SLOT_LINES),
  ...Object.values(DESCRIPTORS),
  designName(0),
  designLinkName(0, 't01-aurora'),
  designLinkName(1, null),
  ...[
    SAMPLE_EMAIL,
    { ...SAMPLE_EMAIL, partial: true },
    { ...SAMPLE_EMAIL, conceptCount: 1 },
    { ...SAMPLE_EMAIL, name: '' },
  ].flatMap((input) => {
    const email = previewLinkEmail(input)
    return [email.subject, withoutAddresses(email.text)]
  }),
  ...PROCESSORS.map(([name, role]) => `${name} ${role}.`),
  ...DEVICE_STORAGE,
  UNSENT_PICTURES,
  // The flow's own lines from the first release (P1): the notices over a question, the done
  // view's stand-in with and without a first name, for three designs and for one, the tab's
  // titles at done, and the way to a new brief.
  ...Object.values(NOTICES),
  ...Object.values(DONE_LINES).filter((line) => line !== DONE_LINES.restoredAddress),
  SEND_FAILED,
  SEND_LIMIT,
  // The send's refusals, which the server words no more (P8), and the done view's lines from the
  // first release that now live in done-copy.ts: the build's end and the page with nothing to open.
  ...Object.values(SEND_REFUSED),
  ...[3, 2, 1].flatMap((count) => Object.values(buildSaid(count))),
  ...Object.values(STOPPED).flatMap((stopped) => Object.values(stopped)),
  ...Object.values(HUB_STOPPED).flatMap((stopped) => Object.values(stopped)),
  ...[3, 1].flatMap((count) => [waitingHeading('Sam', count), waitingHeading('', count)]),
  ...[undefined, SAMPLE_READY, { ...SAMPLE_READY, conceptCount: 1 }].flatMap(
    (status) => doneTitle(status) ?? [],
  ),
  // The third release's words (docs/start-page-journey-plan.md, P5): the draft's notes, tags,
  // chrome and caption, and the wait's and ready's lines, each branch with one-word samples
  // (draft-copy.test.ts and done-copy.test.ts hold the shapes at their edges). Counts are read at
  // three and at one, the build's usual size and the one that changes most words.
  ...Object.values(DRAFT_NOTES),
  ...STYLE_IDS.map(photosNote),
  faceNote('Fraunces'),
  signature('Sam'),
  ...Object.values(DRAFT_TAGS),
  ...Object.values(DRAFT_CHROME),
  draftFoot(2026),
  ...Object.values(DRAFT_CAPTION),
  ...[3, 1].flatMap((count) => [
    ...['Sam', ''].flatMap((first) => [
      headingText(buildingHeading(first, count)),
      headingText(readyHeading(first, count)),
    ]),
    buildingLead(count),
    lineText(emailLine(count, 'you')),
    lineText(layoutsLine(count, 'Gibbs')),
    lineText(layoutsLine(count, '')),
    ...(['running', 'done', 'fallback'] as const).map((state) => headlinesLine(count, state)),
    readyLead(count, '1:52'),
    readyLead(count, null),
    ...Object.values(stageSaid(count)),
  ]),
  PAGE_LINK_LIVE,
  lineText(emailLine(3, '')),
  usuallyDoneBy('14:32'),
  ...Object.values(SHARE_WORDS),
  ringCentre(2, 5),
  lineText(receivedLine('Gibbs')),
  lineText(receivedLine('')),
  lineText(tonesLine('Forest')),
  lineText(tonesLine(null)),
  BRIEF_LINE,
  photosLine({ state: 'running', photos: 0, style: 'Warm and natural' }),
  photosLine({ state: 'running', photos: 1, style: 'Warm and natural' }),
  photosLine({ state: 'running', photos: 4, style: 'Warm and natural' }),
  photosLine({ state: 'done', photos: 0 }),
  photosLine({ state: 'done', photos: 2 }),
  photosLine({ state: 'fallback' }),
  ...Object.values(INTERMISSION),
  EARLY_FINISH,
  openDesign(0),
  CALL_AFTER_OPEN,
  ...Object.values(PARTIAL_NOTES),
  BACK_TO_DESIGNS,
]
