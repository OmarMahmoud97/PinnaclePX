import { BUILD_STEPS, careLines, REAL_BUILD, timelineLine } from '@/app/_components/build-items'
import { FAQ_ITEMS } from '@/app/_components/faq-items'
import { FOOTER_GROUPS } from '@/app/_components/footer-links'
import { BOOK_CALL, CTA, NAV_LINKS } from '@/app/_components/nav-links'
import { BEFORE_YOU_PAY, optionRows, YOUR_OPTIONS } from '@/app/_components/option-items'
import { OUTCOME_ITEMS, OUTCOMES } from '@/app/_components/outcome-items'
import {
  CLOSING,
  FAQ,
  FOOTER,
  HOW_IT_WORKS,
  STRAIGHT_ANSWERS,
} from '@/app/_components/section-copy'
import { NOT_READY_SENTENCE, SHARE } from '@/app/_components/share-copy'
import { SECOND_VISIT, straightAnswerItems } from '@/app/_components/straight-answer-items'
import { TASTER, TASTER_STEPS } from '@/app/_components/taster-items'
import { WHAT_YOU_GET_ITEMS } from '@/app/_components/what-you-get-items'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { CALL_AGENDA, SITE } from '@/lib/site'

// Every sentence a visitor reads on the home page, in one list, for the copy tests. Lines that
// render from a value take a sample of each branch, so a wording that only appears once a
// decision is recorded is still checked today.
const SAMPLE_CARE = { checkMinutes: 5, replyWorkingDays: 1, backupsPerDay: 1, changesPerMonth: 3 }
const SAMPLE_CARE_PLURAL = {
  checkMinutes: 15,
  replyWorkingDays: 2,
  backupsPerDay: 2,
  changesPerMonth: 5,
}

export const COPY: readonly string[] = [
  SITE.tagline,
  SITE.subhead,
  SITE.description,
  SITE.reassurance,
  SITE.callPromise,
  SITE.colourPromise,
  CTA.label,
  BOOK_CALL.label,
  ...NAV_LINKS.map((link) => link.label),
  ...FOOTER_GROUPS.flatMap((group) => [group.heading, ...group.links.map((link) => link.label)]),
  ...Object.values(SKETCH_CAPTION),
  ...CALL_AGENDA.map((item) => item.what),
  ...WHAT_YOU_GET_ITEMS.flatMap((item) => [item.title, item.detail]),
  HOW_IT_WORKS.heading,
  HOW_IT_WORKS.lead,
  ...HOW_IT_WORKS.beats.map((beat) => beat.text),
  ...HOW_IT_WORKS.legend.flatMap((row) => [row.label, row.state]),
  ...Object.values(OUTCOMES),
  ...OUTCOME_ITEMS.flatMap((item) => [item.label, item.body]),
  ...Object.values(TASTER),
  ...TASTER_STEPS.flatMap((step) => [step.title, step.body]),
  ...Object.values(REAL_BUILD),
  ...BUILD_STEPS.flatMap((step) => [
    step.title,
    step.body,
    ...(step.more === undefined ? [] : [step.more]),
  ]),
  timelineLine(null),
  timelineLine({ min: 4, max: 8 }),
  ...careLines(SAMPLE_CARE),
  ...careLines(SAMPLE_CARE_PLURAL),
  ...Object.values(YOUR_OPTIONS),
  ...Object.values(BEFORE_YOU_PAY),
  ...optionRows(0).flatMap((row) => [row.question, row.builder, row.studio]),
  STRAIGHT_ANSWERS.heading,
  STRAIGHT_ANSWERS.lead,
  ...straightAnswerItems(0).flatMap((item) => [item.question, item.answer]),
  ...Object.values(SECOND_VISIT),
  FAQ.heading,
  FAQ.lead,
  ...FAQ_ITEMS.flatMap((item) => [
    item.question,
    item.answer,
    ...(item.link === undefined ? [] : [item.link.label]),
  ]),
  CLOSING.heading,
  NOT_READY_SENTENCE,
  SHARE.subject,
  SHARE.body,
  SHARE.copied,
  FOOTER.blurb,
]
