import type { InegroContent, InegroImage } from '../copy-slots'
import approach from './approach.webp'
import intro from './intro.webp'
import mission from './mission.webp'
import service1 from './service-1.webp'
import service2 from './service-2.webp'
import service3 from './service-3.webp'
import service4 from './service-4.webp'
import service5 from './service-5.webp'
import service6 from './service-6.webp'

// Kestrel, the invented brand of the other examples, in Inegro's slots, block for block as the
// source's home page runs, with the optional row of social links filled so the layout can be
// reviewed whole. The source was a real client's site, so its words and pictures are not
// copied: Kestrel is an energy advisory here, written to the lengths of the source's copy in
// each slot (a paragraph of about the same length lights up in each glass card, six names fill
// the list), and its pictures are Pexels photographs in the source's moods, credited in the
// footer (THIRD_PARTY_NOTICES.md).
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string, photographer: string, url: string): InegroImage {
  return {
    src: file.src,
    alt,
    width: file.width,
    height: file.height,
    credit: { photographer, url },
  }
}

const SERVICES = [
  {
    name: 'Energy Audits',
    line: 'A room-by-room look at where your building loses heat and power.',
    title: 'Find the Leaks',
    tagline: 'With a site visit',
    image: picture(
      service1,
      'An engineer adjusting the controls of a boiler',
      'Heiko Ruth',
      'https://www.pexels.com/photo/plumber-repairing-power-source-7859953/',
    ),
  },
  {
    name: 'Solar Feasibility',
    line: 'Whether panels suit your roof, and what they would really return.',
    title: 'Read the Roof',
    tagline: 'With a shading survey',
    image: picture(
      service2,
      'Solar panels on a red tiled roof',
      'Vladimir Srajber',
      'https://www.pexels.com/photo/close-up-of-solar-panels-on-a-roof-of-a-house-17965455/',
    ),
  },
  {
    name: 'Heat Pump Planning',
    line: 'Sizing, siting and grants for moving off gas, done in the right order.',
    title: 'Leave Gas Behind',
    tagline: 'With a heat loss survey',
    image: picture(
      service3,
      'A heat pump outside a modern building',
      'alpha innotec',
      'https://www.pexels.com/photo/modern-heat-pump-outside-new-building-38067323/',
    ),
  },
  {
    name: 'Net Zero Roadmaps',
    line: 'A plan your board can sign off and your staff can actually follow.',
    title: 'Plan the Route',
    tagline: 'With a carbon baseline',
    image: picture(
      service4,
      'Wind turbines against an orange sunset',
      'Yura Radochin',
      'https://www.pexels.com/photo/wind-turbines-at-dusk-in-germany-landscape-36762891/',
    ),
  },
  {
    name: 'Grant Applications',
    line: 'Help finding the funding you qualify for and making a strong case for it.',
    title: 'Fund the Work',
    tagline: 'With a funding search',
    image: picture(
      service5,
      'Hands sketching plans on paper around a table',
      'Anna Shvets',
      'https://www.pexels.com/photo/businesspeople-preparing-schemes-on-papers-at-table-5324973/',
    ),
  },
  {
    name: 'Staff Workshops',
    line: 'Short sessions that turn good intentions into habits across the whole team.',
    title: 'Bring People Along With You',
    tagline: 'With your whole team',
    image: picture(
      service6,
      'A man presenting a chart to colleagues',
      'Mikael Blomkvist',
      'https://www.pexels.com/photo/a-man-standing-in-front-of-the-room-6476782/',
    ),
  },
] as const

