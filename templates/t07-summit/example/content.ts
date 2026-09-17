import type { SummitContent, SummitImage } from '../copy-slots'
import article1 from './article-1.png'
import article2 from './article-2.png'
import article3 from './article-3.png'
import cta from './cta.png'
import doctors from './doctors.png'
import facility1 from './facility-1.png'
import facility2 from './facility-2.png'
import facility3 from './facility-3.png'
import facility4 from './facility-4.png'
import heroBg from './hero-bg.png'
import service1 from './service-1.png'
import service2 from './service-2.png'
import service3 from './service-3.png'
import service4 from './service-4.png'
import service5 from './service-5.png'
import service6 from './service-6.png'
import patientTwo from './unsplash-1438761681033.jpg'
import patientThree from './unsplash-1522075469751.jpg'
import patientFour from './unsplash-1527980965255.jpg'
import patientOne from './unsplash-1633332755192.jpg'

// Kestrel, the invented brand of the other examples, in Summit's slots, block for block as the
// source's example content runs: the same pictures the source ships (its photographs from its
// build and the placeholder portraits it loads from Unsplash) and the optional pieces filled,
// so the layout can be reviewed whole against its source.
//
// Every word here is a slot the copy stage fills; the layout is designed for the ranges in
// copy-slots.ts, which this content sits inside.

type StaticImage = Readonly<{ src: string; width: number; height: number }>

function picture(file: StaticImage, alt: string): SummitImage {
  return { src: file.src, alt, width: file.width, height: file.height, credit: null }
}

const BOOK = { label: 'Book Appointment', href: '#booking-process' } as const

const SERVICES = [
  [
    service1,
    'Primary Care',
    'Complete Primary Care for You & Your Family',
    'Receive personalized healthcare from experienced physicians focused on prevention, early diagnosis and long-term wellness.',
    [
      'Preventive health checkups',
      'Annual wellness examinations',
      'Chronic disease management',
      'Vaccination & immunization',
      'Personalized treatment plans',
    ],
  ],
  [
    service2,
    'Cardiology',
    'Advanced Cardiac Care for a Healthy Heart',
    'Our heart specialists offer state-of-the-art diagnostic testing, preventive cardiology and advanced treatments for cardiovascular conditions.',
    [
      'Electrocardiogram (ECG/EKG)',
      'Echocardiography (Heart Ultrasound)',
      'Hypertension & cholesterol control',
      'Heart failure management',
      'Interventional cardiology',
    ],
  ],
  [
    service3,
    'Neurology',
    'Advanced Brain Care for Neurological Health',
    'Expert neurologists provide advanced diagnosis and treatments for stroke, epilepsy, migraines, neuropathies and memory disorders.',
    [
      'Neurological evaluations',
      'EEG & nerve conduction studies',
      'Migraine & headache therapies',
      'Stroke rehabilitation support',
      'Epilepsy & seizure management',
    ],
  ],
  [
    service4,
    'Orthopedics',
    'Expert Treatment for Bones, Joints & Muscles',
    'From sports injuries to joint replacement, our orthopedic team helps you regain mobility, reduce pain and get back to your active life.',
    [
      'Joint replacement surgeries',
      'Sports medicine & injury care',
      'Arthritis management plans',
      'Physical therapy coordination',
      'Fracture & trauma treatment',
    ],
  ],
  [
    service5,
    'Pediatrics',
    'Compassionate Care for Growing Children',
    'Our compassionate pediatricians provide comprehensive care from newborn checkups to adolescent health management in a friendly environment.',
    [
      'Well-child checkups & growth tracking',
      'Childhood immunizations',
      'Pediatric illness management',
      'Developmental screenings',
      'Nutritional & behavioral guidance',
    ],
  ],
  [
    service6,
    'Emergency Care',
    'Immediate Emergency Care',
    'Our emergency department operates 24/7 with board-certified trauma physicians to handle critical health emergencies.',
    [
      '24/7 emergency department',
      'Trauma & critical care units',
      'Cardiac emergency response',
      'On-site advanced diagnostics',
      'Ambulance service coordination',
    ],
  ],
] as const

