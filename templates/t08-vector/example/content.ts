import type { VectorContent, VectorImage } from '../copy-slots'
import project1 from './project-1.webp'
import project2 from './project-2.webp'
import project3 from './project-3.webp'

// Kestrel, the invented brand of the other examples, in Vector's slots, block for block as the
// source's demo content runs: the same three pictures the demo ships (used as its three
// projects, its About picture and the two in its bento) and the optional pieces filled, so the
// layout can be reviewed whole against its source.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): VectorImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

export const KESTREL_VECTOR: VectorContent = {
  brand: { name: 'kestrel', legalName: 'Kestrel', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'Home', href: '#top', section: 'hero' },
      { label: 'Work', href: '#projects', section: 'projects' },
      { label: 'Services', href: '#services-menu', section: 'services' },
      { label: 'About us', href: '#about', section: 'about' },
      { label: 'Testimonials', href: '#social-proof', section: 'social-proof' },
      { label: 'Contact', href: '#contact', section: 'contact' },
    ],
  },
  hero: {
    headline: ['Crafting digital', 'experiences that', 'inspire & convert.'],
    subhead:
      'A creative agency specializing in brand strategy, web design, and development — building truly memorable products that convert.',
    scrollHint: 'Scroll',
  },
  projects: {
    marquee: { text: 'Selected', accent: 'Work' },
    items: [
      {
        titleUp: 'Brand',
        titleDown: 'Vision',
        description:
          'A complete brand identity transformation that redefined how audiences connect with innovation.',
        image: picture(project1, 'Brand Vision'),
      },
      {
        titleUp: 'Digital',
        titleDown: 'Canvas',
        description:
          'An immersive digital experience that pushes the boundaries of web interaction and storytelling.',
        image: picture(project2, 'Digital Canvas'),
      },
      {
        titleUp: 'Future',
        titleDown: 'Forward',
        description:
          "Crafting tomorrow's digital landscape through bold design choices and seamless experiences.",
        image: picture(project3, 'Future Forward'),
      },
    ],
  },
  services: {
    heading: 'We craft experiences that captivate. Brands that endure.',
    items: ['Digital Experiences', 'Brand Identity', 'Creative Direction', 'Product Design'],
  },
  about: {
    image: picture(project2, 'Design studio workspace'),
    statement:
      'At Kestrel, we transform bold ideas into immersive digital experiences through good design and relentless creativity.',
    cta: { label: 'More about us', href: '#contact' },
  },
  proof: {
    heading: 'Trusted by industry leaders',
    cta: { label: 'Work with us', href: '#contact' },
    images: [picture(project1, 'Team member'), picture(project2, 'Team member')],
    quote: {
      text: "Kestrel's design work output is superb, they could transform our input into dev-ready designs.",
      name: 'Alex Chen',
      role: 'CTO, Nextura',
      company: 'nextura',
    },
    stats: [
      { value: '3x Faster', label: 'Time to Market Launch', company: 'novahq' },
      { value: '+280%', label: 'Increase in Engagement', company: 'arclight' },
    ],
    rating: {
      value: 'Top 1%',
      lines: ['Digital Experience', '& Product Studios'],
      note: '5.0 Rated On Trustpilot',
    },
    story: {
      text: 'We helped Meridian rebrand and launch their new platform, resulting in 12M+ users within the first quarter.',
      company: 'Meridian',
    },
  },
  faq: {
    heading: ['Frequently Asked', 'Questions'],
    items: [
      {
        question: 'What makes Kestrel different from other agencies?',
        answer:
          "We blend strategic thinking with bold creativity. Unlike traditional agencies, we're a tight-knit team of designers and developers who obsess over every pixel. We don't just deliver projects—we partner with you to create digital experiences that truly move the needle.",
      },
      {
        question: 'How long does a typical project take?',
        answer:
          "Most projects range from 6-12 weeks depending on scope. A brand identity might take 4-6 weeks, while a full website redesign with development typically runs 8-12 weeks. We'll provide a detailed timeline during our initial consultation.",
      },
      {
        question: 'Do you work with startups or only established brands?',
        answer:
          "We love working with both. Startups bring fresh energy and the chance to build something from scratch. Established brands offer the challenge of evolving while honoring legacy. Whether you're pre-seed or Series C, we adapt our process to fit your stage and budget.",
      },
      {
        question: 'Can you help with ongoing design and development needs?',
        answer:
          "Absolutely. Many clients start with a project and transition to a retainer model. Our monthly partnerships include dedicated hours for design updates, new features, A/B testing, and strategic consultation. It's like having an in-house creative team on call.",
      },
      {
        question: "What's your design and development process like?",
        answer:
          "We follow a proven four-phase approach: Discovery (research & strategy), Design (wireframes to high-fidelity), Development (clean, scalable code), and Launch (testing & optimization). You're involved at every milestone with clear deliverables and feedback loops.",
      },
    ],
  },
  footer: {
    email: 'hello@example.com',
    cta: { label: 'Start New Project', href: 'mailto:hello@example.com' },
    tagline: 'Built to evolve ideas.',
    places: {
      heading: 'Location',
      entries: [
        { title: 'Worldwide', lines: ['100% Remote Team'] },
        { title: 'United States', lines: ['San Francisco, CA', 'Los Angeles, CA'] },
      ],
    },
    services: {
      heading: 'Services',
      items: ['Web Design', 'Development', 'Branding', 'Strategy', 'Motion'],
    },
    navigation: {
      heading: 'Navigation',
      links: [
        { label: 'Home', href: '#top' },
        { label: 'Work', href: '#projects' },
        { label: 'Services', href: '#services' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    social: {
      heading: 'Social',
      links: [
        { label: 'Dribbble', href: 'https://dribbble.com' },
        { label: 'Instagram', href: 'https://instagram.com' },
        { label: 'Behance', href: 'https://behance.net' },
        { label: 'LinkedIn', href: 'https://linkedin.com' },
        { label: 'Twitter', href: 'https://twitter.com' },
      ],
    },
    bottomLinks: [
      { label: 'About Us', href: '#about' },
      { label: 'Our Work', href: '#projects' },
      { label: 'Contact', href: '#contact' },
    ],
    credit: 'Created with passion by Kestrel',
  },
}
