import { LayoutGrid, Link2, type LucideIcon, Palette, PenLine } from 'lucide-react'
import { CONFIG } from '@/lib/config'

export type WhatYouGetItem = Readonly<{ title: string; detail: string; Icon: LucideIcon }>

// What the visitor will have in five minutes, in their words. Deliverables, not product facts.
export const WHAT_YOU_GET_ITEMS: readonly WhatYouGetItem[] = [
  {
    title: 'Three designs, not one',
    detail: 'Different layouts, so you can see what suits you.',
    Icon: LayoutGrid,
  },
  {
    title: 'Your logo and your colours',
    detail:
      'On every design. We keep your colour and only adjust the lightness so text is easy to read.',
    Icon: Palette,
  },
  {
    title: 'Copy written from your answers',
    detail: 'Your services, your area, your words.',
    Icon: PenLine,
  },
  {
    title: 'A link you can share',
    detail: `Send it to a partner or a colleague. It stays live for ${String(CONFIG.retention.days)} days.`,
    Icon: Link2,
  },
]
