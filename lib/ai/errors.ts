import {
  AuthenticationError,
  BadRequestError,
  NotFoundError,
  PermissionDeniedError,
  UnprocessableEntityError,
} from '@anthropic-ai/sdk'

// An error the API will give again however often the same request is made: a request it
// rejects, a key it refuses, a model it does not have. Retrying one spends a full request each
// time and buries the one line that says what is wrong, so the caller goes to its fallback at
// once. Everything else (a timeout, a rate limit, a server error) is worth another attempt.
export function isPermanentModelError(error: unknown): boolean {
  return (
    error instanceof BadRequestError ||
    error instanceof AuthenticationError ||
    error instanceof PermissionDeniedError ||
    error instanceof NotFoundError ||
    error instanceof UnprocessableEntityError
  )
}
