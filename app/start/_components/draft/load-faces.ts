'use client'

import { useEffect, useState } from 'react'
import type { VisualStyle } from '@/lib/brief/styles'
import { CONFIG } from '@/lib/config'
import { whenIdle } from '@/lib/motion/idle'

// The face each look's designs are set in, by name, for the note the draft shows when the face
// itself cannot be had (draft-copy.ts, faceNote). draft-faces.ts declares the same four.
export const FACE_NAMES: Readonly<Record<VisualStyle, string>> = {
  warm: 'Fraunces',
  minimal: 'Manrope',
  bold: 'Bricolage Grotesque',
  dark: 'Sora',
}

let facesModule: Promise<Readonly<Record<VisualStyle, string>>> | undefined
const loads = new Map<VisualStyle, Promise<string | null>>()

// The faces' module, fetched once by a plain import() (never next/dynamic, whose fonts would
// ride the first scripts). Its @font-face rules come with it; no file is fetched until asked for.
function fetchFaces() {
  facesModule ??= import('@/app/start/_components/draft/draft-faces').then(({ FACES }) => FACES)
  return facesModule
}

// Whether the visitor has asked the browser to save data, where it says.
function savingData(): boolean {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } }
  return connection?.saveData === true
}

// A face's file, loaded: next/font's family list, once the face it names first has loaded, or
// null. Only that first face is asked for. The list goes on to a fallback drawn from a local
// font (Arial or Times New Roman), and a load that names a local font the device lacks, as
// Android, most Linux and ChromeOS lack these, fails although the face itself arrived.
export async function loadFamily(
  family: string,
  fonts: Pick<FontFaceSet, 'load'>,
): Promise<string | null> {
  const [face = family] = family.split(',')
  const loaded = await fonts.load(`1em ${face}`)
  return loaded.length > 0 ? family : null
}

async function fetchAndLoad(style: VisualStyle): Promise<string | null> {
  try {
    return await loadFamily((await fetchFaces())[style], document.fonts)
  } catch {
    return null
  }
}

// A look's face, loaded: its family once the file is in, or null when it fails, does not arrive
// within CONFIG.start.fonts.timeoutMs, or the visitor is saving data. Asked once per look.
function loadFace(style: VisualStyle): Promise<string | null> {
  let load = loads.get(style)
  if (load === undefined) {
    load = savingData()
      ? Promise.resolve(null)
      : Promise.race([
          fetchAndLoad(style),
          new Promise<null>((resolve) => {
            window.setTimeout(resolve, CONFIG.start.fonts.timeoutMs, null)
          }),
        ])
    loads.set(style, load)
  }
  return load
}

export type Face = Readonly<{
  // The face to set, once loaded; until then, and for good if it never comes, Mona Sans stays.
  family: string | null
  // The face will not come, so the draft says which one the designs use instead.
  missing: boolean
}>

// The display face for the look the draft shows (docs/start-page-journey-plan.md, 5.8): the
// faces' module is fetched while the browser is idle once `soon` (the name question), the shown
// look's face on arrival at the look question, and each other look's the first time it is
// previewed. The draft swaps only once a face has loaded, so nothing waits on it. Reduced motion
// changes nothing here: a face is information, and it swaps by opacity (start-draft.css).
export function useFace(style: VisualStyle | null, soon: boolean): Face {
  const [settled, setSettled] = useState<Readonly<Partial<Record<VisualStyle, string | null>>>>({})

  useEffect(() => {
    if (!soon) return
    return whenIdle(() => {
      fetchFaces().catch(() => undefined)
    })
  }, [soon])

  useEffect(() => {
    if (style === null) return
    void loadFace(style).then((family) => {
      setSettled((current) => ({ ...current, [style]: family }))
    })
  }, [style])

  const family = style === null ? undefined : settled[style]
  return { family: family ?? null, missing: family === null }
}
