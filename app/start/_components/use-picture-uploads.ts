'use client'

import { type Dispatch, useEffect, useRef, useState } from 'react'
import type { BriefAction } from '@/app/start/_components/brief-reducer'
import type { SampledLogo } from '@/app/start/_components/logo-sampler'
import { UPLOAD_ERRORS } from '@/app/start/_components/start-copy'
import type { LocalImage, LocalLogo, Mark } from '@/app/start/_components/step-props'
import { trackEvent } from '@/lib/analytics/events'
import type { Answers, DraftLogo, DraftPhoto } from '@/lib/brief/schema'
import type { UploadOutcome } from '@/lib/brief/upload-client'
import { type UploadKind, withinUploadLimit } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'

// A picture as the answers hold it: its id and name, and its Blob URL once uploaded.
type PictureFile = Readonly<{ id: string; fileName: string; url: string | null }>

// The logo as the answers hold it, with what the browser read in it once it has.
type LogoFile = Extract<DraftLogo, { kind: 'file' }>

export type PictureUploads = Readonly<{
  // The pictures as the steps and the sketch show them: the browser's own object URL while the
  // file is in memory, the Blob URL after a refresh, and the state of each upload.
  logo: LocalLogo | null
  photos: readonly LocalImage[]
  // The mark question two has chosen, and whether the last logo picked could not be read, so the
  // name stands in for it.
  mark: Mark
  unreadable: boolean
  chooseMark: (mark: Mark) => void
  handleLogoFile: (file: File | null) => void
  handlePhotoFiles: (files: readonly File[]) => void
  removePhoto: (id: string) => void
  // Sends a picture that failed again.
  retry: (id: string) => void
  // Lets every picture go for a new brief, with the mark back on the name.
  reset: () => void
}>

