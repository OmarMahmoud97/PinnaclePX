import type { StaticImageData } from 'next/image'
import goWildDesktop448 from '@/app/_images/work/go-wild-desktop-448.avif'
import goWildDesktop448w from '@/app/_images/work/go-wild-desktop-448.webp'
import goWildDesktop672 from '@/app/_images/work/go-wild-desktop-672.avif'
import goWildDesktop672w from '@/app/_images/work/go-wild-desktop-672.webp'
import goWildPhone432 from '@/app/_images/work/go-wild-phone-432.avif'
import goWildPhone432w from '@/app/_images/work/go-wild-phone-432.webp'
import goWildPhone648 from '@/app/_images/work/go-wild-phone-648.avif'
import goWildPhone648w from '@/app/_images/work/go-wild-phone-648.webp'
import mvmntDesktop448 from '@/app/_images/work/mvmnt-desktop-448.avif'
import mvmntDesktop448w from '@/app/_images/work/mvmnt-desktop-448.webp'
import mvmntDesktop672 from '@/app/_images/work/mvmnt-desktop-672.avif'
import mvmntDesktop672w from '@/app/_images/work/mvmnt-desktop-672.webp'
import mvmntPhone432 from '@/app/_images/work/mvmnt-phone-432.avif'
import mvmntPhone432w from '@/app/_images/work/mvmnt-phone-432.webp'
import mvmntPhone648 from '@/app/_images/work/mvmnt-phone-648.avif'
import mvmntPhone648w from '@/app/_images/work/mvmnt-phone-648.webp'
import trvlwellDesktop448 from '@/app/_images/work/trvlwell-desktop-448.avif'
import trvlwellDesktop448w from '@/app/_images/work/trvlwell-desktop-448.webp'
import trvlwellDesktop672 from '@/app/_images/work/trvlwell-desktop-672.avif'
import trvlwellDesktop672w from '@/app/_images/work/trvlwell-desktop-672.webp'
import trvlwellPhone432 from '@/app/_images/work/trvlwell-phone-432.avif'
import trvlwellPhone432w from '@/app/_images/work/trvlwell-phone-432.webp'
import trvlwellPhone648 from '@/app/_images/work/trvlwell-phone-648.avif'
import trvlwellPhone648w from '@/app/_images/work/trvlwell-phone-648.webp'
import urunnDesktop448 from '@/app/_images/work/urunn-desktop-448.avif'
import urunnDesktop448w from '@/app/_images/work/urunn-desktop-448.webp'
import urunnDesktop672 from '@/app/_images/work/urunn-desktop-672.avif'
import urunnDesktop672w from '@/app/_images/work/urunn-desktop-672.webp'
import urunnPhone432 from '@/app/_images/work/urunn-phone-432.avif'
import urunnPhone432w from '@/app/_images/work/urunn-phone-432.webp'
import urunnPhone648 from '@/app/_images/work/urunn-phone-648.avif'
import urunnPhone648w from '@/app/_images/work/urunn-phone-648.webp'
import vetpresDesktop448 from '@/app/_images/work/vetpres-desktop-448.avif'
import vetpresDesktop448w from '@/app/_images/work/vetpres-desktop-448.webp'
import vetpresDesktop672 from '@/app/_images/work/vetpres-desktop-672.avif'
import vetpresDesktop672w from '@/app/_images/work/vetpres-desktop-672.webp'
import vetpresPhone432 from '@/app/_images/work/vetpres-phone-432.avif'
import vetpresPhone432w from '@/app/_images/work/vetpres-phone-432.webp'
import vetpresPhone648 from '@/app/_images/work/vetpres-phone-648.avif'
import vetpresPhone648w from '@/app/_images/work/vetpres-phone-648.webp'
import withuDesktop448 from '@/app/_images/work/withu-desktop-448.avif'
import withuDesktop448w from '@/app/_images/work/withu-desktop-448.webp'
import withuDesktop672 from '@/app/_images/work/withu-desktop-672.avif'
import withuDesktop672w from '@/app/_images/work/withu-desktop-672.webp'
import withuPhone432 from '@/app/_images/work/withu-phone-432.avif'
import withuPhone432w from '@/app/_images/work/withu-phone-432.webp'
import withuPhone648 from '@/app/_images/work/withu-phone-648.avif'
import withuPhone648w from '@/app/_images/work/withu-phone-648.webp'