export const KESTREL_SUMMIT: SummitContent = {
  brand: { name: 'Kestrel', legalName: 'Kestrel', logo: { kind: 'wordmark' } },
  nav: {
    links: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#why-choose-us' },
      { label: 'Services', href: '#our-services' },
      { label: 'Facilities', href: '#facilities' },
    ],
    cta: BOOK,
  },
  hero: {
    badge: { tag: 'Trusted', text: '24/7 Emergency & Expert Care' },
    headline: 'Advanced Healthcare for Every Generation.',
    subhead:
      "Delivering exceptional healthcare through innovation, expert physicians and world-class facilities tailored to every patient's needs.",
    primary: BOOK,
    secondary: { label: 'Explore Services', href: '#our-services' },
    proof: {
      avatars: [
        picture(patientOne, 'Patient'),
        picture(patientTwo, 'Patient'),
        picture(patientThree, 'Patient'),
        picture(patientFour, 'Patient'),
      ],
      line: '4.9/5 Rating by 20,000+ Patients',
    },
    background: picture(heroBg, 'A soft pale room'),
  },
  why: {
    eyebrow: 'Why Choose Us',
    heading: 'Why Patients Choose Kestrel',
    cards: [
      {
        title: 'Experienced Specialists',
        body: 'Our board-certified doctors provide expert diagnosis and personalized treatment across multiple medical specialties.',
      },
      {
        title: 'Patient-First Approach',
        body: 'Every treatment plan is designed around your unique health needs, comfort, and long-term well-being.',
      },
      {
        title: 'Modern Medical Facilities',
        body: 'State-of-the-art equipment, advanced diagnostic tools, and modern patient spaces ensure exceptional care.',
      },
      {
        title: '24/7 Emergency Care',
        body: 'Emergency physicians and rapid response teams are available 24/7 whenever you need immediate care.',
      },
    ],
    image: picture(doctors, 'Kestrel doctors'),
  },
  services: {
    eyebrow: 'Our Medical Services',
    heading: 'Healthcare Services for Every Need',
    items: SERVICES.map(([file, tag, title, body, checklist]) => ({
      tag,
      title,
      body,
      checklist,
      image: picture(file, title),
    })),
  },
  steps: {
    eyebrow: 'How It Works',
    heading: 'Book Your Appointment in Three Simple Steps',
    body: 'Schedule your visit with ease. From choosing the right specialist to receiving personalized care, we make every step simple and convenient.',
    items: [
      {
        title: 'Choose a Doctor',
        body: 'Browse our experienced specialists and select the doctor that best fits your healthcare needs.',
      },
      {
        title: 'Select Date & Time',
        body: 'Pick your preferred appointment date and time from the available schedule.',
      },
      {
        title: 'Confirm Appointment',
        body: 'Review your booking details and receive instant confirmation with appointment information.',
      },
      {
        title: 'Receive Quality Care',
        body: 'Meet our specialists and receive personalized treatment in a comfortable, modern environment.',
      },
    ],
  },
  facilities: {
    eyebrow: 'Facilities & Technology',
    heading: 'Advanced Facilities for Exceptional Patient Care',
    items: [
      {
        title: 'Modern Diagnostic Laboratory',
        body: 'Fast and accurate laboratory testing with advanced equipment for reliable results and daily diagnostics.',
        image: picture(facility1, 'Modern Diagnostic Laboratory'),
      },
      {
        title: 'Advanced Imaging Center',
        body: 'High-resolution MRI, CT scans, ultrasound and digital X-ray services for precise medical diagnosis.',
        image: picture(facility2, 'Advanced Imaging Center'),
      },
      {
        title: 'Smart Operating Theatres',
        body: 'Fully-equipped surgical suites with advanced technology to support safe and successful procedures.',
        image: picture(facility3, 'Smart Operating Theatres'),
      },
      {
        title: 'Critical Care & ICU',
        body: '24/7 intensive care units with continuous monitoring and expert medical support for critical patients.',
        image: picture(facility4, 'Critical Care & ICU'),
      },
    ],
    link: { label: 'Explore Now', href: '#book-appointment' },
  },
  faq: {
    eyebrow: 'FAQs',
    heading: 'Frequently Asked Questions',
    items: [
      {
        question: 'How do I book an appointment?',
        answer:
          "Booking an appointment is simple! Click the 'Book Appointment' button, select your desired date and time, choose the specialist you wish to see and fill in your details. You'll receive an instant confirmation.",
      },
      {
        question: 'Do you provide 24/7 emergency services?',
        answer:
          'Yes, our emergency department is open 24/7, 365 days a year. We are fully equipped with trauma rooms, advanced imaging and on-call specialists to handle any critical medical situations immediately.',
      },
      {
        question: 'Can I choose my preferred doctor?',
        answer:
          'Absolutely. When scheduling your appointment, you can browse our directory of experienced specialists and choose the physician who best fits your medical needs, subject to their availability.',
      },
      {
        question: 'Do you accept health insurance?',
        answer:
          'Yes, we accept a wide range of national and international health insurance plans. Please contact our billing office or check our list of insurance partners to confirm your specific coverage details.',
      },
      {
        question: 'How can I access my medical reports?',
        answer:
          'You can securely access your medical records, lab reports and imaging results through our online Patient Portal, or you can request physical copies from our medical records department.',
      },
    ],
  },
  articles: {
    eyebrow: 'Health Articles',
    heading: 'Latest Health Insights & Articles',
    link: { label: 'View all articles', href: '#articles' },
    posts: [
      {
        image: picture(article1, '7 Everyday Habits for a Healthy Heart and Better Living'),
        author: 'Dr. Sarah Johnson',
        readTime: '5 mins read',
        title: '7 Everyday Habits for a Healthy Heart and Better Living',
      },
      {
        image: picture(article2, 'How Preventive Health Checkups can save lives'),
        author: 'Dr. Michael Lee',
        readTime: '4 mins read',
        title: 'How Preventive Health Checkups can save lives',
      },
      {
        image: picture(article3, 'Simple Nutrition Tips for a Stronger Immune System'),
        author: 'Dr. Emily Carter',
        readTime: '5 mins read',
        title: 'Simple Nutrition Tips for a Stronger Immune System',
      },
    ],
  },
  booking: {
    eyebrow: 'Book an Appointment',
    heading: 'Take the First Step Toward Better Health',
    form: {
      name: { label: 'Your name', placeholder: 'Enter your full name here' },
      email: { label: 'Email address', placeholder: 'Enter your email' },
      phone: { label: 'Phone number', placeholder: 'Enter your phone number' },
      doctor: {
        label: 'Preferred doctor',
        placeholder: 'Select a doctor',
        options: [
          'Dr. Sarah Johnson (Cardiology)',
          'Dr. Michael Lee (General Medicine)',
          'Dr. Emily Carter (Nutrition & Dietetics)',
        ],
      },
      department: {
        label: 'Medical department',
        placeholder: 'Select a department',
        options: ['Cardiology', 'General Medicine', 'Nutrition & Dietetics'],
      },
      date: { label: 'Date & time' },
      button: 'Book Appointment',
      sendTo: 'hello@example.com',
    },
  },
  cta: {
    heading: 'Ready to prioritize your health?',
    body: 'Schedule your appointment today and receive trusted care from experienced medical professionals.',
    button: { label: 'Book Appointment', href: '#book-appointment' },
    image: picture(cta, 'Ready to prioritize your health?'),
  },
  footer: {
    description:
      'Delivering compassionate healthcare with experienced specialists, advanced technology and patient-centered care every day.',
    columns: [
      {
        heading: 'Essentials',
        links: [
          { label: 'Home', href: '#home' },
          { label: 'About', href: '#why-choose-us' },
          { label: 'Services', href: '#our-services' },
          { label: 'Facilities', href: '#facilities' },
          { label: 'Book Appointment', href: '#booking-process' },
        ],
      },
      {
        heading: 'Our Services',
        links: [
          { label: 'General Medicine', href: '#our-services' },
          { label: 'Cardiology', href: '#our-services' },
          { label: 'Orthopedics', href: '#our-services' },
          { label: 'Pediatrics', href: '#our-services' },
          { label: 'Emergency Care', href: '#our-services' },
        ],
      },
    ],
    contact: {
      heading: 'Get in Touch',
      email: 'hello@example.com',
      phone: '9117-100-41502',
      address: 'San Francisco, USA',
    },
    smallLinks: [
      { label: 'Privacy Policy', href: '#top' },
      { label: 'Terms of Service', href: '#top' },
      { label: 'About Us', href: '#why-choose-us' },
      { label: 'Support', href: '#faq' },
    ],
  },
}
