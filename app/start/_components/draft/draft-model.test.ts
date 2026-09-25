import { clampChroma, type Oklch, oklch, parse, type Rgb, rgb, wcagContrast } from 'culori'
import { describe, expect, it } from 'vitest'
import { DRAFT_NOTES, photosNote } from '@/app/start/_components/draft-copy'
import {
  artNote,
  bandHueOf,
  draftColours,
  type DraftExtras,
  type DraftModel,
  draftModelFrom,
  headlineOf,
  isGreyHex,
  NO_EXTRAS,
  notesOf,
  whisperOf,
} from '@/app/start/_components/draft/draft-model'
import { BLANK_ANSWERS } from '@/lib/brief/answers'
import { QUESTION_IDS } from '@/lib/brief/question-ids'
import type { Answers } from '@/lib/brief/schema'
import { CONFIG } from '@/lib/config'
import type { Scheme } from '@/lib/tokens/types'

// The live draft's rules (docs/start-page-journey-plan.md, 5.8 and section 10): what each stage
// shows by `reached`, the colour engine against CONFIG.colour and the sweep of awkward colours,
// the notes, the headline's sizes and the whisper.

const ANSWERS: Answers = {
  description: 'Physiotherapy clinic in Sheffield. Sports injuries and same-week appointments.',
  name: 'Dr Sam Carter',
  company: 'Ashgrove Physio',
  email: 'sam@ashgrove.example',
  logo: { kind: 'wordmark' },
  imagery: { style: 'warm', photos: [] },
  colours: { kind: 'palette', paletteId: 'plum' },
}

const PICTURES: DraftExtras = {
  logo: { url: 'blob:logo', polarity: 'light-artwork' },
  photos: ['blob:one', 'blob:two'],
  preview: null,
}

// The colours the plan's sweep names (5.8): the four palettes, and the codes that broke the old
// sketch or sit at the edges, greys among them.
const SWEEP = [
  '#2f6f4e',
  '#1e3a8a',
  '#9a3d1e',
  '#6b2d5b',
  '#ffff00',
  '#ff5a1f',
  '#339906',
  '#e91e63',
  '#4e8a15',
  '#000000',
  '#ffffff',
  '#808080',
  '#fafaf0',
] as const

