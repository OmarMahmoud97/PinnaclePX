import type { AuroraContent } from '../copy-slots'
import gauge from './gauge.webp'
import radiator from './radiator.webp'

// Kestrel, an invented job-scheduling product for trades businesses, standing in for whatever a
// visitor's brief produces. Every word here is a slot the copy stage fills; the layout is not
// designed for these words but for the ranges in copy-slots.ts, which this content sits inside.
//
// Both photographs are from Pexels under its licence (https://www.pexels.com/license/), no faces
// and no printed text, resized to WebP at twice the largest size they are shown. The credits
// print in the footer.
export const KESTREL: AuroraContent = {
  brand: {
    name: 'Kestrel',
    legalName: 'Kestrel Software Ltd',
    tagline: 'Job scheduling for trades businesses that have outgrown the whiteboard.',
    logo: { kind: 'wordmark' },
  },
  nav: {
    links: [
      { label: 'What it does', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Why Kestrel', href: '#why' },
    ],
    cta: { label: 'Start free trial', href: '#start' },
  },
  hero: {
    headline: 'Every job, every van, one calendar.',
    subhead:
      'Kestrel keeps your bookings, quotes and invoices in one place, so the office knows where everyone is and customers hear back the same day.',
    primary: { label: 'Start free trial', href: '#start' },
    secondary: { label: 'See how it works', href: '#how-it-works' },
    reassurance: 'Free for two weeks. No card needed, and your data is yours if you leave.',
    frame: {
      title: 'Today',
      rows: [
        'Boiler service on Hartley Road',
        'Rewire quote for the bakery',
        'Kitchen tap, new build on Mill Lane',
      ],
    },
    image: {
      src: gauge.src,
      alt: 'A pressure gauge on steel heating pipes',
      width: gauge.width,
      height: gauge.height,
      credit: { photographer: 'Pavel Danilyuk', url: 'https://www.pexels.com/@pavel-danilyuk' },
    },
  },
  features: {
    title: 'Run the day from one screen.',
    lead: 'The office, the vans and the customer all look at the same plan, so nobody rings round to find out what changed.',
    items: [
      {
        title: 'Book it once',
        body: 'Drop a job on the calendar and the engineer, the customer and the invoice draft all know about it. Move it, and everyone is told.',
      },
      {
        title: 'Quote from the van',
        body: 'Build a quote on your phone at the job, send it before you leave, and see the moment it is accepted.',
      },
      {
        title: 'Get paid without chasing',
        body: 'Invoices go out when the job is marked done, with card and bank payment built in, and reminders you do not have to write.',
      },
    ],
  },
  steps: {
    title: 'Up and running in an afternoon.',
    lead: 'Kestrel imports what you already have and works alongside the tools you keep.',
    items: [
      {
        title: 'Bring your jobs across',
        body: 'Upload a spreadsheet or connect your accounting software. Your customers and open jobs appear in Kestrel as they are.',
      },
      {
        title: 'Add the team',
        body: 'Invite engineers by phone number. Each gets the app with their own day on it and nothing they do not need.',
      },
      {
        title: 'Send the first quote',
        body: 'Pick a job, build the quote from your price list and send it. From here on the plan runs itself.',
      },
    ],
  },
  statement: {
    text: 'We built Kestrel after watching a heating firm lose a day a week to phone calls about where the vans were.',
    image: {
      src: radiator.src,
      alt: 'A plumber in work gloves fitting a threaded pipe to a radiator',
      width: radiator.width,
      height: radiator.height,
      credit: { photographer: 'Sergei Starostin', url: 'https://www.pexels.com/@sejio402' },
    },
  },
  cta: {
    headline: 'Start with the jobs you have this week.',
    body: 'Set-up takes an afternoon, the first fortnight is free, and someone from Kestrel will help you import if you ask.',
    action: { label: 'Start free trial', href: 'https://example.com/signup' },
    reassurance: 'No card, no contract. Cancel from settings whenever you like.',
  },
  footer: {
    groups: [
      {
        heading: 'Product',
        links: [
          { label: 'What it does', href: '#features' },
          { label: 'How it works', href: '#how-it-works' },
          { label: 'Pricing', href: '#start' },
        ],
      },
      {
        heading: 'Company',
        links: [
          { label: 'Why Kestrel', href: '#why' },
          { label: 'Contact', href: 'mailto:hello@example.com' },
          { label: 'Privacy', href: '#top' },
        ],
      },
    ],
  },
}
