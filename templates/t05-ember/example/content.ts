import type { EmberContent, EmberImage } from '../copy-slots'
import about from './about.png'
import chef from './chef.png'
import dish1 from './dish-1.png'
import dish2 from './dish-2.png'
import dish3 from './dish-3.png'
import dish4 from './dish-4.png'
import dish5 from './dish-5.png'
import dish6 from './dish-6.png'
import dish7 from './dish-7.png'
import dish8 from './dish-8.png'
import heroBanner from './hero-banner.png'
import timing from './restro-timing.png'
import sofia from './unsplash-1438761681033.jpg'
import emily from './unsplash-1494790108377.jpg'
import rohan from './unsplash-1500648767791.jpg'
import aarav from './unsplash-1507003211169.jpg'
import danielWong from './unsplash-1522075469751.jpg'
import guestFour from './unsplash-1527980965255.jpg'
import danielKim from './unsplash-1539571696357.jpg'
import guestOne from './unsplash-1633332755192.jpg'

// Kestrel, the invented brand of the other examples, in Ember's slots, section for section as
// the source's example content runs: the same pictures the source ships (its photographs and
// dishes from its build and the placeholder portraits it loads from Unsplash) and the optional
// pieces filled, so the layout can be reviewed whole against its source.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): EmberImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

const BOOK = { label: 'Book a table', href: '#booking-process' } as const

const DISHES = [
  [dish1, 'Grilled Chicken Alfredo', '$24'],
  [dish2, 'Mushroom Risotto', '$22'],
  [dish3, 'Caprese Salad', '$16'],
  [dish4, 'Spaghetti & Meatballs', '$23'],
  [dish5, 'Caesar Salad', '$15'],
  [dish6, 'Grilled Atlantic Salmon', '$29'],
  [dish7, 'Grilled Ribeye Steak', '$39'],
  [dish8, 'Seafood Linguine', '$29'],
] as const