// The first screen of each client site on a phone (2x and 3x of the 216 px frame) and on a desktop
// (2x and 3x of the 224 px browser frame), captured by scripts/capture-work.mjs as AVIF with a
// WebP fallback. Static imports so width, height and the build's hashing come for free and no
// client script is needed. Alt text describes what is in the picture, not what the caption says.
export type WorkPicture = Readonly<{
  avif: readonly [StaticImageData, StaticImageData]
  webp: readonly [StaticImageData, StaticImageData]
  alt: string
}>

export type WorkImage = Readonly<{ phone: WorkPicture; desktop: WorkPicture }>

export const WORK_IMAGES: Readonly<Record<string, WorkImage>> = {
  'go-wild': {
    phone: {
      avif: [goWildPhone432, goWildPhone648],
      webp: [goWildPhone432w, goWildPhone648w],
      alt: 'Go Wild Dog Walking on a phone: the headline Happy Pets Happy Owners and a green Book a chat button.',
    },
    desktop: {
      avif: [goWildDesktop448, goWildDesktop672],
      webp: [goWildDesktop448w, goWildDesktop672w],
      alt: 'Go Wild Dog Walking on a desktop: the headline Happy Pets Happy Owners beside four dogs in coats on grass.',
    },
  },
  vetpres: {
    phone: {
      avif: [vetpresPhone432, vetpresPhone648],
      webp: [vetpresPhone432w, vetpresPhone648w],
      alt: 'VetPres on a phone: two vets holding a terrier, the words VetCare, Streamlined and a teal headline.',
    },
    desktop: {
      avif: [vetpresDesktop448, vetpresDesktop672],
      webp: [vetpresDesktop448w, vetpresDesktop672w],
      alt: 'VetPres on a desktop: two vets holding a terrier beside a teal headline and a Join the waitlist button.',
    },
  },
  trvlwell: {
    phone: {
      avif: [trvlwellPhone432, trvlwellPhone648],
      webp: [trvlwellPhone432w, trvlwellPhone648w],
      alt: 'TrvlWell on a phone: a blue sky, the headline Helping frequent flyers feel their best and a mint button.',
    },
    desktop: {
      avif: [trvlwellDesktop448, trvlwellDesktop672],
      webp: [trvlwellDesktop448w, trvlwellDesktop672w],
      alt: 'TrvlWell on a desktop: the headline Helping frequent flyers feel their best beside two app screens.',
    },
  },
  withu: {
    phone: {
      avif: [withuPhone432, withuPhone648],
      webp: [withuPhone432w, withuPhone648w],
      alt: 'WithU on a phone: three app screens, the headline Smarter training, real results, and a purple button.',
    },
    desktop: {
      avif: [withuDesktop448, withuDesktop672],
      webp: [withuDesktop448w, withuDesktop672w],
      alt: 'WithU on a desktop: five app screens above the headline Smarter training, real results.',
    },
  },
  mvmnt: {
    phone: {
      avif: [mvmntPhone432, mvmntPhone648],
      webp: [mvmntPhone432w, mvmntPhone648w],
      alt: 'Mvmnt on a phone: a person lifting a dumbbell, the headline Outdo yourself and an orange Start today button.',
    },
    desktop: {
      avif: [mvmntDesktop448, mvmntDesktop672],
      webp: [mvmntDesktop448w, mvmntDesktop672w],
      alt: 'Mvmnt on a desktop: a close-up of a face beside the headline Outdo yourself and an orange button.',
    },
  },
  urunn: {
    phone: {
      avif: [urunnPhone432, urunnPhone648],
      webp: [urunnPhone432w, urunnPhone648w],
      alt: 'URUNN on a phone: a runner on a bridge, the headline Your running revolution and a lime Get started button.',
    },
    desktop: {
      avif: [urunnDesktop448, urunnDesktop672],
      webp: [urunnDesktop448w, urunnDesktop672w],
      alt: 'URUNN on a desktop: a runner crossing a bridge behind the headline Your running revolution.',
    },
  },
}
