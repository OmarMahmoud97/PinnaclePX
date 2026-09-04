import { formatHex, type Oklch, oklch, parse } from 'culori'
import { CONFIG } from '@/lib/config'
import { AppError } from '@/lib/errors'
import { inGamut, type OklchSet, solvePairs } from '@/lib/tokens/contrast'
import { type ContrastPair, type Scheme, TOKEN_NAMES, type TokenSet } from '@/lib/tokens/types'

// The colour engine. One brand hex and a scheme become the fourteen tokens a template paints
// with. The brand hue is kept everywhere; only lightness and chroma move. Surfaces are the
// scheme's near-white or near-black tinted with the hue; the brand tokens sit in fixed bands;
// then every text-on-background pair a template declares is brought to WCAG AA.

// A grey has no hue worth keeping. Its tokens stay grey, and its light stays grey too.
function isGrey(colour: Oklch): boolean {
  return colour.c < CONFIG.colour.greyChroma
}

export function parseBrand(hex: string): Oklch {
  const parsed = parse(hex.trim())
  if (parsed === undefined) throw new AppError(`Not a colour: ${hex}`)
  const colour = oklch(parsed)
  return { mode: 'oklch', l: colour.l, c: colour.c, h: colour.h ?? 0 }
}

const clamp = (value: number, [min, max]: readonly [number, number]) =>
  Math.min(max, Math.max(min, value))

export function deriveTokens(
  hex: string,
  scheme: Scheme,
  pairs: readonly ContrastPair[],
): TokenSet {
  const brand = parseBrand(hex)
  const recipe = CONFIG.colour[scheme]
  const grey = isGrey(brand)
  const h = brand.h ?? 0

  // A surface or ink: fixed lightness, a small share of the brand's chroma, capped.
  const tint = (l: number, maxC: number): Oklch =>
    inGamut({ mode: 'oklch', l, c: Math.min(brand.c * CONFIG.colour.tintShare, maxC), h })
  // The brand at a chosen lightness with its own chroma, brought into the gamut.
  const brandAt = (l: number): Oklch => inGamut({ mode: 'oklch', l, c: brand.c, h })
  // A glow: the brand hue with at least this much chroma, unless the brand is grey.
  const glow = (l: number, minC: number, hueShift: number): Oklch =>
    inGamut({
      mode: 'oklch',
      l,
      c: grey ? brand.c : Math.max(brand.c, minC),
      h: (h + hueShift) % 360,
    })

  const fill = brandAt(clamp(brand.l, recipe.fillBand))
  const hoverL =
    scheme === 'light' ? fill.l - CONFIG.colour.hoverDeltaL : fill.l + CONFIG.colour.hoverDeltaL
  const inkOnFill: Oklch = scheme === 'light' ? { mode: 'oklch', l: 1, c: 0, h } : tint(0.15, 0.03)

  const initial: OklchSet = {
    surface: tint(recipe.surface.l, recipe.surface.maxC),
    'surface-muted': tint(recipe['surface-muted'].l, recipe['surface-muted'].maxC),
    'on-surface': tint(recipe['on-surface'].l, recipe['on-surface'].maxC),
    'on-surface-muted': tint(recipe['on-surface-muted'].l, recipe['on-surface-muted'].maxC),
    border: tint(recipe.border.l, recipe.border.maxC),
    accent: tint(recipe.accent.l, recipe.accent.maxC),
    brand: brandAt(clamp(brand.l, recipe.brandBand)),
    'brand-deeper': fill,
    'brand-deepest': brandAt(hoverL),
    'on-brand': inkOnFill,
    glow: glow(recipe.glow.l, recipe.glow.minC, 0),
    'glow-secondary': glow(
      recipe.glowSecondary.l,
      recipe.glowSecondary.minC,
      CONFIG.colour.glowHueShift,
    ),
    scrim: tint(recipe.scrim.l, recipe.scrim.maxC),
    'on-scrim': { mode: 'oklch', l: 1, c: 0, h },
  }

  const solved = solvePairs(initial, pairs, CONFIG.contrast)
  return Object.fromEntries(TOKEN_NAMES.map((name) => [name, formatHex(solved[name])])) as TokenSet
}
