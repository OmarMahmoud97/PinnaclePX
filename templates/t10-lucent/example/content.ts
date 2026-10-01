import type { LucentContent, LucentImage } from '../copy-slots'
import breakdown from './breakdown.webp'
import feature1 from './feature-1.webp'
import feature2 from './feature-2.webp'
import feature3 from './feature-3.webp'
import feature4 from './feature-4.webp'
import hero from './hero.webp'
import journal from './journal.webp'
import logo from './logo.png'
import overview from './overview.webp'
import pair1 from './pair-1.webp'
import pair2 from './pair-2.webp'
import promo from './promo.webp'
import reminder from './reminder.webp'
import steps from './steps.webp'
import widgets from './widgets.webp'

// The source's own page in Lucent's slots, block for block, for review beside it. The source is
// the owner's own site for their own app (ADR 0043), so its words and pictures are used as they
// are, its name included, where the other examples swap in Kestrel: the pictures show the app by
// name, and the owner compares the two pages line by line. The films are stills taken from the
// source's own files at the frame its page shows, cropped to what its window shows (the feature
// films were wider than their windows). The optional pricing, badges and social links are
// filled from the source so the layout can be reviewed whole.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): LucentImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

// The source's links led to the App Store and its journal; here every one is an anchor of the
// page, as the pipeline's are.
const STORE = '#contact'
const READ_MORE = 'Read more'

