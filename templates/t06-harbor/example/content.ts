import type { HarborContent, HarborImage } from '../copy-slots'
import chloe from './unsplash-1438761681033.jpg'
import marcusWebb from './unsplash-1472099645785.jpg'
import priyaKapoor from './unsplash-1487412720507.jpg'
import protein from './unsplash-1490645935967.jpg'
import amara from './unsplash-1494790108377.jpg'
import ryan from './unsplash-1500648767791.jpg'
import jordan from './unsplash-1507003211169.jpg'
import ctaBackground from './unsplash-1517836357463.jpg'
import sofia from './unsplash-1526506118085.jpg'
import heroBackground from './unsplash-1534438327276.jpg'
import daniel from './unsplash-1548690312.jpg'
import coldTherapy from './unsplash-1552674605.jpg'
import facility from './unsplash-1571019614242.jpg'
import ava from './unsplash-1581009146145.jpg'
import jake from './unsplash-1583454110551.jpg'
import overload from './unsplash-1599058917765.jpg'

// Kestrel, the invented brand of the other examples, in Harbor's slots, block for block as the
// source's example content runs: the same photographs the source loads from Unsplash and the
// optional pieces filled, so the layout can be reviewed whole against its source. The
// source's name, FORGED, is Kestrel wherever the copy said it.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): HarborImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

const PRICING = { label: 'Get Access', href: '#pricing' } as const

