import { CONFIG } from '@/lib/config'

const MEGABYTE = 1_000_000

// The upload limit as the visitor reads it: "6 MB".
export const UPLOAD_LIMIT_LABEL = `${String(CONFIG.form.maxUploadBytes / MEGABYTE)} MB`

export function withinUploadLimit(file: File): boolean {
  return file.size <= CONFIG.form.maxUploadBytes
}