// The pictures' bytes and their uploads, kept beside the reducer rather than in it: an object URL
// is not serialisable. Each picked file gets an object URL for showing it, keyed by the picture's
// id, and is read and downscaled in the browser (logo-sampler.ts) before it is sent, by an upload
// that reports back by the same id; what the reader found in a logo goes into the answers beside
// it, so a refresh keeps it (brief-reducer.ts). A picture never holds up Next
// (docs/start-page-journey-plan.md, D14): each shows its own progress, a failure offers "Try
// again" with the file kept for it, and the send waits for whatever is still on its way
// (brief-flow.tsx). Object URLs live until the picture is removed, the brief starts again or the
// page is left.
export function usePictureUploads(
  answers: Answers,
  dispatch: Dispatch<BriefAction>,
): PictureUploads {
  const [previews, setPreviews] = useState<Readonly<Record<string, string>>>({})
  const [failed, setFailed] = useState<readonly string[]>([])
  const [mark, setMark] = useState<Mark>(() => (answers.logo.kind === 'file' ? 'logo' : 'name'))
  const [unreadable, setUnreadable] = useState(false)
  // Every picture picked and not yet removed, with the file it is sent as once it has been read.
  // A result that lands after its picture was removed finds it gone here and changes nothing.
  const picked = useRef(new Map<string, File | null>())
  // Photos are decoded and downscaled one at a time, each sent as soon as it is ready: six phone
  // photos decoded at once can pass the memory a phone's browser allows a tab.
  const fitting = useRef<Promise<void>>(Promise.resolve())

  const held = useRef<Readonly<Record<string, string>>>({})
  useEffect(() => {
    held.current = previews
  }, [previews])
  useEffect(
    () => () => {
      for (const url of Object.values(held.current)) URL.revokeObjectURL(url)
    },
    [],
  )

  function show(id: string, file: File) {
    picked.current.set(id, null)
    setPreviews((current) => ({ ...current, [id]: URL.createObjectURL(file) }))
  }

  function forget(id: string) {
    picked.current.delete(id)
    const url = held.current[id]
    if (url !== undefined) URL.revokeObjectURL(url)
    setPreviews(({ [id]: _gone, ...rest }) => rest)
    setFailed((current) => current.filter((failedId) => failedId !== id))
  }

  // Sends a picture to Blob and records the outcome against its id. The uploader, and the Blob
  // SDK under it, is its own chunk, fetched the first time a file is sent, so a visitor who never
  // uploads never downloads it (scripts/bundle-budget.mjs).
  async function send(kind: UploadKind, id: string, file: File) {
    picked.current.set(id, file)
    let outcome: UploadOutcome
    try {
      const { uploadPicture } = await import('@/lib/brief/upload-client')
      outcome = await uploadPicture(kind, file)
    } catch {
      outcome = { ok: false, reason: 'failed' }
    }
    if (!picked.current.has(id)) return
    if (outcome.ok) {
      dispatch({ type: 'upload-done', id, url: outcome.url })
      return
    }
    setFailed((current) => [...current, id])
    trackEvent('upload_failed', { kind: kind === 'logos' ? 'logo' : 'photo' })
    dispatch({
      type: 'reject-file',
      field: kind === 'logos' ? 'logo' : 'imagery',
      message: UPLOAD_ERRORS[kind][outcome.reason],
    })
  }

  // A logo is read before it is sent. One the browser cannot draw, or that shows nothing, gives
  // way to the name; if the reader itself fails to load or to run, the file goes unread.
  async function readThenSend(id: string, file: File) {
    let sampled: SampledLogo | null | undefined
    try {
      const { sampleLogo } = await import('@/app/start/_components/logo-sampler')
      sampled = await sampleLogo(file)
    } catch {
      sampled = undefined
    }
    if (!picked.current.has(id)) return
    if (sampled === null) {
      forget(id)
      dispatch({ type: 'set-logo', value: { kind: 'wordmark' } })
      setMark('name')
      setUnreadable(true)
      return
    }
    if (sampled !== undefined) {
      const { polarity, accent } = sampled
      dispatch({ type: 'logo-read', id, polarity, accent })
    }
    await send('logos', id, sampled?.file ?? file)
  }

  function fitThenSend(id: string, file: File) {
    fitting.current = fitting.current.then(async () => {
      if (!picked.current.has(id)) return
      let fitted = file
      try {
        const { fitPhoto } = await import('@/app/start/_components/logo-sampler')
        fitted = await fitPhoto(file)
      } catch {
        // The reader did not load; the photo goes as it is.
      }
      if (picked.current.has(id)) void send('photos', id, fitted)
    })
  }

  function chooseMark(next: Mark) {
    setUnreadable(false)
    setMark(next)
    if (next === 'name' && answers.logo.kind === 'file') {
      forget(answers.logo.id)
      dispatch({ type: 'set-logo', value: { kind: 'wordmark' } })
    }
  }

  function handleLogoFile(file: File | null) {
    if (file !== null && !withinUploadLimit(file)) {
      dispatch({ type: 'reject-file', field: 'logo', message: UPLOAD_ERRORS.logos.tooBig })
      return
    }
    setUnreadable(false)
    if (answers.logo.kind === 'file') forget(answers.logo.id)
    if (file === null) {
      dispatch({ type: 'set-logo', value: { kind: 'wordmark' } })
      return
    }
    const id = crypto.randomUUID()
    setMark('logo')
    dispatch({ type: 'set-logo', value: { kind: 'file', id, fileName: file.name, url: null } })
    show(id, file)
    void readThenSend(id, file)
  }

  function handlePhotoFiles(files: readonly File[]) {
    const photos = answers.imagery.photos
    const within = files.filter(withinUploadLimit)
    const added = within.slice(0, Math.max(CONFIG.form.maxPhotos - photos.length, 0))
    if (added.length > 0) {
      const chosen = added.map((file) => ({ id: crypto.randomUUID(), file }))
      dispatch({
        type: 'set-photos',
        photos: [
          ...photos,
          ...chosen.map(({ id, file }): DraftPhoto => ({ id, fileName: file.name, url: null })),
        ],
      })
      for (const { id, file } of chosen) {
        show(id, file)
        fitThenSend(id, file)
      }
    }
    if (within.length < files.length) {
      dispatch({ type: 'reject-file', field: 'imagery', message: UPLOAD_ERRORS.photos.tooBig })
    } else if (added.length < within.length) {
      dispatch({ type: 'reject-file', field: 'imagery', message: UPLOAD_ERRORS.photos.tooMany })
    }
  }

  function removePhoto(id: string) {
    forget(id)
    dispatch({
      type: 'set-photos',
      photos: answers.imagery.photos.filter((photo) => photo.id !== id),
    })
  }

  function retry(id: string) {
    const file = picked.current.get(id)
    if (file === undefined || file === null) return
    const kind: UploadKind =
      answers.logo.kind === 'file' && answers.logo.id === id ? 'logos' : 'photos'
    setFailed((current) => current.filter((failedId) => failedId !== id))
    dispatch({ type: 'retry-file', field: kind === 'logos' ? 'logo' : 'imagery' })
    void send(kind, id, file)
  }

  // An upload still on its way when the brief starts again lands on nothing, as a removed
  // picture's does.
  function reset() {
    for (const url of Object.values(held.current)) URL.revokeObjectURL(url)
    picked.current.clear()
    setPreviews({})
    setFailed([])
    setMark('name')
    setUnreadable(false)
  }

  // A picture as a step shows it, or null when it has nowhere to be drawn from yet.
  function toLocalImage(picture: PictureFile): LocalImage | null {
    const url = previews[picture.id] ?? picture.url
    if (url === null) return null
    const status = failed.includes(picture.id)
      ? 'failed'
      : picture.url === null
        ? 'uploading'
        : 'done'
    return { id: picture.id, name: picture.fileName, url, status }
  }

  function toLocalLogo(picture: LogoFile): LocalLogo | null {
    const image = toLocalImage(picture)
    return image === null
      ? null
      : { ...image, polarity: picture.polarity ?? null, accent: picture.accent ?? null }
  }

  return {
    logo: answers.logo.kind === 'file' ? toLocalLogo(answers.logo) : null,
    photos: answers.imagery.photos.flatMap((photo) => {
      const image = toLocalImage(photo)
      return image === null ? [] : [image]
    }),
    mark,
    unreadable,
    chooseMark,
    handleLogoFile,
    handlePhotoFiles,
    removePhoto,
    retry,
    reset,
  }
}