export const KESTREL_EMBER: EmberContent = {
  brand: { name: 'Kestrel', legalName: 'Kestrel', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'About', href: '#about' },
      { label: 'Dishes', href: '#dishes' },
      { label: 'Contact', href: '#timing' },
      { label: 'Faq', href: '#faq' },
    ],
    cta: BOOK,
  },
  hero: {
    eyebrow: 'WHERE FLAVOR MEETS ELEGANCE',
    headline: 'Crafted for unforgettable dining moments',
    subhead:
      'Experience carefully curated menus, fresh local ingredients and impeccable service in a space made for every celebration.',
    cta: BOOK,
    background: picture(heroBanner, 'A marble table laid with plates of food'),
    proof: {
      avatars: [
        picture(guestOne, 'guest'),
        picture(sofia, 'guest'),
        picture(danielWong, 'guest'),
        picture(guestFour, 'guest'),
      ],
      line: '4.8/5 Rating - 10,000 reviews',
    },
  },
  about: {
    eyebrow: 'Crafted with Passion',
    heading: 'Experience dining beyond expectations',
    body: 'We combine fresh local ingredients, creative recipes and elegant presentation to deliver a memorable experience with every visit.',
    image: picture(about, 'Salmon Dish and White Wine'),
    location: {
      image: picture(about, 'Bistro Royale Location Preview'),
      name: 'Bistro Royale, NY',
      link: { label: 'View on Map', href: '#timing' },
    },
  },
  stats: [
    {
      title: 'Premium Ingredients',
      body: 'We carefully source the freshest ingredients to create dishes full of authentic flavor.',
    },
    {
      title: "Chef's Expertise",
      body: 'Every recipe is prepared with precision, creativity, and years of culinary experience.',
    },
    {
      title: 'Warm Hospitality',
      body: 'Our dedicated team ensures every guest enjoys exceptional service from start to finish.',
    },
  ],
  dishes: {
    eyebrow: "Chef's Signature Selection",
    heading: 'Discover our signature dishes',
    items: DISHES.map(([file, title, note]) => ({ image: picture(file, title), title, note })),
  },
  features: {
    eyebrow: 'What Sets Us Apart',
    heading: 'Crafting memorable dining experiences',
    items: [
      {
        title: 'Chef-Crafted Dishes',
        body: 'Every dish is prepared by expert chefs using authentic recipes and premium ingredients.',
      },
      {
        title: 'Farm Fresh Ingredients',
        body: 'We source fresh, seasonal ingredients daily to deliver exceptional flavor and quality in every meal.',
      },
      {
        title: 'Warm Hospitality',
        body: 'Enjoy attentive service and a welcoming atmosphere that makes every visit comfortable and memorable.',
      },
    ],
    image: picture(chef, 'Chef Preparing Plate of Food'),
  },
  booking: {
    eyebrow: 'Table Reservation Process',
    heading: 'Reserve your table in three simple steps',
    testimonial: {
      quote:
        "We had an amazing evening with delicious food, excellent service, and a warm atmosphere. We'll definitely visit again.",
      name: 'Sofia Martinez',
      image: picture(sofia, 'Sofia Martinez'),
    },
    steps: [
      {
        title: 'Choose your date & time',
        body: 'Select your preferred date, time, and party size to begin your reservation in just a few seconds.',
      },
      {
        title: 'Enter your details',
        body: 'Provide your name, contact information and any special requests so we can prepare for your visit.',
      },
      {
        title: 'Confirm your booking',
        body: 'Review your reservation details and receive instant confirmation for a seamless dining experience.',
      },
    ],
  },
  timing: {
    image: picture(timing, 'A laid table by a window'),
    title: 'Opening time:',
    rows: [
      { label: 'Monday', value: '10 AM - 09 PM', closed: false },
      { label: 'Tuesday', value: '11 AM - 10 PM', closed: false },
      { label: 'Wednesday', value: '10 AM - 09 PM', closed: false },
      { label: 'Thursday', value: '10 AM - 10 PM', closed: false },
      { label: 'Friday', value: 'Closed', closed: true },
      { label: 'Saturday', value: '11 AM - 10 PM', closed: false },
      { label: 'Sunday', value: '12 AM - 9 PM', closed: false },
    ],
    body: 'Come and see us. Book a table for any day of the week and we will have it ready when you arrive.',
    cta: BOOK,
  },
  testimonials: {
    eyebrow: 'LOVED BY FOOD LOVERS',
    heading: 'What Our Guests Say',
    items: [
      {
        quote:
          "Every dish was fresh, flavorful, and beautifully presented. The service was outstanding, and we'll definitely be back again.",
        name: 'Aarav Sharma',
        place: 'Mumbai, India',
        image: picture(aarav, 'Aarav Sharma'),
      },
      {
        quote:
          'Amazing food, quick service, and a welcoming atmosphere. Every meal exceeded our expectations from start to finish.',
        name: 'Rohan Mehta',
        place: 'Bangalore, India',
        image: picture(rohan, 'Rohan Mehta'),
      },
      {
        quote:
          'A wonderful dining experience with delicious food, friendly staff, and an atmosphere that made us feel right at home.',
        name: 'Emily Carter',
        place: 'London, UK',
        image: picture(emily, 'Emily Carter'),
      },
      {
        quote:
          'The flavors were authentic, every dish was perfectly prepared, and the presentation made the experience even more enjoyable.',
        name: 'Daniel Kim',
        place: 'Seoul, South Korea',
        image: picture(danielKim, 'Daniel Kim'),
      },
      {
        quote:
          "Beautiful presentation, fresh ingredients, and outstanding service. It's easily one of my favorite places to dine.",
        name: 'Sofia Martinez',
        place: 'Barcelona, Spain',
        image: picture(sofia, 'Sofia Martinez'),
      },
      {
        quote:
          'Great food, attentive staff, and a cozy ambiance. Every visit has been memorable, and I highly recommend it.',
        name: 'Daniel Wong',
        place: 'Sydney, Australia',
        image: picture(danielWong, 'Daniel Wong'),
      },
    ],
  },
  faq: {
    eyebrow: 'FAQs',
    heading: 'Frequently Asked Questions',
    items: [
      {
        question: 'Do you offer vegetarian and vegan options?',
        answer:
          'Yes, we have a dedicated selection of flavorful vegetarian and vegan options prepared with fresh ingredients. Look for the tags on our menu or ask your server.',
      },
      {
        question: 'Can I reserve a table online?',
        answer:
          'Yes! You can reserve your table online directly through our website by selecting your date, time and party size to receive instant confirmation.',
      },
      {
        question: 'Do you offer takeaway and delivery?',
        answer:
          "Absolutely. We offer takeaway for easy pickup, as well as delivery through our online platform partners. Select 'Order Online' to begin.",
      },
      {
        question: 'Are your ingredients fresh and locally sourced?',
        answer:
          'Yes, we partner with local farms and trusted organic suppliers daily to secure the freshest, highest quality seasonal ingredients for all our dishes.',
      },
      {
        question: 'Do you host private events or celebrations?',
        answer:
          'Yes, we host private parties, anniversaries, corporate events and large gatherings. Please contact our team via phone or email to discuss details.',
      },
    ],
  },
  cta: {
    heading: 'Every Meal Is Made To Be Remembered',
    body: 'Join us for fresh ingredients, signature recipes and an unforgettable dining experience.',
    button: { label: 'Book Your Table', href: '#booking-process' },
  },
  footer: {
    description:
      'Serving freshly prepared dishes with authentic flavors, premium ingredients and exceptional hospitality every day.',
    socials: [
      { network: 'x', href: '#' },
      { network: 'youtube', href: '#' },
      { network: 'instagram', href: '#' },
    ],
    groups: [
      {
        heading: 'Quick Links',
        links: [
          { label: 'Home', href: '#top' },
          { label: 'About', href: '#about' },
          { label: 'Menu', href: '#dishes' },
          { label: 'Gallery', href: '#dishes' },
          { label: 'Book a Table', href: '#booking-process' },
        ],
      },
      {
        heading: 'Sitemap',
        links: [
          { label: 'Privacy Policy', href: '#top' },
          { label: 'Terms of Service', href: '#top' },
        ],
      },
    ],
    contact: { heading: 'Get in Touch', email: 'hello@example.com', phone: '915-200-3142' },
  },
}