export const SUBSCRR_LUCENT: LucentContent = {
  brand: {
    name: 'Subscrr',
    legalName: 'Subscrr',
    logo: { kind: 'image', src: logo.src, alt: 'Subscrr', width: logo.width, height: logo.height },
  },
  nav: {
    items: [
      { label: 'Overview', href: '#overview' },
      { label: 'AI Spend', href: '#feature-4' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Journal', href: '#contact' },
    ],
    cta: { label: 'Get the app', href: STORE },
  },
  hero: {
    headline: 'All your subscriptions. And what they really cost.',
    lead: 'Everything you pay for in one place, the honest total per day, month and year, and a quiet nudge the day before the money leaves.',
    cta: { label: 'Download on iOS', href: STORE },
    secondary: { label: 'See it in motion', href: '#overview' },
    image: picture(hero, 'Subscrr on iPhone'),
  },
  promo: { image: picture(promo, 'Subscrr promo film') },
  overview: {
    label: 'Overview',
    heading: ['See how much you', 'really spend.'],
    body: 'Open the app and the sums are already done. How many you are paying for, what it costs a month and a year, no spreadsheet in sight. The next charges line up below, nearest first, so nothing sneaks up on you.',
    ticks: [
      'Live monthly & yearly totals',
      'A countdown to every charge',
      'Any currency, converted at daily rates',
    ],
    image: picture(
      overview,
      'Subscrr Overview screen on iPhone: monthly and yearly subscription totals',
    ),
  },
  breakdown: {
    label: 'Breakdown',
    heading: ['Per year.', 'Per month.', 'Per day.'],
    body: 'That "cheap" annual plan, divided by 365, is still a small daily habit. Subscrr shows the number that actually lands each day, so renewing becomes a choice instead of a reflex.',
    image: picture(breakdown, 'Sunlit portrait with pink flowers: calm, editorial Subscrr mood'),
  },
  reminder: {
    label: 'Reminders',
    heading: ['Never get', 'surprise-charged again.'],
    body: 'The day before the money leaves, a gentle tap on the shoulder. So you renew because you meant to, not because you forgot it was there.',
    notice: {
      title: 'Subscription Reminder',
      text: 'Tomorrow is your Fitness App renewal.',
      time: '9:41 AM',
    },
    image: picture(reminder, ''),
  },
  steps: {
    label: 'Setup · One screenshot',
    heading: 'Import what Apple already charges you for.',
    body: 'Everything on your Apple ID sits on one screen. Screenshot it, drop it in, and we read the names, prices and dates for you.',
    items: ['Open Subscriptions', 'Take a screenshot', 'Drop it in here'],
    image: picture(
      steps,
      'A hand holding an iPhone with the Import from App Store screen in Subscrr: take a screenshot and your subscriptions add themselves',
    ),
  },
  features: {
    items: [
      {
        label: 'Subscrr AI',
        badge: 'Beta',
        heading: ['Ask what to cancel.', 'And what it saves.'],
        body: "Subscrr AI finds where you're wasting money: duplicate subscriptions, overpriced plans, price hikes, and upcoming charges. Ask anything, get actionable findings, and see exactly how much you could save.",
        more: { label: READ_MORE, href: STORE },
        image: picture(feature1, 'Asking Subscrr AI where you overpay, on iPhone'),
      },
      {
        label: 'New · Financial plan',
        badge: 'Beta',
        heading: ['Build a plan.', 'Just ask.'],
        body: "Tell Subscrr what you earn and spend. It maps your year month by month, shows what's left, flags tight months early, and lets you test a purchase before you make it.",
        more: { label: READ_MORE, href: STORE },
        image: picture(
          feature2,
          'Building a financial plan in Subscrr by describing your money in a sentence',
        ),
      },
      {
        label: 'Financial plan · iPad',
        badge: null,
        heading: ['The whole year,', 'side by side.'],
        body: 'On iPad the plan opens into a full table: twelve months across, every category in its own row, scenarios a tap apart. Change one cell and the rest of the year follows.',
        more: { label: READ_MORE, href: STORE },
        image: picture(
          feature3,
          'A family budget open in Subscrr on iPad: twelve months side by side, every category in its own row',
        ),
      },
      {
        label: 'Premium · AI Spend',
        badge: null,
        heading: ['Snap a receipt.', 'Let AI do the math.'],
        body: 'Typing receipts is a chore. Snapping one is a tap. The AI pulls out the numbers, files them into categories, and throws the photo away.',
        more: { label: READ_MORE, href: STORE },
        image: picture(feature4, 'AI Spend analyzing a receipt on iPhone'),
      },
    ],
  },
  widgets: {
    label: 'Premium · Widgets',
    heading: ['Your next payment,', 'right on the Home Screen.'],
    body: 'What is due next, on the Home and Lock Screen. You find out without opening the app, which is the highest praise an app can get. Comes with Premium.',
    image: picture(widgets, 'Subscrr widget on the iPhone Home Screen'),
  },
  pair: {
    label: 'Apple Watch',
    heading: ['The next charge,', 'on your wrist.'],
    body: 'A complication on the watch face shows what is due next and what it costs. Pick its colour right on the watch. The daily affirmation lives there too.',
    images: [
      picture(pair1, 'A raised wrist and Subscrr showing the next charge: ChatGPT Plus on 21 Aug'),
      picture(pair2, 'Subscrr complication on an Apple Watch face: Netflix Premium due 11 Aug'),
    ],
  },
  manifesto: {
    text: 'You know roughly what you pay every month. Roughly is the problem. All your subscriptions. We counted ours and cancelled three the same evening. Subscrr turns that quiet leak into one honest number you can act on.',
    emphasis: ['Roughly', 'one honest number'],
  },
  pricing: {
    label: 'Pricing',
    heading: ['Free to start.', 'Premium when you grow.'],
    toggle: { monthly: 'Monthly', yearly: 'Yearly', saving: '−69%' },
    free: {
      name: 'Free',
      price: '$0',
      note: 'Enough to see the whole picture.',
      items: [
        { strong: '', text: 'Up to 6 subscriptions' },
        { strong: '', text: 'Per day / month / year breakdowns' },
        { strong: '', text: 'Renewal reminders' },
        { strong: '', text: 'The whole calculator, custom colours' },
        { strong: '', text: 'Subscrr AI: limited, 5 messages and 1 scan' },
        { strong: '', text: 'One financial plan to try' },
        { strong: '', text: 'iCloud sync & privacy' },
      ],
      cta: { label: 'Start free', href: STORE },
    },
    pro: {
      flag: 'Most popular',
      name: 'Premium',
      currency: '$',
      monthly: 7.99,
      yearly: 29.99,
      per: { monthly: '/mo', yearly: '/yr' },
      note: {
        monthly: 'Billed monthly. Cancel anytime.',
        yearly: '$2.50 a month, billed yearly. Cancel anytime.',
      },
      items: [
        { strong: 'Unlimited', text: ' subscriptions' },
        { strong: 'Subscrr AI', text: ': ask where you overpay' },
        { strong: 'Financial plan', text: ': your year month by month' },
        { strong: 'AI Spend', text: ': scan receipts & statements' },
        { strong: '', text: 'AI chats without the message limit' },
        { strong: 'Widgets', text: ' for Home and Lock Screen' },
        { strong: '', text: 'Alternate app icons' },
        { strong: '', text: 'Everything in Free, and no ads ever' },
      ],
      cta: { label: 'Go Premium', href: STORE },
    },
  },
  faq: {
    label: 'FAQ',
    heading: 'Good questions.',
    items: [
      {
        question: 'Do I have to connect my bank?',
        answer:
          "Never. Subscrr doesn't touch your bank. You add subscriptions yourself. Takes a minute, and nothing about your finances ever leaves your hands.",
      },
      {
        question: 'Where is my data stored?',
        answer:
          "Your subscriptions sit in your own private iCloud, tied to your Apple ID and synced across your devices. They never reach our servers, so we can't read them even if we wanted to. Receipts you scan are read and then dropped: AI takes the numbers, the picture is discarded. The full breakdown is in the privacy policy.",
      },
      {
        question: 'What do I get for free?',
        answer:
          'Up to six subscriptions with full breakdowns, reminders, custom icons and iCloud sync. When six stops being enough, Premium unlocks unlimited subscriptions, the AI Spend scanner and Subscrr AI.',
      },
      {
        question: 'Can I cancel Premium anytime?',
        answer:
          "Yes, in two taps: it's a standard App Store subscription. Your free plan keeps working. No hard feelings.",
      },
    ],
  },
  promise: {
    lead: 'Private by Design.',
    text: 'What you pay for lives in your own iCloud, and we never see it.',
    badges: ['iCloud private sync', 'No ads in the app', 'No data sold', 'Anonymous stats only'],
  },
  journal: {
    lines: ['Open', 'the Subscrr', 'Journal'],
    sub: 'We break down subscriptions and how much money they’re costing you.',
    link: { label: 'Open the Subscrr Journal', href: STORE },
    image: picture(journal, ''),
    form: {
      heading: 'Subscribe for updates',
      placeholder: 'you@example.com',
      button: 'Subscribe',
      terms:
        'By subscribing, you agree to receive the Subscrr newsletter. You can unsubscribe anytime.',
      email: 'hi@subscrr.app',
    },
  },
  footer: {
    lead: 'Download',
    tail: 'to get Started',
    href: STORE,
    markAsInitial: true,
    button: { label: 'Download on the App Store', href: STORE },
    fine: 'iPhone, iPad & Mac · iOS 18+ · Free to start',
    links: [
      { label: 'Help Center', href: '#faq' },
      { label: 'Journal', href: '#contact' },
      { label: 'Privacy Policy', href: '#faq' },
      { label: 'Terms of Use', href: '#faq' },
    ],
    contact: { label: 'Contact us', email: 'hi@subscrr.app' },
    social: [
      { network: 'threads', href: 'https://threads.net/@subscrr' },
      { network: 'instagram', href: 'https://instagram.com/subscrr' },
      { network: 'telegram', href: 'https://t.me/subscrr_app' },
      { network: 'x', href: 'https://x.com/subscrr' },
      { network: 'tiktok', href: 'https://www.tiktok.com/@subscrr' },
      { network: 'youtube', href: 'https://www.youtube.com/@subscrr_app' },
    ],
  },
}
