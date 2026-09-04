import { CONFIG } from '@/lib/config'

const MEGABYTE = 1_000_000

// The upload limit as the visitor reads it: "6 MB".
export const UPLOAD_LIMIT_LABEL = `${String(CONFIG.form.maxUploadBytes / MEGABYTE)} MB`

export function withinUploadLimit(file: File): boolean {
  return file.size <= CONFIG.form.maxUploadBytes
}

// The two kinds of picture a visitor uploads, which are also the folders they land in on Blob.
export type UploadKind = 'logos' | 'photos'

// File extension by media type. A logo may be an SVG, which the logo stage rasterises; a
// photograph may not. HEIC is not accepted: sharp cannot read it on Vercel.
const EXTENSIONS: Readonly<Record<UploadKind, Readonly<Record<string, string>>>> = {
  logos: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' },
  photos: { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' },
}

export function contentTypesFor(kind: UploadKind): readonly string[] {
  return Object.keys(EXTENSIONS[kind])
}

// The `accept` attribute for a file input of this kind.
export function acceptFor(kind: UploadKind): string {
  return contentTypesFor(kind).join(',')
}

// The path a file is stored at: its kind and the SHA-256 of its bytes, so the same file always
// lands in the same place and a repeated upload is idempotent. Null for a type we do not take.
export function uploadPathname(
  kind: UploadKind,
  sha256: string,
  contentType: string,
): string | null {
  const extension = EXTENSIONS[kind][contentType]
  return extension === undefined ? null : `${kind}/${sha256}.${extension}`
}

const UPLOAD_PATH = /^(logos|photos)\/[a-f0-9]{64}\.(png|jpg|webp|svg)$/

// The kind a requested path belongs to, or null when it is not a path we issue tokens for.
export function uploadKindOf(pathname: string): UploadKind | null {
  const match = UPLOAD_PATH.exec(pathname)
  if (match === null) return null
  const kind = match[1] as UploadKind
  const extension = match[2] ?? ''
  return Object.values(EXTENSIONS[kind]).includes(extension) ? kind : null
}
