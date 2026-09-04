import {
  APIConnectionTimeoutError,
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
} from '@anthropic-ai/sdk'
import { isPermanentModelError } from '@/lib/ai/errors'

const headers = new Headers()

describe('isPermanentModelError', () => {
  it.each([
    new BadRequestError(400, undefined, 'bad request', headers),
    new AuthenticationError(401, undefined, 'bad key', headers),
    new PermissionDeniedError(403, undefined, 'not allowed', headers),
    new NotFoundError(404, undefined, 'no such model', headers),
    new UnprocessableEntityError(422, undefined, 'cannot process', headers),
  ])('is true for an answer the API will give again: $message', (error) => {
    expect(isPermanentModelError(error)).toBe(true)
  })

  it.each([
    new RateLimitError(429, undefined, 'slow down', headers),
    new InternalServerError(500, undefined, 'overloaded', headers),
    new APIConnectionTimeoutError(),
    new Error('socket hang up'),
  ])('is false for anything worth another attempt: $message', (error) => {
    expect(isPermanentModelError(error)).toBe(false)
  })
})
