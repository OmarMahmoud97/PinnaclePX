import type { StaticImageData } from 'next/image'
import manifest from '@/app/_images/work/manifest.json'
import goWildDesktop448w from '@/app/_images/work/go-wild-desktop-448.webp'
import goWildDesktop672w from '@/app/_images/work/go-wild-desktop-672.webp'
import goWildPhone432w from '@/app/_images/work/go-wild-phone-432.webp'
import goWildPhone648w from '@/app/_images/work/go-wild-phone-648.webp'
import mvmntDesktop448w from '@/app/_images/work/mvmnt-desktop-448.webp'
import mvmntDesktop672w from '@/app/_images/work/mvmnt-desktop-672.webp'
import mvmntPhone432w from '@/app/_images/work/mvmnt-phone-432.webp'
import mvmntPhone648w from '@/app/_images/work/mvmnt-phone-648.webp'
import trvlwellDesktop448w from '@/app/_images/work/trvlwell-desktop-448.webp'
import trvlwellDesktop672w from '@/app/_images/work/trvlwell-desktop-672.webp'
import trvlwellPhone432w from '@/app/_images/work/trvlwell-phone-432.webp'
import trvlwellPhone648w from '@/app/_images/work/trvlwell-phone-648.webp'
import urunnDesktop448w from '@/app/_images/work/urunn-desktop-448.webp'
import urunnDesktop672w from '@/app/_images/work/urunn-desktop-672.webp'
import urunnPhone432w from '@/app/_images/work/urunn-phone-432.webp'
import urunnPhone648w from '@/app/_images/work/urunn-phone-648.webp'
import vetpresDesktop448w from '@/app/_images/work/vetpres-desktop-448.webp'
import vetpresDesktop672w from '@/app/_images/work/vetpres-desktop-672.webp'
import vetpresPhone432w from '@/app/_images/work/vetpres-phone-432.webp'
import vetpresPhone648w from '@/app/_images/work/vetpres-phone-648.webp'
import withuDesktop448w from '@/app/_images/work/withu-desktop-448.webp'
import withuDesktop672w from '@/app/_images/work/withu-desktop-672.webp'
import withuPhone432w from '@/app/_images/work/withu-phone-432.webp'
import withuPhone648w from '@/app/_images/work/withu-phone-648.webp'

// The first screen of each client site on a phone (2x and 3x of the 216 px frame) and on a desktop
// (2x and 3x of the 224 px browser frame), captured by scripts/capture-work.mjs as AVIF with a
// WebP fallback. The WebP files are static imports, so width, height and the build's hashing come
// for free and no client script is needed. The AVIF files live in public/work/ and are served as
// they are: Turbopack's static-image loader cannot decode AVIF and warns on every import, so they
// go round it, addressed by the name the capture script writes and versioned by the manifest's
// date so a re-capture busts the cache (next.config.ts marks them immutable). Alt text describes
// what is in the picture, not what the caption says.
export type WorkPicture = Readonly<{
  avif: readonly [string, string]
  webp: readonly [StaticImageData, StaticImageData]
  alt: string
}>

export type WorkImage = Readonly<{ phone: WorkPicture; desktop: WorkPicture }>

type View = 'phone' | 'desktop'
type Captured = Readonly<Record<View, Omit<WorkPicture, 'avif'>>>

// The two widths each view is written at, 2x and 3x of its frame; the capture script's VIEWS.
const WIDTHS: Readonly<Record<View, readonly [number, number]>> = {
  phone: [432, 648],
  desktop: [448, 672],
}

function withAvif(slug: string, view: View, picture: Omit<WorkPicture, 'avif'>): WorkPicture {
  const url = (width: number) =>
    `/work/${slug}-${view}-${String(width)}.avif?v=${manifest.capturedAt}`
  const [w2, w3] = WIDTHS[view]
  return { ...picture, avif: [url(w2), url(w3)] }
}

const CAPTURED: Readonly<Record<string, Captured>> = {
  'go-wild': {
    phone: {
      webp: [goWildPhone432w, goWildPhone648w],
      alt: 'Go Wild Dog Walking on a phone: the headline Happy Pets Happy Owners and a green Book a chat button.',
    },
    desktop: {
      webp: [goWildDesktop448w, goWildDesktop672w],
      alt: 'Go Wild Dog Walking on a desktop: the headline Happy Pets Happy Owners beside four dogs in coats on grass.',
    },
  },
  vetpres: {
    phone: {
      webp: [vetpresPhone432w, vetpresPhone648w],
      alt: 'VetPres on a phone: two vets holding a terrier, the words VetCare, Streamlined and a teal headline.',
    },
    desktop: {
      webp: [vetpresDesktop448w, vetpresDesktop672w],
      alt: 'VetPres on a desktop: two vets holding a terrier beside a teal headline and a Join the waitlist button.',
    },
  },
  trvlwell: {
    phone: {
      webp: [trvlwellPhone432w, trvlwellPhone648w],
      alt: 'TrvlWell on a phone: a blue sky, the headline Helping frequent flyers feel their best and a mint button.',
    },
    desktop: {
      webp: [trvlwellDesktop448w, trvlwellDesktop672w],
      alt: 'TrvlWell on a desktop: the headline Helping frequent flyers feel their best beside two app screens.',
    },
  },
  withu: {
    phone: {
      webp: [withuPhone432w, withuPhone648w],
      alt: 'WithU on a phone: three app screens, the headline Smarter training, real results, and a purple button.',
    },
    desktop: {
      webp: [withuDesktop448w, withuDesktop672w],
      alt: 'WithU on a desktop: five app screens above the headline Smarter training, real results.',
    },
  },
  mvmnt: {
    phone: {
      webp: [mvmntPhone432w, mvmntPhone648w],
      alt: 'Mvmnt on a phone: a person lifting a dumbbell, the headline Outdo yourself and an orange Start today button.',
    },
    desktop: {
      webp: [mvmntDesktop448w, mvmntDesktop672w],
      alt: 'Mvmnt on a desktop: a close-up of a face beside the headline Outdo yourself and an orange button.',
    },
  },
  urunn: {
    phone: {
      webp: [urunnPhone432w, urunnPhone648w],
      alt: 'URUNN on a phone: a runner on a bridge, the headline Your running revolution and a lime Get started button.',
    },
    desktop: {
      webp: [urunnDesktop448w, urunnDesktop672w],
      alt: 'URUNN on a desktop: a runner crossing a bridge behind the headline Your running revolution.',
    },
  },
}

export const WORK_IMAGES: Readonly<Record<string, WorkImage>> = Object.fromEntries(
  Object.entries(CAPTURED).map(([slug, views]) => [
    slug,
    {
      phone: withAvif(slug, 'phone', views.phone),
      desktop: withAvif(slug, 'desktop', views.desktop),
    },
  ]),
)
