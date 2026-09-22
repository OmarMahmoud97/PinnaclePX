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
import { QUESTIONS } from '@/app/start/_components/brief-questions'
import { SKETCH_CAPTION } from '@/components/sketch/captions'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { CONFIG } from '@/lib/config'
import { CALL_AGENDA, PRICE, printedPrice, SITE } from '@/lib/site'

// Every sentence a visitor reads on the home page, in one list, for the copy tests. Lines that
// render from a value take a sample of each branch, so a wording that only appears once a
// decision is recorded is still checked today.
const SAMPLE_CARE = { checkMinutes: 5, replyWorkingDays: 1, backupsPerDay: 1, changesPerMonth: 3 }

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
  // The five questions repeat the home page's promises, so they keep its rules. Titles are taken
  // before a company name is known; with one they only gain the name.
  ...Object.values(QUESTIONS).flatMap((question) => [
    question.title(BLANK_ANSWERS),
    question.helper,
  ]),
]
