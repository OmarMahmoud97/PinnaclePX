import type { AtlasContent, AtlasImage } from '../copy-slots'
import tools from './img/advanced-trading-tools.webp'
import buyAndTrade from './img/buy-and-trade.webp'
import eng from './img/country-icon/eng.png'
import twoShare from './img/crypto-icon/2share.png'
import bitcoinAsia from './img/crypto-icon/bitcoin-asia.png'
import bitcoin from './img/crypto-icon/bitcoin.png'
import dogecoin from './img/crypto-icon/dogecoin.png'
import ethereum from './img/crypto-icon/ethereum.png'
import frog from './img/crypto-icon/frog.png'
import metacraft from './img/crypto-icon/metacraft.png'
import moonrock from './img/crypto-icon/moonrock.png'
import muskDoge from './img/crypto-icon/musk-doge.png'
import ninjafloki from './img/crypto-icon/ninjafloki.png'
import pappay from './img/crypto-icon/pappay.png'
import solana from './img/crypto-icon/solana.png'
import faq from './img/faq.webp'
import buyCrypto from './img/getting-started/buy-crypto.png'
import fund from './img/getting-started/fund.png'
import signUp from './img/getting-started/sign-up.png'
import hero from './img/hero-image.webp'
import security from './img/industry-leading-security.webp'
import creditCard from './img/nefa-cc.webp'
import clever from './img/partner/clever.png'
import diamonCutts from './img/partner/diamon-cutts.png'
import gambio from './img/partner/gambio.png'
import swissFinance from './img/partner/swiss-finance.png'

// Kestrel, the invented job-scheduling product from the Aurora example, in Atlas's slots,
// section for section as the source's page runs: the same pictures the source ships (its
// illustrations, coin icons, partner logos and step drawings from the repository) and the
// optional parts filled, so the layout can be reviewed whole.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): AtlasImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

const CTA = { label: 'Get Started', href: '#start' } as const

