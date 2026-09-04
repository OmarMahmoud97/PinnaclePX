'use client'

import { type Dispatch, useEffect, useRef, useState } from 'react'
import type { BriefAction } from '@/app/start/_components/brief-reducer'
import type { LocalImage } from '@/app/start/_components/step-props'
import type { Answers, DraftPhoto } from '@/lib/brief/schema'
import { type UploadKind, UPLOAD_LIMIT_LABEL, withinUploadLimit } from '@/lib/brief/uploads'
import { CONFIG } from '@/lib/config'

const UPLOAD_MESSAGE: Readonly<
  Record<UploadKind, Readonly<Record<'unsupported' | 'failed', string>>>
> = {
  logos: {
    unsupported: 'That file type is not supported. Use PNG, JPEG, SVG or WebP.',
    failed: 'That logo did not upload. Remove it and try again.',
  },
  photos: {
    unsupported: 'One of your photos is a type we cannot use. Use PNG, JPEG or WebP.',
    failed: 'One of your photos did not upload. Remove it and try again.',
  },
}

// A picture as the answers hold it: its id and name, and its Blob URL once uploaded.
type PictureFile = Readonly<{ id: string; fileName: string; url: string | null }>

export type PictureUploads = Readonly<{
  // The pictures as the steps and the sketch show them: the browser's own object URL while the
  // file is in memory, the Blob URL after a refresh, and the state of each upload.
  logo: LocalImage | null
  photos: readonly LocalImage[]
  handleLogoFile: (file: File | null) => void
  handlePhotoFiles: (files: readonly File[]) => void
  removePhoto: (id: string) => void
}>

// The pictures' bytes and their uploads, kept beside the reducer rather than in it: an object
// URL is not serialisable. Each picked file gets an object URL for showing it, keyed by the
// picture's id, and an upload that reports back by the same id. A failed upload is remembered
// so the step can say so. Object URLs live until the page is left.
export function usePictureUploads(
  answers: Answers,
  dispatch: Dispatch<BriefAction>,
): PictureUploads {
  const [previews, setPreviews] = useState<Readonly<Record<string, string>>>({})
  const [failed, setFailed] = useState<readonly string[]>([])

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

  // Starts a picture on its way to Blob and records the outcome against its id. A picture the
  // visitor has removed meanwhile is ignored by the reducer, so a late result changes nothing.
  // The uploader, and the Blob SDK under it, is its own chunk, fetched the first time a file is
  // picked, so a visitor who never uploads never downloads it (scripts/bundle-budget.mjs).
  function startUpload(kind: UploadKind, id: string, file: File) {
    const field = kind === 'logos' ? 'logo' : 'imagery'
    setPreviews((current) => ({ ...current, [id]: URL.createObjectURL(file) }))
    void import('@/lib/brief/upload-client')
      .then(({ uploadPicture }) => uploadPicture(kind, file))
      .then((outcome) => {
        if (outcome.ok) {
          dispatch({ type: 'upload-done', id, url: outcome.url })
          return
        }
        setFailed((current) => [...current, id])
        dispatch({ type: 'reject-file', field, message: UPLOAD_MESSAGE[kind][outcome.reason] })
      })
  }

  function forget(id: string) {
    const url = previews[id]
    if (url !== undefined) URL.revokeObjectURL(url)
    setPreviews(({ [id]: _gone, ...rest }) => rest)
    setFailed((current) => current.filter((failedId) => failedId !== id))
  }

  function handleLogoFile(file: File | null) {
    if (file !== null && !withinUploadLimit(file)) {
      dispatch({
        type: 'reject-file',
        field: 'logo',
        message: `That file is over ${UPLOAD_LIMIT_LABEL}. Try a smaller one.`,
      })
      return
    }
    if (answers.logo.kind === 'file') forget(answers.logo.id)
    if (file === null) {
      dispatch({ type: 'set-logo', value: { kind: 'wordmark' } })
      return
    }
    const id = crypto.randomUUID()
    dispatch({ type: 'set-logo', value: { kind: 'file', id, fileName: file.name, url: null } })
    startUpload('logos', id, file)
  }

  function handlePhotoFiles(files: readonly File[]) {
    const photos = answers.imagery.photos
    const within = files.filter(withinUploadLimit)
    const added = within.slice(0, Math.max(CONFIG.form.maxPhotos - photos.length, 0))
    if (added.length > 0) {
      const picked = added.map((file) => ({ id: crypto.randomUUID(), file }))
      dispatch({
        type: 'set-photos',
        photos: [
          ...photos,
          ...picked.map(({ id, file }): DraftPhoto => ({ id, fileName: file.name, url: null })),
        ],
      })
      for (const { id, file } of picked) startUpload('photos', id, file)
    }
    if (within.length < files.length) {
      dispatch({
        type: 'reject-file',
        field: 'imagery',
        message: `Some photos were over ${UPLOAD_LIMIT_LABEL} and were left out.`,
      })
    } else if (added.length < within.length) {
      dispatch({
        type: 'reject-file',
        field: 'imagery',
        message: `Up to ${String(CONFIG.form.maxPhotos)} photos, so the rest were left out.`,
      })
    }
  }

  function removePhoto(id: string) {
    forget(id)
    dispatch({
      type: 'set-photos',
      photos: answers.imagery.photos.filter((photo) => photo.id !== id),
    })
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

  return {
    logo: answers.logo.kind === 'file' ? toLocalImage(answers.logo) : null,
    photos: answers.imagery.photos.flatMap((photo) => {
      const image = toLocalImage(photo)
      return image === null ? [] : [image]
    }),
    handleLogoFile,
    handlePhotoFiles,
    removePhoto,
  }
}