export const KESTREL_INEGRO: InegroContent = {
  brand: { name: 'Kestrel', legalName: 'Kestrel Energy Advisory Ltd', logo: { kind: 'wordmark' } },
  nav: {
    items: [
      {
        label: 'Services',
        href: '#services',
        children: SERVICES.map((service) => ({ label: service.name, href: '#services' })),
      },
      {
        label: 'About',
        href: '#intro',
        children: [
          { label: 'Introduction', href: '#intro' },
          { label: 'Our approach', href: '#approach' },
          { label: 'Why we exist', href: '#mission' },
        ],
      },
      { label: 'Why us', href: '#offers', children: [] },
      { label: 'How we work', href: '#process', children: [] },
    ],
    cta: { label: 'Get in touch', href: '#contact' },
  },
  hero: {
    headline: { text: 'Powering a path to lower bills', emphasis: 'Powering' },
    subhead:
      'Practical energy advice for small firms. Lower bills, fewer emissions, less guesswork.',
    linksLabel: 'See how we can help',
    links: [
      { label: 'Services', href: '#services' },
      { label: 'How we work', href: '#process' },
      { label: 'About us', href: '#approach' },
      { label: 'Get in touch', href: '#contact' },
    ],
  },
  intro: {
    label: 'Introduction',
    text: 'Kestrel is an energy advisory for small and growing businesses that want to cut their bills and their emissions without the jargon. We don’t sell panels or pumps, and we don’t take commissions. Instead, we look at how your building really uses energy, explain what is worth changing and what is not, and help you plan the work in a sensible order. We believe good decisions come from clear numbers and honest advice, even when the answer is to wait. We won’t promise miracles, but we will show you what each step costs and where it is best to start.',
    cta: { label: 'Book an energy review', href: '#services' },
    image: picture(
      intro,
      'Soft white clouds in a bright sky',
      'Irina P',
      'https://www.pexels.com/photo/clouds-in-the-sky-12021972/',
    ),
  },
  services: {
    label: 'Services',
    cta: { label: 'Show all services', href: '#contact' },
    itemCta: { label: 'Enquire now', href: '#contact' },
    items: SERVICES,
  },
  notes: {
    items: [
      {
        text: 'We only recommend what pays its way, and we show you the sums behind every suggestion before you spend a penny.',
        name: 'Clear numbers',
        role: 'How we advise',
      },
      {
        text: 'Most savings hide in ordinary things: controls, settings and habits. We look there first, before anything new is bought.',
        name: 'Small things first',
        role: 'Where we start',
      },
      {
        text: 'We don’t sell equipment or take commissions, so the advice you get is the advice we would take ourselves.',
        name: 'No commissions',
        role: 'Why you can rely on it',
      },
    ],
    statement: {
      text: 'Every business can use less energy without losing what makes it work. We started Kestrel to show how it is done, one building at a time, in plain words.',
      name: 'Kestrel',
      role: 'Why we do this',
    },
  },
  process: {
    label: 'How we work together',
    body: 'Whether you run a single shop or a handful of sites, working with us follows the same simple rhythm. We start by listening to what you want to change, look closely at how your buildings use energy, and then agree a plan you are comfortable with. You stay in charge of every decision, and we stay with you until the changes are in and working.',
    cta: { label: 'Start a conversation', href: '#contact' },
    steps: ['Tell us about your building', 'We measure and model', 'You choose what happens next'],
  },
  approach: {
    label: 'Our approach',
    text: 'Kestrel is led by building engineers who know their way around boiler rooms, plant rooms and loft spaces. In conversation with owners, managers and the people who work in each building, we look for changes that fit how the place is really used, so the savings last long after we have gone and the building keeps working the way you need it to.',
    cta: { label: 'Find out more', href: '#offers' },
    image: picture(
      approach,
      'Three walkers on a misty forest trail',
      'Jungsik Kwak',
      'https://www.pexels.com/photo/foggy-forest-trail-with-hikers-37639605/',
    ),
  },
  offers: {
    label: 'Why us',
    lead: 'Rooted in engineering and plain speaking, we offer more than a list of products to buy.',
    cta: { label: 'Talk to an adviser', href: '#contact' },
    itemCta: { label: 'Learn more', href: '#contact' },
    items: [
      {
        tag: 'Independent',
        title: 'Independent Advice: No Products, No Commissions',
        body: 'We are paid for our time, never by suppliers, so every recommendation stands on its own.',
      },
      {
        tag: 'Practical',
        title: 'Plans You Can Act On',
        body: 'Every report ends with a short list of steps, what each one costs and who can do the work.',
      },
      {
        tag: 'Long term',
        title: 'Support Long After the Report',
        body: 'We stay on hand while the work is done and check the savings once it has settled in.',
      },
    ],
  },
  mission: {
    label: 'Why we exist',
    text: 'Kestrel exists to make the move to cleaner energy practical for the businesses that keep our high streets and industrial estates running. We focus on the relationship between buildings, the people in them and the energy they use, and on the everyday decisions that decide how much of it is wasted. Cutting that waste is good for the bottom line, and it is where a lower-carbon future starts.',
    cta: { label: 'Get in touch', href: '#contact' },
    image: picture(
      mission,
      'Orange coral on a reef in clear blue water',
      'Francesco Ungaro',
      'https://www.pexels.com/photo/coral-reefs-under-water-13272160/',
    ),
  },
  newsletter: {
    heading: 'Subscribe to our notes',
    placeholder: 'Your email',
    button: 'Subscribe',
    email: 'hello@kestrel.example',
  },
  closing: {
    text: 'Kestrel Energy Advisory is an independent consultancy that helps small businesses understand, reduce and plan their energy use, and explains every step of the way in plain language.',
    secondary: { label: 'See our services', href: '#services' },
    cta: { label: 'Get in touch', href: 'mailto:hello@kestrel.example' },
    social: [
      { network: 'instagram', href: '#top' },
      { network: 'linkedin', href: '#top' },
      { network: 'x', href: '#top' },
      { network: 'substack', href: '#top' },
      { network: 'facebook', href: '#top' },
      { network: 'youtube', href: '#top' },
      { network: 'spotify', href: '#top' },
      { network: 'bluesky', href: '#top' },
    ],
  },
  footer: {
    links: [
      { label: 'About us', href: '#intro' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
  },
}
