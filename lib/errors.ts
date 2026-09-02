// Throw AppError for precondition and programmer errors: fail fast, no swallowing, no backup path.
export class AppError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Discriminated result for expected, recoverable branches only (a selection tie, a slot miss).
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; reason: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(reason: E): Result<never, E> => ({ ok: false, reason })
