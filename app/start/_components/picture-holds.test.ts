import { describe, expect, it } from 'vitest'
import { failedPictureAt, sendHold } from '@/app/start/_components/picture-holds'
import { SEND_PICTURE_FAILED, UPLOAD_ERRORS } from '@/app/start/_components/start-copy'
import type { LocalImage } from '@/app/start/_components/step-props'

type Status = LocalImage['status']

function picture(id: string, status: Status): LocalImage {
  return { id, name: `${id}.png`, url: `blob:${id}`, status }
}

const logo = (status: Status) => picture('logo', status)
const photos = (...statuses: Status[]) =>
  statuses.map((status, index) => picture(`photo${String(index)}`, status))

describe('failedPictureAt', () => {
  it('holds up the question a failed picture belongs to, and no other', () => {
    const pictures = { logo: logo('failed'), photos: photos('done', 'failed') }
    expect(failedPictureAt('brand', pictures)).toBe(UPLOAD_ERRORS.logos.failed)
    expect(failedPictureAt('imagery', pictures)).toBe(UPLOAD_ERRORS.photos.failed)
    expect(failedPictureAt('colours', pictures)).toBeNull()
    expect(failedPictureAt('details', pictures)).toBeNull()
  })

  it('never holds up a question for a picture still on its way', () => {
    const pictures = { logo: logo('uploading'), photos: photos('uploading') }
    expect(failedPictureAt('brand', pictures)).toBeNull()
    expect(failedPictureAt('imagery', pictures)).toBeNull()
  })
})

describe('sendHold', () => {
  it('sends when every picture is uploaded, or there are none', () => {
    expect(sendHold({ logo: null, photos: [] })).toEqual({ kind: 'go' })
    expect(sendHold({ logo: logo('done'), photos: photos('done', 'done') })).toEqual({
      kind: 'go',
    })
  })

  it('waits while a picture is still on its way', () => {
    expect(sendHold({ logo: logo('uploading'), photos: [] })).toEqual({ kind: 'wait' })
    expect(sendHold({ logo: null, photos: photos('done', 'uploading') })).toEqual({
      kind: 'wait',
    })
  })

  // The case the ask once sent to the server, which refused it without saying why: a photo that
  // failed after its question, and nothing else on its way.
  it('refuses to send past a picture that failed, naming it and where to put it right', () => {
    expect(sendHold({ logo: null, photos: photos('done', 'failed') })).toEqual({
      kind: 'refuse',
      message: SEND_PICTURE_FAILED.photos,
    })
    expect(sendHold({ logo: logo('failed'), photos: [] })).toEqual({
      kind: 'refuse',
      message: SEND_PICTURE_FAILED.logo,
    })
  })

  it('says so at once, even while another picture is still on its way', () => {
    expect(sendHold({ logo: logo('uploading'), photos: photos('failed') })).toEqual({
      kind: 'refuse',
      message: SEND_PICTURE_FAILED.photos,
    })
  })
})