export const KESTREL_HARBOR: HarborContent = {
  brand: { name: 'Kestrel', legalName: 'Kestrel Fitness', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'Home', href: '#hero' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: PRICING,
  },
  hero: {
    badge: 'Peak Performance Domain',
    headline: ['CONVERT', 'POTENTIAL TO', 'STRENGTH'],
    subhead:
      'Engineered workouts. Top-tier mentorship. Unrivaled progression for individuals demanding excellence.',
    primary: { label: 'Begin Journey', href: '#pricing' },
    secondary: { label: 'Who We Are', href: '#about' },
    stats: [
      { value: '12+', label: 'Years of Innovation' },
      { value: '5K+', label: 'Athletes Upgraded' },
      { value: '98%', label: 'Member Approval Rate' },
    ],
    image: picture(heroBackground, 'Elite athlete training'),
  },
  about: {
    eyebrow: 'Our Core Ethos',
    heading: { lines: ['DESIGNED FOR', 'VICTORIES,', 'NOT VOLUMES.'], emphasis: 'VICTORIES,' },
    paragraphs: [
      'Kestrel emerged from a clear truth: superior outcomes demand superior spaces. We have designed every single square inch, each training machine and all training systems to unlock absolute peak performance from our community.',
      'Zero compromises. Zero fads. Only empirical workout science, premium tier equipment and an unwavering commitment to supreme success.',
    ],
    tags: [
      'Data-Driven Routines',
      'Pro-Grade Trainers',
      'Recovery & Fueling',
      'Biometric Analytics',
    ],
    image: picture(facility, 'Premium gym training facility'),
    badge: { value: '12+', lines: ['Years of', 'Innovation'] },
    quotes: [
      {
        quote: 'Kestrel rebuilt my stamina. I slashed my marathon record by 18 minutes.',
        name: 'Marcus Chen',
        role: 'Marathon Runner',
      },
      {
        quote: 'The trainers are world-class. Incredible workout structures.',
        name: 'Priya Nair',
        role: 'Powerlifter',
      },
    ],
  },
  services: {
    eyebrow: 'Our Capabilities',
    heading: { lines: ['ROUTINES', 'THAT COMPEL'], emphasis: 'COMPEL' },
    lead: 'Each program is crafted with a single focus: trackable progression in the most efficient timeframe possible.',
    items: [
      {
        tag: 'Foundation',
        title: 'Force & Velocity',
        body: 'Heavy-iron sessions grounded in systemic overload principles. Dominate your squat, bench and pull.',
      },
      {
        tag: 'Fat Burn',
        title: 'Cardio & Stamina',
        body: 'Rapid-pace energy system protocols to accelerate lipid burn and elevate peak endurance capacities.',
      },
      {
        tag: 'Premium',
        title: 'Custom Mentorship',
        body: 'One-on-one sessions with credentialed training mentors. Bespoke pathways tailored for your unique targets.',
      },
      {
        tag: 'Recovery',
        title: 'Restoration & Therapy',
        body: 'Cold plunges, infrared heat, deep tissue work and flexibility drills. Rebuild quicker, execute stronger.',
      },
      {
        tag: 'Cardio',
        title: 'Aerobic Capacity',
        body: 'Base building to maximum oxygen uptake — systematic pacing systems for endurance competitors.',
      },
      {
        tag: 'Elite',
        title: 'Championship Ready',
        body: 'Focused prep strategies for powerlifting events, bodybuilding stages and sporting tournaments.',
      },
    ],
    more: 'Learn More',
  },
  metrics: {
    eyebrow: 'Key Metrics',
    heading: { lines: ['ACHIEVEMENTS', 'THAT TELL EVERYTHING'], emphasis: 'THAT TELL EVERYTHING' },
    watermark: 'NUMBERS',
    items: [
      { value: '5,000+', label: 'Athletes Guided', description: 'Top performers globally' },
      { value: '98%', label: 'Triumph Rate', description: 'Objective mastery' },
      { value: '47', label: 'Specialist Instructors', description: 'Accredited leaders' },
      { value: '12+', label: 'Years Running', description: 'Decades of distinction' },
      { value: '320+', label: 'Sessions Monthly', description: 'Diverse modalities' },
      { value: '15,000sqft', label: 'Physical Footprint', description: 'Next-gen facilities' },
    ],
  },
  gallery: {
    eyebrow: 'Proven Outcomes',
    heading: { lines: ['THE ACHIEVEMENT', 'GALLERY'], emphasis: 'ACHIEVEMENT' },
    items: [
      {
        image: picture(jake, 'Jake Rivera'),
        tag: 'Body Fat',
        name: 'Jake Rivera',
        result: '-32 lbs in 12 weeks',
      },
      {
        image: picture(ava, 'Ava Thompson'),
        tag: 'Power',
        name: 'Ava Thompson',
        result: '+18kg Deadlift PR',
      },
      {
        image: picture(daniel, 'Daniel Moore'),
        tag: 'Stamina',
        name: 'Daniel Moore',
        result: 'Marathon Finisher',
      },
      {
        image: picture(sofia, 'Sofia Alvarez'),
        tag: 'Pro',
        name: 'Sofia Alvarez',
        result: 'Competition Ready',
      },
    ],
    cta: { label: 'Begin Your Journey', href: '#pricing' },
  },
  pricing: {
    eyebrow: 'Elite Memberships',
    heading: { lines: ['UNLEASH YOUR ELITE', 'ATHLETE'], emphasis: 'ATHLETE' },
    lead: 'Zero contracts, cancel anytime. Enjoy a 7‑day free elite trial.',
    popular: 'Most Popular',
    plans: [
      {
        name: 'Foundation',
        price: '$79',
        period: '/ month',
        description: 'All the essentials to launch your elite training journey.',
        features: [
          'Gym floor access (6am–10pm)',
          'Group classes (10/month)',
          'Basic fitness assessment',
          'Locker room access',
          'App access & progress tracking',
        ],
        cta: 'Start Now',
        highlight: false,
      },
      {
        name: 'Performance',
        price: '$149',
        period: '/ month',
        description: 'The go‑to plan for high‑performance athletes.',
        features: [
          '24/7 gym floor access',
          'Unlimited group classes',
          'Monthly 1-on-1 coaching session',
          'Advanced biometric tracking',
          'Recovery suite access',
          'Nutrition guidance',
          'Priority class booking',
        ],
        cta: 'Upgrade to Performance',
        highlight: true,
      },
      {
        name: 'Elite',
        price: '$299',
        period: '/ month',
        description: 'Complete, unrestricted access to all elite facilities.',
        features: [
          'All Performance features',
          'Weekly personal training (4x)',
          'Custom meal planning',
          'Competition prep support',
          'VIP recovery suite priority',
          'Guest passes (2/month)',
          'Dedicated coach',
        ],
        cta: 'Become Elite',
        highlight: false,
      },
    ],
    note: 'All prices are in USD. Taxes may apply based on your location. Cancel anytime — no questions asked.',
  },
  testimonials: {
    eyebrow: 'Athlete Voices',
    heading: { lines: ['WHAT OUR', 'ELITE VOICES'], emphasis: 'ELITE VOICES' },
    items: [
      {
        quote:
          "Kestrel transcends a gym — it's an elite performance sanctuary. Coaches drive relentless progress. I shed 28 lbs and shattered personal strength records.",
        name: 'Jordan Miles',
        role: 'Software Engineer',
        rating: 5,
        image: picture(jordan, 'Jordan Miles'),
      },
      {
        quote:
          "The programming eclipses all I've experienced. My stamina surged dramatically within eight weeks.",
        name: 'Amara Singh',
        role: 'Yoga Instructor & Runner',
        rating: 5,
        image: picture(amara, 'Amara Singh'),
      },
      {
        quote:
          'Top‑tier facility, world‑class coaching. The recovery suite — infrared sauna and ice bath — revolutionizes my regeneration.',
        name: 'Ryan Torres',
        role: 'Competitive Powerlifter',
        rating: 5,
        image: picture(ryan, 'Ryan Torres'),
      },
      {
        quote:
          'I doubted the premium cost. Now I train nowhere else. The return on my physique and mindset is truly transformative.',
        name: 'Chloe Bennett',
        role: 'Entrepreneur',
        rating: 5,
        image: picture(chloe, 'Chloe Bennett'),
      },
      {
        quote:
          'As a trainer myself, I know quality when I see it. Kestrel is the real deal — the equipment, programming and community are second to none.',
        name: 'Marcus Webb',
        role: 'Personal Trainer',
        rating: 5,
        image: picture(marcusWebb, 'Marcus Webb'),
      },
      {
        quote:
          'Training here keeps me sane during brutal hospital shifts. The 24/7 access and quick 45-min sessions are exactly what I need.',
        name: 'Priya Kapoor',
        role: 'Medical Resident',
        rating: 5,
        image: picture(priyaKapoor, 'Priya Kapoor'),
      },
    ],
  },
  partners: {
    label: 'Trusted by the best — powered by elite partnerships',
    names: [
      'Nike Training',
      'Optimum Nutrition',
      'Garmin',
      'Rogue Fitness',
      'WHOOP',
      'MyProtein',
      'Hyperice',
      'Eleiko',
      'TechnoGym',
      'Wahoo',
    ],
  },
  contact: {
    eyebrow: 'FAQ',
    heading: { lines: ['COMMON ASKED', 'QUESTIONS'], emphasis: 'QUESTIONS' },
    faq: [
      {
        question: 'Is there a contract or commitment required?',
        answer:
          'No contracts, ever. All Kestrel memberships are month-to-month. You can cancel at any time with 30 days notice, no questions asked.',
      },
      {
        question: 'Do you offer a free trial?',
        answer:
          'Yes — every plan includes a 7-day free trial. Experience the full Kestrel facility, classes and coaching before committing to a membership.',
      },
      {
        question: 'What are your gym operating hours?',
        answer:
          'Foundation members enjoy access from 6am–10pm daily. Performance and Elite members have 24/7 access using their biometric key fob.',
      },
      {
        question: 'Are personal training sessions included?',
        answer:
          'Performance plans include one monthly 1-on-1 coaching session. Elite members receive four dedicated personal training sessions per week with a dedicated coach.',
      },
      {
        question: 'What recovery facilities do you offer?',
        answer:
          'Our recovery suite features infrared saunas, ice bath tanks, percussion massage stations and a dedicated mobility & stretching zone.',
      },
      {
        question: 'Can I freeze my membership?',
        answer:
          'Yes, you can freeze your membership for up to 2 months per year at no additional cost. Perfect for travel or injury recovery.',
      },
    ],
    form: {
      eyebrow: 'Get In Touch',
      heading: { lines: ['START YOUR', 'JOURNEY TODAY'], emphasis: '' },
      lead: 'Drop us a message. Our team responds within 2 hours.',
      labels: { name: 'Name', email: 'Email', message: 'Goal / Message' },
      placeholder: 'Tell us about your fitness goals...',
      button: 'Send Message',
      email: null,
    },
  },
  cta: {
    eyebrow: 'Exclusive Slots Open',
    heading: { lines: ['YOUR POTENTIAL AWAITS', 'TO BE UNLEASHED.'], emphasis: 'TO BE UNLEASHED.' },
    body: 'Secure your complimentary trial and experience elite training today — no card needed. Take the first step toward elite results. Join our community and push your boundaries.',
    primary: { label: 'Secure Your Trial', href: '#pricing' },
    secondary: { label: 'Connect with a Coach', href: '#contact' },
    image: picture(ctaBackground, 'Elite gym training'),
  },
  blog: {
    eyebrow: 'Insight Hub',
    heading: { lines: ['KESTREL INSIGHTS', 'FORGING POWER'], emphasis: 'FORGING POWER' },
    link: { label: 'Explore All Insights', href: '#top' },
    posts: [
      {
        image: picture(overload, 'The Science Behind Progressive Overload: Why Your Gains Plateau'),
        category: 'Training',
        readTime: '6 min read',
        title: 'The Science Behind Progressive Overload: Why Your Gains Plateau',
        excerpt:
          'Understanding the neurological and muscular adaptations that drive strength gains — and how to keep them coming.',
        date: 'May 28, 2025',
        author: 'Coach Alex Reed',
      },
      {
        image: picture(protein, 'Optimizing Protein Intake: Timing, Sources & the 0.8g Myth'),
        category: 'Nutrition',
        readTime: '8 min read',
        title: 'Optimizing Protein Intake: Timing, Sources & the 0.8g Myth',
        excerpt:
          "New research suggests most gym-goers are dramatically underestimating their protein needs. Here's what the data says.",
        date: 'May 21, 2025',
        author: 'Dr. Priya Mehta, RD',
      },
      {
        image: picture(
          coldTherapy,
          'Cold Therapy & Infrared Saunas: The Contrast Protocol Explained',
        ),
        category: 'Recovery',
        readTime: '5 min read',
        title: 'Cold Therapy & Infrared Saunas: The Contrast Protocol Explained',
        excerpt:
          'Elite athletes have been using contrast therapy for decades. We break down the evidence and the optimal protocol.',
        date: 'May 14, 2025',
        author: 'Coach Sarah Kim',
      },
    ],
  },
  footer: {
    description:
      'The premium fitness destination for those who demand excellence. Transform energy into power, every single day.',
    newsletter: {
      label: 'Get the weekly training drop',
      placeholder: 'your@email.com',
      email: null,
    },
    columns: [
      {
        heading: 'Company',
        links: [
          { label: 'About Us', href: '#about' },
          { label: 'Our Story', href: '#about' },
          { label: 'Careers', href: '#top' },
          { label: 'Press', href: '#top' },
          { label: 'Partners', href: '#partners' },
        ],
      },
      {
        heading: 'Programs',
        links: [
          { label: 'Strength Training', href: '#services' },
          { label: 'HIIT & Conditioning', href: '#services' },
          { label: 'Personal Coaching', href: '#services' },
          { label: 'Recovery Suite', href: '#services' },
          { label: 'Competition Prep', href: '#services' },
        ],
      },
      {
        heading: 'Support',
        links: [
          { label: 'FAQ', href: '#contact' },
          { label: 'Contact Us', href: '#contact' },
          { label: 'Membership Help', href: '#pricing' },
          { label: 'Cancellation Policy', href: '#top' },
          { label: 'Privacy Policy', href: '#top' },
        ],
      },
    ],
    note: 'Crafted with obsession.',
    smallPrint: 'Privacy · Terms · Cookies',
    socials: [
      { network: 'instagram', href: '#' },
      { network: 'x', href: '#' },
      { network: 'youtube', href: '#' },
      { network: 'facebook', href: '#' },
    ],
  },
}
