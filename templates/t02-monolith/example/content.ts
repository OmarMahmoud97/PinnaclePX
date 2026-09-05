import type { MonolithContent, MonolithImage } from '../copy-slots'
import cubeLeg from './cube-leg.png'
import growth from './growth.png'
import lookingAhead from './looking-ahead.png'
import pilot from './pilot.png'
import avatar17 from './pravatar-17.jpg'
import avatar35 from './pravatar-35.jpg'
import avatar36 from './pravatar-36.jpg'
import avatar58 from './pravatar-58.jpg'
import avatar60 from './pravatar-60.jpg'
import reflecting from './reflecting.png'

// Kestrel, the invented job-scheduling product from the Aurora example, in Monolith's slots,
// section for section as the source's example content runs: the same pictures the source
// ships (its five illustrations from the repository and the placeholder portraits it loads from
// pravatar.cc) and the optional sections filled, so the layout can be reviewed whole.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): MonolithImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

const CTA = { label: 'Get Started', href: '#cta' } as const
const SOCIALS = [
  { network: 'linkedin', href: '#' },
  { network: 'facebook', href: '#' },
  { network: 'instagram', href: '#' },
] as const

export const KESTREL_MONOLITH: MonolithContent = {
  brand: { name: 'Kestrel/Trades', legalName: 'Kestrel Software Ltd', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: { label: 'Github', href: '#cta' },
  },
  hero: {
    headline: {
      text: 'Kestrel landing page for trades businesses',
      first: 'Kestrel',
      second: 'trades',
    },
    subhead:
      'Build your trades business effortlessly with the bookings, quotes and invoices you need in one calendar.',
    primary: CTA,
    secondary: { label: 'Github Repository', href: '#how-it-works' },
    cards: {
      quote: {
        text: 'This landing page is awesome!',
        role: '@kestrel_trades',
        image: picture(avatar35, 'A portrait'),
      },
      profile: {
        role: 'Frontend Developer',
        body: 'I really enjoy transforming ideas into functional software that exceeds expectations',
        image: picture(avatar58, 'A portrait'),
      },
      plan: {
        title: 'Free',
        badge: 'Most popular',
        price: { amount: '$0', period: '/month' },
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        action: { label: 'Start Free Trial', href: '#cta' },
        points: ['4 Team member', '4 GB Storage', 'Upto 6 pages'],
      },
      service: {
        title: 'Light & dark mode',
        body: 'Lorem ipsum dolor sit amet consect adipisicing elit. Consectetur natusm.',
      },
    },
  },
  sponsors: {
    heading: 'Investors and founders',
    items: ['Sponsor 1', 'Sponsor 2', 'Sponsor 3', 'Sponsor 4', 'Sponsor 5', 'Sponsor 6'],
  },
  about: {
    heading: { text: 'About Company', emphasis: 'About' },
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    highlights: [
      { value: '2.7K+', label: 'Users' },
      { value: '1.8K+', label: 'Subscribers' },
      { value: '112', label: 'Downloads' },
      { value: '4', label: 'Products' },
    ],
    image: picture(pilot, 'A drawing of a pilot in a helmet'),
  },
  steps: {
    heading: { text: 'How It Works Step-by-Step Guide', emphasis: 'Works' },
    lead: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis dolor pariatur sit!',
    items: [
      {
        title: 'Accessibility',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum',
      },
      {
        title: 'Community',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum',
      },
      {
        title: 'Scalability',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum',
      },
      {
        title: 'Gamification',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum quas provident cum',
      },
    ],
  },
  features: {
    heading: { text: 'Many Great Features', emphasis: 'Great Features' },
    tags: [
      'Dark/Light theme',
      'Reviews',
      'Features',
      'Pricing',
      'Contact form',
      'Our team',
      'Responsive design',
      'Newsletter',
      'Minimalist',
    ],
    items: [
      {
        title: 'Responsive Design',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.',
        image: picture(lookingAhead, 'A drawing of a person looking ahead'),
      },
      {
        title: 'Intuitive user interface',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.',
        image: picture(reflecting, 'A drawing of a person reflecting'),
      },
      {
        title: 'AI-Powered insights',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.',
        image: picture(growth, 'A drawing of a growing plant'),
      },
    ],
  },
  services: {
    heading: { text: 'Client-Centric Services', emphasis: 'Client-Centric' },
    lead: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis dolor.',
    items: [
      {
        title: 'Code Collaboration',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.',
      },
      {
        title: 'Project Management',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.',
      },
      {
        title: 'Task Automation',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi nesciunt est nostrum omnis ab sapiente.',
      },
    ],
    image: picture(cubeLeg, 'A drawing of a cube on a leg'),
  },
  cta: {
    heading: { text: 'All Your Ideas & Concepts In One Interface', emphasis: 'Ideas & Concepts' },
    body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque, beatae. Ipsa tempore ipsum iste quibusdam illum ducimus eos. Quasi, sed!',
    primary: { label: 'Request a Demo', href: '#cta' },
    secondary: { label: 'View all features', href: '#features' },
  },
  testimonials: {
    heading: { text: 'Discover Why People Love This Landing Page', emphasis: 'People Love' },
    lead: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Non unde error facere hic reiciendis illo',
    items: [
      {
        image: picture(avatar60, 'A portrait'),
        name: 'John Doe React',
        handle: '@john_Doe',
        comment: 'This landing page is awesome!',
      },
      {
        image: picture(avatar36, 'A portrait'),
        name: 'John Doe React',
        handle: '@john_Doe1',
        comment:
          'Lorem ipsum dolor sit amet,empor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.',
      },
      {
        image: picture(avatar17, 'A portrait'),
        name: 'John Doe React',
        handle: '@john_Doe2',
        comment:
          'Lorem ipsum dolor sit amet,exercitation. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
      },
      {
        image: picture(avatar35, 'A portrait'),
        name: 'John Doe React',
        handle: '@john_Doe3',
        comment:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      },
      {
        image: picture(avatar58, 'A portrait'),
        name: 'John Doe React',
        handle: '@john_Doe4',
        comment:
          'Lorem ipsum dolor sit amet, tempor incididunt  aliqua. Ut enim ad minim veniam, quis nostrud.',
      },
      {
        image: picture(avatar60, 'A portrait'),
        name: 'John Doe React',
        handle: '@john_Doe5',
        comment:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      },
    ],
  },
  team: {
    heading: { text: 'Our Dedicated Crew', emphasis: 'Our Dedicated' },
    lead: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis dolor pariatur sit!',
    members: [
      {
        image: picture(avatar35, 'A portrait'),
        name: 'Emma Smith',
        position: 'Product Manager',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        socials: SOCIALS,
      },
      {
        image: picture(avatar60, 'A portrait'),
        name: 'John Doe',
        position: 'Tech Lead',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        socials: SOCIALS,
      },
      {
        image: picture(avatar36, 'A portrait'),
        name: 'Ashley Ross',
        position: 'Frontend Developer',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        socials: [SOCIALS[0], SOCIALS[2]],
      },
      {
        image: picture(avatar17, 'A portrait'),
        name: 'Bruce Rogers',
        position: 'Backend Developer',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        socials: [SOCIALS[0], SOCIALS[1]],
      },
    ],
  },
  pricing: {
    heading: { text: 'Get Unlimited Access', emphasis: 'Unlimited' },
    lead: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias reiciendis.',
    plans: [
      {
        title: 'Free',
        popular: false,
        price: '$0',
        period: '/month',
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        button: { label: 'Get Started', href: '#cta' },
        benefits: [
          '1 Team member',
          '2 GB Storage',
          'Upto 4 pages',
          'Community support',
          'lorem ipsum dolor',
        ],
      },
      {
        title: 'Premium',
        popular: true,
        price: '$5',
        period: '/month',
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        button: { label: 'Start Free Trial', href: '#cta' },
        benefits: [
          '4 Team member',
          '4 GB Storage',
          'Upto 6 pages',
          'Priority support',
          'lorem ipsum dolor',
        ],
      },
      {
        title: 'Enterprise',
        popular: false,
        price: '$40',
        period: '/month',
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        button: { label: 'Contact US', href: '#cta' },
        benefits: [
          '10 Team member',
          '8 GB Storage',
          'Upto 10 pages',
          'Priority support',
          'lorem ipsum dolor',
        ],
      },
    ],
  },
  newsletter: {
    heading: { text: 'Join Our Daily Newsletter', emphasis: 'Newsletter' },
    lead: 'Lorem ipsum dolor sit amet consectetur.',
    placeholder: 'leomirandadev@gmail.com',
    button: 'Subscribe',
    email: null,
  },
  faq: {
    heading: { text: 'Frequently Asked Questions', emphasis: 'Questions' },
    items: [
      {
        question: 'Is this template free?',
        answer: 'Yes. It is a free ChadcnUI template. Use it as it is or change every word.',
      },
      {
        question: 'Lorem ipsum dolor sit amet consectetur adipisicing elit?',
        answer:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint labore quidem quam? Consectetur sapiente iste rerum reiciendis animi nihil nostrum sit quo, modi quod.',
      },
      {
        question: 'Lorem ipsum dolor sit amet  Consectetur natus dolores minus quibusdam?',
        answer:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore qui nostrum reiciendis veritatis necessitatibus maxime quis ipsa vitae cumque quo?',
      },
      {
        question: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit?',
        answer: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quas provident cum.',
      },
      {
        question: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur natus?',
        answer:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint labore quidem quam? Consectetur sapiente iste rerum reiciendis animi nihil nostrum sit quo, modi quod.',
      },
    ],
    prompt: 'Still have questions?',
    link: { label: 'Contact us', href: '#cta' },
  },
  footer: {
    groups: [
      {
        heading: 'Follow US',
        links: [
          { label: 'Github', href: '#top' },
          { label: 'Twitter', href: '#top' },
          { label: 'Dribbble', href: '#top' },
        ],
      },
      {
        heading: 'Platforms',
        links: [
          { label: 'Web', href: '#top' },
          { label: 'Mobile', href: '#top' },
          { label: 'Desktop', href: '#top' },
        ],
      },
      {
        heading: 'About',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ],
      },
      {
        heading: 'Community',
        links: [
          { label: 'Youtube', href: '#top' },
          { label: 'Discord', href: '#top' },
          { label: 'Twitch', href: '#top' },
        ],
      },
    ],
  },
}
