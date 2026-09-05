import type { MeridianContent, MeridianImage } from '../copy-slots'
import heroDark from './hero-image-dark.jpeg'
import avatar58 from './pravatar-58.jpg'
import radix from './radix.png'
import team1 from './team-1.jpg'
import team2 from './team-2.jpg'
import team3 from './team-3.jpg'
import team4 from './team-4.jpg'
import team5 from './team-5.jpg'
import team6 from './team-6.jpg'
import team7 from './team-7.jpg'

// Kestrel, the invented job-scheduling product from the Aurora example, in Meridian's slots,
// section for section as the source's example content runs: the same pictures the source
// ships or loads (its dashboard screenshot, the avatar it takes from GitHub, the portraits it
// loads from pravatar.cc and Unsplash) and the optional sections filled, so the layout can be
// reviewed whole.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): MeridianImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

const HERO = picture(heroDark, 'A music app dashboard')
const RADIX = picture(radix, 'An avatar')
const ALL_SOCIALS = [
  { network: 'linkedin', href: '#' },
  { network: 'github', href: '#' },
  { network: 'x', href: '#' },
] as const

export const KESTREL_MERIDIAN: MeridianContent = {
  brand: { name: 'Kestrel', legalName: 'Kestrel Software Ltd', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'Team', href: '#team' },
      { label: 'Contact', href: '#contact' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: { label: 'View on GitHub', href: '#community' },
    menu: {
      label: 'Features',
      items: [
        { title: 'Showcase Your Value', body: 'Highlight how your product solves user problems.' },
        {
          title: 'Build Trust',
          body: 'Leverages social proof elements to establish trust and credibility.',
        },
        {
          title: 'Capture Leads',
          body: 'Make your lead capture form visually appealing and strategically.',
        },
      ],
      image: RADIX,
    },
  },
  hero: {
    badge: { label: 'New', text: 'Design is out now!' },
    headline: { text: 'Experience the Kestrel landing page', emphasis: 'Kestrel' },
    subhead:
      "We're more than just a tool, we're a community of passionate creators. Get access to exclusive resources, tutorials, and support.",
    primary: { label: 'Get Started', href: '#community' },
    secondary: { label: 'Github respository', href: '#features' },
    image: HERO,
  },
  sponsors: {
    heading: 'Our Platinum Sponsors',
    items: ['Acmebrand', 'Acmelogo', 'Acmesponsor', 'Acmeipsum', 'Acme', 'Accmee', 'Acmetech'],
  },
  benefits: {
    eyebrow: 'Benefits',
    heading: 'Your Shortcut to Success',
    lead: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Non ducimus reprehenderit architecto rerum similique facere odit deleniti necessitatibus quo quae.',
    items: [
      {
        title: 'Build Brand Trust',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam. Natus consectetur dolores.',
      },
      {
        title: 'More Leads',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam, natus consectetur.',
      },
      {
        title: 'Higher Conversions',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus consectetur. A odio velit cum aliquam',
      },
      {
        title: 'Test Marketing Ideas',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam. Natus consectetur dolores.',
      },
    ],
  },
  features: {
    eyebrow: 'Features',
    heading: 'What Makes Us Different',
    lead: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatem fugiat, odit similique quasi sint reiciendis quidem iure veritatis optio facere tenetur.',
    items: [
      {
        title: 'Mobile Friendly',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam, consectetur.',
      },
      {
        title: 'Social Proof',
        body: 'Lorem ipsum dolor sit amet consectetur. Natus consectetur, odio ea accusamus aperiam.',
      },
      {
        title: 'Targeted Content',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. odio ea accusamus aperiam.',
      },
      {
        title: 'Strong Visuals',
        body: 'Lorem elit. A odio velit cum aliquam. Natus consectetur dolores, odio ea accusamus aperiam.',
      },
      {
        title: 'Clear CTA',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing. odio ea accusamus consectetur.',
      },
      {
        title: 'Clear Headline',
        body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam. Natus consectetur.',
      },
    ],
  },
  services: {
    eyebrow: 'Services',
    heading: 'Grow Your Business',
    lead: 'From marketing and sales to operations and strategy, we have the expertise to help you achieve your goals.',
    items: [
      {
        title: 'Custom Domain Integration',
        body: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit adipisicing.',
        pro: false,
      },
      {
        title: 'Social Media Integrations',
        body: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Molestiae, dicta.',
        pro: false,
      },
      {
        title: 'Email Marketing Integrations',
        body: 'Lorem dolor sit amet adipisicing.',
        pro: false,
      },
      { title: 'SEO Optimization', body: 'Lorem ipsum dolor sit amet consectetur.', pro: true },
    ],
  },
  testimonials: {
    eyebrow: 'Testimonials',
    heading: 'Hear What Our 1000+ Clients Say',
    items: [
      {
        image: RADIX,
        name: 'John Doe',
        role: 'Product Manager',
        comment:
          'Wow NextJs + Shadcn is awesome!. This template lets me change colors, fonts and images to match my brand identity.',
        rating: 5,
      },
      {
        image: RADIX,
        name: 'Sophia Collins',
        role: 'Cybersecurity Analyst',
        comment:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        rating: 4.8,
      },
      {
        image: RADIX,
        name: 'Adam Johnson',
        role: 'Chief Technology Officer',
        comment:
          'Lorem ipsum dolor sit amet,exercitation. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        rating: 4.9,
      },
      {
        image: RADIX,
        name: 'Ethan Parker',
        role: 'Data Scientist',
        comment:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod labore et dolore magna aliqua. Ut enim ad minim veniam.',
        rating: 5,
      },
      {
        image: RADIX,
        name: 'Ava Mitchell',
        role: 'IT Project Manager',
        comment:
          'Lorem ipsum dolor sit amet, tempor incididunt  aliqua. Ut enim ad minim veniam, quis nostrud incididunt consectetur adipiscing elit.',
        rating: 5,
      },
      {
        image: RADIX,
        name: 'Isabella Reed',
        role: 'DevOps Engineer',
        comment:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        rating: 4.9,
      },
    ],
  },
  team: {
    eyebrow: 'Team',
    heading: 'The Company Dream Team',
    members: [
      {
        image: picture(avatar58, 'A portrait'),
        firstName: 'Leo',
        lastName: 'Miranda',
        positions: ['Vue Fronted Developer', 'Creator Of This Website'],
        socials: ALL_SOCIALS,
      },
      {
        image: picture(team1, 'A portrait'),
        firstName: 'Elizabeth',
        lastName: 'Moore',
        positions: ['UI/UX Designer'],
        socials: [ALL_SOCIALS[0], ALL_SOCIALS[2]],
      },
      {
        image: picture(team2, 'A portrait'),
        firstName: 'David',
        lastName: 'Diaz',
        positions: ['Machine Learning Engineer', 'TensorFlow Tinkerer'],
        socials: [ALL_SOCIALS[0], ALL_SOCIALS[1]],
      },
      {
        image: picture(team3, 'A portrait'),
        firstName: 'Sarah',
        lastName: 'Robinson',
        positions: ['Cloud Native Developer', 'Kubernetes Orchestrator'],
        socials: ALL_SOCIALS,
      },
      {
        image: picture(team4, 'A portrait'),
        firstName: 'Michael',
        lastName: 'Holland',
        positions: ['DevOps Engineer', 'CI/CD Pipeline Mastermind'],
        socials: [ALL_SOCIALS[0]],
      },
      {
        image: picture(team5, 'A portrait'),
        firstName: 'Zoe',
        lastName: 'Garcia',
        positions: ['JavaScript Evangelist', 'Deno Champion'],
        socials: [ALL_SOCIALS[0], ALL_SOCIALS[1]],
      },
      {
        image: picture(team6, 'A portrait'),
        firstName: 'Evan',
        lastName: 'James',
        positions: ['Backend Developer'],
        socials: ALL_SOCIALS,
      },
      {
        image: picture(team7, 'A portrait'),
        firstName: 'Pam',
        lastName: 'Taylor',
        positions: ['Fullstack Developer', 'UX Researcher'],
        socials: [ALL_SOCIALS[2]],
      },
    ],
  },
  community: {
    heading: { text: 'Ready to join this Community?', emphasis: 'Community?' },
    body: 'Join our vibrant Discord community! Connect, share, and grow with like-minded enthusiasts. Click to dive in! 🚀',
    action: { label: 'Join Discord', href: '#contact' },
  },
  pricing: {
    eyebrow: 'Pricing',
    heading: 'Get unlimitted access',
    lead: 'Lorem ipsum dolor sit amet consectetur adipisicing reiciendis.',
    plans: [
      {
        title: 'Free',
        popular: false,
        price: '$0',
        period: '/month',
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        button: { label: 'Start Free Trial', href: '#contact' },
        benefits: [
          '1 team member',
          '1 GB storage',
          'Upto 2 pages',
          'Community support',
          'AI assistance',
        ],
      },
      {
        title: 'Premium',
        popular: true,
        price: '$45',
        period: '/month',
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        button: { label: 'Get starterd', href: '#contact' },
        benefits: [
          '4 team member',
          '8 GB storage',
          'Upto 6 pages',
          'Priority support',
          'AI assistance',
        ],
      },
      {
        title: 'Enterprise',
        popular: false,
        price: '$120',
        period: '/month',
        body: 'Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.',
        button: { label: 'Contact US', href: '#contact' },
        benefits: [
          '10 team member',
          '20 GB storage',
          'Upto 10 pages',
          'Phone & email support',
          'AI assistance',
        ],
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    heading: 'Connect With Us',
    lead: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum ipsam sint enim exercitationem ex autem corrupti quas tenetur',
    rows: [
      { title: 'Find us', lines: ['742 Evergreen Terrace, Springfield, IL 62704'] },
      { title: 'Call us', lines: ['+1 (619) 123-4567'] },
      { title: 'Mail US', lines: ['leomirandadev@gmail.com'] },
      { title: 'Visit us', lines: ['Monday - Friday', '8AM - 4PM'] },
    ],
    form: {
      subjects: [
        'Web Development',
        'Mobile Development',
        'Figma Design',
        'REST API',
        'FullStack Project',
      ],
      button: 'Send message',
      email: null,
    },
  },
  faq: {
    eyebrow: 'FAQS',
    heading: 'Common Questions',
    items: [
      { question: 'Is this template free?', answer: 'Yes. It is a free NextJS Shadcn template.' },
      {
        question: 'Duis aute irure dolor in reprehenderit in voluptate velit?',
        answer:
          'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint labore quidem quam consectetur sapiente, iste rerum reiciendis animi nihil nostrum sit quo, modi quod.',
      },
      {
        question: 'Lorem ipsum dolor sit amet Consectetur natus dolor minus quibusdam?',
        answer:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore qui nostrum reiciendis veritatis.',
      },
      {
        question: 'Excepteur sint occaecat cupidata non proident sunt?',
        answer: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.',
      },
      {
        question: 'Enim ad minim veniam, quis nostrud exercitation ullamco laboris?',
        answer: 'consectetur adipisicing elit. Sint labore.',
      },
    ],
  },
  footer: {
    groups: [
      {
        heading: 'Contact',
        links: [
          { label: 'Github', href: '#top' },
          { label: 'Twitter', href: '#top' },
          { label: 'Instagram', href: '#top' },
        ],
      },
      {
        heading: 'Platforms',
        links: [
          { label: 'iOS', href: '#top' },
          { label: 'Android', href: '#top' },
          { label: 'Web', href: '#top' },
        ],
      },
      {
        heading: 'Help',
        links: [
          { label: 'Contact Us', href: '#contact' },
          { label: 'FAQ', href: '#faq' },
          { label: 'Feedback', href: '#contact' },
        ],
      },
      {
        heading: 'Socials',
        links: [
          { label: 'Twitch', href: '#top' },
          { label: 'Discord', href: '#top' },
          { label: 'Dribbble', href: '#top' },
        ],
      },
    ],
  },
}