export const KESTREL_ATLAS: AtlasContent = {
  brand: { name: 'Kestrel', legalName: 'Kestrel Software Ltd', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'Cryptocurrency', href: '#start' },
      { label: 'Exchanges', href: '#offer' },
      { label: 'Watchlist', href: '#tools' },
      { label: 'NFT', href: '#why' },
      { label: 'Portfolio', href: '#faq' },
    ],
    menu: {
      label: 'Products',
      items: [
        { label: 'Exchange', href: '#start' },
        { label: 'Wallet', href: '#offer' },
        { label: 'Explorer', href: '#tools' },
        { label: 'Charts', href: '#why' },
      ],
    },
    secondary: { label: 'Login', href: '#how-it-works' },
    cta: { label: 'Sign Up', href: '#start' },
  },
  hero: {
    eyebrow: 'Sign Up Today',
    headline: { text: "The World's Fastest Growing Crypto Web App", emphasis: 'Fastest Growing' },
    subhead:
      'Buy and sell 200+ cryptocurrencies with 20+ flat currencies using bank transfers or your credit/debit card.',
    primary: CTA,
    secondary: { label: 'Download App', href: '#how-it-works' },
    image: picture(hero, 'A phone showing a crypto wallet beside floating coins'),
  },
  market: {
    groups: [
      {
        title: '🔥 Trending',
        rows: [
          {
            name: 'Bitcoin',
            price: '$43180.13',
            up: true,
            data: [40, 35, 60, 75, 60, 75, 50],
            icon: picture(bitcoin, ''),
          },
          {
            name: 'Ethereum',
            price: '$3480.65',
            up: false,
            data: [25, 30, 60, 50, 80, 55, 80],
            icon: picture(ethereum, ''),
          },
          {
            name: 'Solana',
            price: '$150.2',
            up: true,
            data: [40, 45, 40, 80, 50, 60, 35],
            icon: picture(solana, ''),
          },
          {
            name: 'Dogecoin',
            price: '$0.1572',
            up: true,
            data: [35, 70, 60, 80, 50, 60, 40],
            icon: picture(dogecoin, ''),
          },
        ],
      },
      {
        title: '🚀 Top Gainers',
        rows: [
          {
            name: 'PAPPAY',
            price: '$0.00374',
            up: true,
            data: [30, 50, 45, 60, 70, 40, 45],
            icon: picture(pappay, ''),
          },
          {
            name: 'Bitcoin Asia',
            price: '$0.02096',
            up: true,
            data: [25, 60, 50, 60, 35, 50, 70],
            icon: picture(bitcoinAsia, ''),
          },
          {
            name: 'MoonRock',
            price: '$0.004907',
            up: true,
            data: [40, 35, 40, 25, 50, 70, 45],
            icon: picture(moonrock, ''),
          },
          {
            name: 'NinjaFloki',
            price: '$0.000123',
            up: true,
            data: [45, 35, 40, 30, 25, 45, 35],
            icon: picture(ninjafloki, ''),
          },
        ],
      },
      {
        title: '💎 Recently Added',
        rows: [
          {
            name: 'MetaCraft',
            price: '$0.0608',
            up: false,
            data: [40, 50, 45, 60, 35, 40, 45],
            icon: picture(metacraft, ''),
          },
          {
            name: 'Frog',
            price: '$0.5875',
            up: false,
            data: [25, 50, 45, 48, 40, 60, 45],
            icon: picture(frog, ''),
          },
          {
            name: 'Musk Doge',
            price: '$0.04041',
            up: true,
            data: [25, 35, 60, 45, 50, 45, 45],
            icon: picture(muskDoge, ''),
          },
          {
            name: '2SHARE',
            price: '$1366.24',
            up: true,
            data: [35, 30, 60, 50, 35, 45, 40],
            icon: picture(twoShare, ''),
          },
        ],
      },
    ],
    more: 'More',
  },
  glance: {
    columns: [
      {
        title: 'Book it once',
        body: 'Drop a job on the calendar and the engineer, the customer and the invoice draft all know about it.',
      },
      {
        title: 'Quote from the van',
        body: 'Build a quote on your phone at the job, send it before you leave, and see the moment it is accepted.',
      },
      {
        title: 'Get paid without chasing',
        body: 'Invoices go out when the job is marked done, with card and bank payment built in.',
      },
    ],
    more: { label: 'More', href: '#why' },
  },
  pitch: {
    heading: { text: 'Buy & trade on the original crypto exchange.', emphasis: '' },
    lead: 'Buy now and get 40% extra bonus Minimum pre-sale amount 25 Crypto Coin. We accept BTC crypto-currency',
    exchange: {
      rows: [
        { label: 'Amount', value: '5.000', unit: 'USD', icon: picture(eng, '') },
        { label: 'Get', value: '0.10901', unit: 'BTC', icon: picture(bitcoin, '') },
      ],
      button: 'Buy Now',
    },
    label: 'Why',
    statement:
      'We built Kestrel after watching a heating firm lose a day a week to phone calls about where the vans were.',
    action: { label: 'Buy Now', href: '#start' },
    image: picture(buyAndTrade, 'A phone showing a buy and trade screen beside coins'),
  },
  partners: {
    heading: 'Trusted Partners Worldwide',
    lead: "We're partners with countless major organisations around the globe",
    logos: [
      picture(clever, 'Clever'),
      picture(diamonCutts, 'Diamon Cutts'),
      picture(swissFinance, 'Swiss Finance'),
      picture(gambio, 'Gambio'),
    ],
  },
  offer: {
    heading: { text: 'Introducing the Kestrel Credit Card', emphasis: 'Kestrel' },
    body: 'Subject to cardholder and rewards terms which will be available at application.',
    points: [
      'Up to 3% back on purchases',
      'Earn rewards in bitcoin or any crypto on Kestrel',
      'No annual fee',
    ],
    action: { label: 'Join the waitlist', href: '#start' },
    image: picture(creditCard, 'Two credit cards beside a coin'),
  },
  tools: {
    heading: { text: 'Advanced Trading Tools', emphasis: 'Tools' },
    items: [
      {
        title: 'Professional Access, Non-stop Availability',
        body: 'We provide premium access to crypto trading for both individuals and institutions through high liquidity, reliable order execution and constant uptime.',
      },
      {
        title: 'A Range of Powerful Apis',
        body: 'Set up your own trading interface or deploy your algorithmic strategy with our high-performance FIX and HTTP APIs. Connect to our WebSocket for real-time data streaming.',
      },
      {
        title: 'Customer Support',
        body: 'Premium 24/7 support available to all customers worldwide by phone or email. Dedicated account managers for partners.',
      },
    ],
    primary: CTA,
    secondary: { label: 'Learn More', href: '#how-it-works' },
    image: picture(tools, 'A laptop showing trading charts'),
  },
  why: {
    heading: 'Industry-leading security from day one',
    items: [
      {
        title: 'Safety, security and compliance',
        body: 'Kestrel is a licensed New York trust company that undergoes regular bank exams and is subject to the cybersecurity audits conducted by the New York Department of Financial Services. Learn more about our commitment to security.',
      },
      {
        title: 'Hardware security keys',
        body: 'With Kestrel you can secure your account with a hardware security key via WebAuthn.',
      },
      {
        title: 'SOC Certifications',
        body: 'Kestrel is SOC 1 Type 2 and SOC 2 Type 2 compliant. We are the world’s first cryptocurrency exchange and custodian to complete these exams.',
      },
    ],
    image: picture(security, 'A shield beside a lock and a laptop'),
  },
  steps: {
    heading: 'Get started in just a few minutes',
    items: [
      {
        title: 'Sign Up',
        body: 'Sign up for your free Kestrel Wallet on web, iOS or Android and follow our easy process to set up your profile',
        image: picture(signUp, 'A drawing of a sign-up form'),
      },
      {
        title: 'Fund',
        body: 'Choose your preferred payment method such as bank transfer or credit card to top up your Kestrel Wallet',
        image: picture(fund, 'A drawing of a wallet being topped up'),
      },
      {
        title: 'Buy Crypto',
        body: 'Buy Bitcoin or Ethereum, then securely store it in your Wallet or send it on easily to your friends anywhere',
        image: picture(buyCrypto, 'A drawing of coins being bought'),
      },
    ],
  },
  faq: {
    eyebrow: 'Support',
    heading: 'Frequently asked questions',
    items: [
      {
        question: 'Why should I choose Kestrel?',
        answer:
          "We're industry pioneers, having been in the cryptocurrency industry since 2016. We've facilitated more than 21 billion USD worth of transactions on our exchange for customers in over 40 countries. Today, we're trusted by over 8 million customers around the world and have received praise for our easy-to-use app, secure wallet, and range of features.",
      },
      {
        question: 'How secure is Kestrel?',
        answer:
          "We're industry pioneers, having been in the cryptocurrency industry since 2016. We've facilitated more than 21 billion USD worth of transactions on our exchange for customers in over 40 countries. Today, we're trusted by over million customers around the world and have received praise for our easy-to-use app, secure wallet, and range of features.",
      },
      {
        question: 'Do I have to buy a whole Bitcoin?',
        answer:
          "We're industry pioneers, having been in the cryptocurrency industry since 2016. We've facilitated more than 21 billion USD worth of transactions on our exchange for customers in over 40 countries. Today, we're trusted by over million customers around the world and have received praise for our easy-to-use app, secure wallet, and range of features.",
      },
      {
        question: 'How do I actually buy Bitcoin?',
        answer:
          "We're industry pioneers, having been in the cryptocurrency industry since 2016. We've facilitated more than 21 billion USD worth of transactions on our exchange for customers in over 40 countries. Today, we're trusted by over million customers around the world and have received praise for our easy-to-use app, secure wallet, and range of features.",
      },
    ],
    image: picture(faq, 'A person at a desk with a question mark'),
  },
  footer: {
    columns: [
      [
        { label: 'Cryptocurrency', href: '#start' },
        { label: 'Exchanges', href: '#offer' },
        { label: 'Watchlist', href: '#tools' },
        { label: 'Portfolio', href: '#why' },
        { label: 'NFT', href: '#faq' },
      ],
      [
        { label: 'Products', href: '#start' },
        { label: 'About Us', href: '#why' },
        { label: 'Careers', href: '#tools' },
        { label: 'Blog', href: '#faq' },
        { label: 'Security', href: '#why' },
      ],
      [
        { label: 'Help Center', href: '#faq' },
        { label: 'Contact Us', href: '#start' },
        { label: 'System Status', href: '#tools' },
        { label: 'Area of Avaibility', href: '#why' },
        { label: 'Privacy Policy', href: '#top' },
      ],
    ],
    newsletter: {
      title: 'Newsletter',
      body: "Never miss anything crypto when you're on the go",
      placeholder: 'Enter your email',
      email: null,
    },
    note: { title: 'Get in touch', body: 'Two weeks on us, and your data is yours if you leave.' },
    action: CTA,
  },
}