describe('the draft by the question reached', () => {
  it('shows the sentence alone at the first question, whatever else the answers hold', () => {
    const draft = draftModelFrom(ANSWERS, 0, PICTURES)
    expect(draft).toMatchObject({
      sentence: ANSWERS.description,
      lit: true,
      company: '',
      first: '',
      logo: null,
      style: null,
      photos: [],
      hex: null,
      finished: false,
    })
  })

  it('takes the name and the logo at the second, and the logo decides the scheme', () => {
    const draft = draftModelFrom(ANSWERS, 1, PICTURES)
    expect(draft.company).toBe('Ashgrove Physio')
    expect(draft.logo).toEqual(PICTURES.logo)
    expect(draft.style).toBeNull()
    expect(draft.scheme).toBe('dark')
    expect(draftModelFrom(ANSWERS, 1, NO_EXTRAS).scheme).toBe('light')
  })

  it('takes the look and the photos at the third, and a hovered look over the chosen one', () => {
    expect(draftModelFrom(ANSWERS, 2, PICTURES)).toMatchObject({
      style: 'warm',
      photos: PICTURES.photos,
      hex: null,
    })
    const hovered = draftModelFrom(ANSWERS, 2, {
      ...NO_EXTRAS,
      preview: { imagery: { style: 'dark', photos: [] } },
    })
    expect(hovered).toMatchObject({ style: 'dark', scheme: 'dark' })
  })

  it('takes the colour at the fourth, a hovered one marked as a preview', () => {
    expect(draftModelFrom(ANSWERS, 3, NO_EXTRAS)).toMatchObject({
      hex: '#6b2d5b',
      previewing: false,
    })
    const hovered = draftModelFrom(ANSWERS, 3, {
      ...NO_EXTRAS,
      preview: { colours: { kind: 'palette', paletteId: 'forest' } },
    })
    expect(hovered).toMatchObject({ hex: '#2f6f4e', previewing: true })
    const unfinished = { ...ANSWERS, colours: { kind: 'custom', hex: '#6b2d' } } as const
    expect(draftModelFrom(unfinished, 3, NO_EXTRAS).hex).toBeNull()
  })

  it('lights up once the sentence is long enough to brief from', () => {
    expect(draftModelFrom({ ...ANSWERS, description: 'Physio' }, 0, NO_EXTRAS).lit).toBe(false)
  })

  it('is finished at the last, signed with the first name past any title', () => {
    expect(draftModelFrom(ANSWERS, 4, NO_EXTRAS)).toMatchObject({ first: 'Sam', finished: true })
  })

  it('holds nothing blue before the colour question but the studio light', () => {
    for (const reached of [0, 1, 2]) {
      for (const scheme of ['light', 'dark'] as const) {
        const colours = Object.entries(
          draftColours({ ...draftModelFrom(ANSWERS, reached, NO_EXTRAS), scheme }),
        )
        for (const [name, value] of colours) {
          if (name.startsWith('--d-glow')) expect(value).toMatch(/^var\(--glow/)
          else expect(value, name).toMatch(/^oklch\([\d.]+ 0 0\)$/)
        }
      }
    }
  })
})

// The relative colours draftColours writes, evaluated for one hex the way the browser does: the
// channels of the hex in OKLCH, then brought into sRGB by reducing the chroma.
function resolve(value: string, hex: string): Oklch {
  const base = oklch(parse(hex))
  if (base === undefined) throw new Error(`not a colour: ${hex}`)
  const c = base.c
  const h = base.h ?? 0
  const neutral = /^oklch\(([\d.]+) 0 0\)$/.exec(value)
  const tint =
    /^oklch\(from var\(--draft-hex\) ([\d.]+) min\(calc\(c \* ([\d.]+)\), ([\d.]+)\) h\)$/.exec(
      value,
    )
  const band =
    /^oklch\(from var\(--draft-hex\) clamp\(([\d.]+), l, ([\d.]+)\) (?:c|min\(c, ([\d.]+)\)) h\)$/.exec(
      value,
    )
  let colour: Oklch
  if (neutral !== null) colour = { mode: 'oklch', l: Number(neutral[1]), c: 0, h: 0 }
  else if (tint !== null)
    colour = {
      mode: 'oklch',
      l: Number(tint[1]),
      c: Math.min(c * Number(tint[2]), Number(tint[3])),
      h,
    }
  else if (band !== null)
    colour = {
      mode: 'oklch',
      l: Math.min(Math.max(base.l, Number(band[1])), Number(band[2])),
      c: band[3] === undefined ? c : Math.min(c, Number(band[3])),
      h,
    }
  else throw new Error(`an unexpected colour: ${value}`)
  return clampChroma(colour, 'oklch')
}

// A relative colour clipped as a browser paints it: each sRGB channel held to its range, which
// is what turns a colour past the gamut into another hue.
function clipped(colour: Oklch): Rgb {
  const channels = rgb(colour)
  const held = (channel: number) => Math.min(1, Math.max(0, channel))
  return { mode: 'rgb', r: held(channels.r), g: held(channels.g), b: held(channels.b) }
}

// The hue a colour would have on screen, or where it has none.
function hueOnScreen(colour: Oklch): number {
  return oklch(clipped(colour)).h ?? 0
}

function coloursFor(hex: string, scheme: Scheme): Readonly<Record<string, string>> {
  return draftColours({ hex, grey: isGreyHex(hex), scheme }) as Readonly<Record<string, string>>
}

describe('the colour engine', () => {
  it('writes CONFIG.colour’s own recipe for each scheme', () => {
    for (const scheme of ['light', 'dark'] as const) {
      const recipe = CONFIG.colour[scheme]
      const colours = coloursFor('#2f6f4e', scheme)
      const share = String(CONFIG.colour.tintShare)
      const tint = ({ l, maxC }: { l: number; maxC: number }) =>
        `oklch(from var(--draft-hex) ${String(l)} min(calc(c * ${share}), ${String(maxC)}) h)`
      const band = ([min, max]: readonly [number, number], c = 'c') =>
        `oklch(from var(--draft-hex) clamp(${String(min)}, l, ${String(max)}) ${c} h)`
      expect(colours).toEqual({
        '--d-surface': tint(recipe.surface),
        '--d-soft': tint(recipe['surface-muted']),
        '--d-line': tint(recipe.border),
        '--d-ink': tint(recipe['on-surface']),
        '--d-muted': tint(recipe['on-surface-muted']),
        '--d-brand': band(recipe.brandBand),
        '--d-fill': band(recipe.fillBand, `min(c, ${String(CONFIG.colour.fillMaxC)})`),
        '--d-glow': `oklch(from var(--draft-hex) ${String(recipe.glow.l)} max(c, ${String(recipe.glow.minC)}) h)`,
        '--d-glow-2': `oklch(from var(--draft-hex) ${String(recipe.glowSecondary.l)} max(c, ${String(recipe.glowSecondary.minC)}) calc(h + ${String(CONFIG.colour.glowHueShift)}))`,
      })
    }
  })

  it('knows a grey by the engine’s own line, and keeps the studio’s glows for it', () => {
    for (const hex of SWEEP) {
      const chroma = oklch(parse(hex))?.c ?? 0
      expect(isGreyHex(hex), hex).toBe(chroma < CONFIG.colour.greyChroma)
    }
    expect(['#000000', '#ffffff', '#808080', '#fafaf0'].every(isGreyHex)).toBe(true)
    expect(coloursFor('#808080', 'light')['--d-glow']).toBe('var(--glow)')
  })

  it('hues the ramp’s band with a chosen colour, never before its question or for a grey', () => {
    const colours = (hex: string) =>
      ({ ...BLANK_ANSWERS, colours: { kind: 'custom', hex } }) as const
    const reached = QUESTION_IDS.indexOf('colours')
    for (const hex of SWEEP) {
      const colour = oklch(parse(hex))
      const hue = bandHueOf(colours(hex), reached)
      if (isGreyHex(hex)) expect(hue, hex).toBeNull()
      else expect(hue, hex).toBeCloseTo(colour?.h ?? Number.NaN, 1)
    }
    expect(bandHueOf(colours('#2f6f4e'), reached - 1)).toBeNull()
  })

  it('keeps the fill on its hue as a browser clips it, across the sweep', () => {
    // Yellow and cyan have less room than the cap at the band's floor and drift a degree or two;
    // uncapped, orange went to red (38 to 30 degrees) and cyan and yellow further than they do.
    const DRIFT_MAX = 3
    for (const hex of SWEEP) {
      if (isGreyHex(hex)) continue
      const base = oklch(parse(hex))
      for (const scheme of ['light', 'dark'] as const) {
        const [lo, hi] = CONFIG.colour[scheme].fillBand
        const fill: Oklch = {
          mode: 'oklch',
          l: Math.min(Math.max(base?.l ?? 0, lo), hi),
          c: Math.min(base?.c ?? 0, CONFIG.colour.fillMaxC),
          h: base?.h ?? 0,
        }
        const drift = Math.abs(hueOnScreen(fill) - (base?.h ?? 0))
        expect(Math.min(drift, 360 - drift), `${hex} ${scheme}`).toBeLessThanOrEqual(DRIFT_MAX)
      }
    }
  })

  it('keeps every text colour readable across the sweep, in both schemes', () => {
    for (const hex of SWEEP) {
      for (const scheme of ['light', 'dark'] as const) {
        const colours = coloursFor(hex, scheme)
        const at = (name: string) => resolve(colours[name] ?? '', hex)
        const surface = at('--d-surface')
        const where = `${hex} ${scheme}`
        expect(wcagContrast(at('--d-ink'), surface), where).toBeGreaterThanOrEqual(7)
        expect(wcagContrast(at('--d-muted'), surface), where).toBeGreaterThanOrEqual(4.5)
        // The fill carries the surface's colour as its words, and is the headline's colour.
        expect(wcagContrast(at('--d-fill'), surface), where).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
})

const DRAFT = draftModelFrom(ANSWERS, 4, NO_EXTRAS)

describe('the headline and the notes', () => {
  it('sets the name, the sentence or the note, smaller as it grows', () => {
    expect(headlineOf({ ...DRAFT, company: '', sentence: '' })).toBeNull()
    expect(headlineOf(DRAFT)).toEqual({ text: 'Ashgrove Physio', size: 'l' })
    expect(headlineOf({ ...DRAFT, company: '' })?.size).toBe('s')
    expect(headlineOf({ ...DRAFT, company: 'a'.repeat(60) })?.size).toBe('m')
  })

  it('shows at most two notes at once, and never drops one that stands for an answer', () => {
    const answers = [
      BLANK_ANSWERS,
      { ...BLANK_ANSWERS, description: 'A sentence' },
      ANSWERS,
      { ...ANSWERS, description: '' },
    ]
    const cases: readonly DraftModel[] = [0, 1, 2, 3, 4].flatMap((reached) =>
      answers.map((given) => draftModelFrom(given, reached, NO_EXTRAS)),
    )
    for (const draft of cases) {
      for (const faceMissing of [false, true]) {
        const notes = notesOf(draft, faceMissing)
        expect(notes.size).toBeLessThanOrEqual(2)
        expect(notes.has('headline')).toBe(headlineOf(draft) === null)
        expect(notes.has('sign')).toBe(draft.first !== '')
        if (draft.first !== '') expect(notes.has('art')).toBe(false)
      }
    }
    // The first stages: where the sentence lands, then where the name goes, beside the picture's.
    expect(notesOf(draftModelFrom(BLANK_ANSWERS, 0, NO_EXTRAS), false)).toEqual(
      new Set(['headline', 'art']),
    )
    expect(notesOf(draftModelFrom(ANSWERS, 0, NO_EXTRAS), false)).toEqual(new Set(['mark', 'art']))
    // The finished draft: the signature, and the face if it is missing; the picture's note gives
    // way to the signature, which covers it in the phone's window.
    expect(notesOf(DRAFT, true)).toEqual(new Set(['sign', 'face']))
    expect(notesOf(DRAFT, false)).toEqual(new Set(['sign']))
  })

  it('says what the picture will be until the visitor’s own photos replace it', () => {
    expect(artNote(null)).toBe(DRAFT_NOTES.photos)
    expect(artNote('warm')).toBe(photosNote('warm'))
    expect(notesOf({ ...DRAFT, photos: ['blob:one'] }, false).has('art')).toBe(false)
  })
})

describe('the whisper', () => {
  it('sets a Latin name of up to 24 graphemes, counted as they are seen', () => {
    const accented = 'Crème Brûlée Café Bakery'
    expect(whisperOf(accented)).toEqual({ text: accented, graphemes: 24 })
    expect(whisperOf("Sam's Café & Co.")?.graphemes).toBe(16)
    expect(whisperOf(`${accented}s`)).toBeNull()
    expect(whisperOf('')).toBeNull()
  })

  it('leaves out a name in a script the display faces do not carry', () => {
    expect(whisperOf('東京カフェ')).toBeNull()
    expect(whisperOf('Кафе Москва')).toBeNull()
  })

  it('counts UTF-16 units where the browser cannot count graphemes, never fewer', () => {
    // An accent written as a combining mark: one grapheme, two units.
    const combined = 'Café Noir'
    const longest = 'Crème Brûlée Café Bakery'
    expect(whisperOf(combined)?.graphemes).toBe(9)
    const { Segmenter } = Intl
    Reflect.deleteProperty(Intl, 'Segmenter')
    try {
      expect(whisperOf(combined)?.graphemes).toBe(10)
      // 24 graphemes as seen, but 28 units, so it cannot be known to fit.
      expect(whisperOf(longest)).toBeNull()
    } finally {
      Object.defineProperty(Intl, 'Segmenter', {
        value: Segmenter,
        writable: true,
        configurable: true,
      })
    }
    expect(whisperOf(longest)?.graphemes).toBe(24)
  })
})
