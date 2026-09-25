import { SEND_PICTURE_FAILED, UPLOAD_ERRORS } from '@/app/start/_components/start-copy'
import type { LocalImage } from '@/app/start/_components/step-props'
import type { QuestionId } from '@/lib/brief/question-ids'

// What the pictures' uploads hold up (docs/start-page-journey-plan.md, D14). One still on its way
// never holds up Next, and the send waits for it. One that failed holds up its own question until
// it is sent again or removed, and the send too, wherever the visitor is when it fails: the server
// takes a brief only with every picture's URL, and would refuse this one without saying why.

// The pictures as the flow shows them (use-picture-uploads.ts), each with how its upload is going.
type Pictures = Readonly<{ logo: LocalImage | null; photos: readonly LocalImage[] }>

const logoFailed = ({ logo }: Pictures) => logo?.status === 'failed'
const photoFailed = ({ photos }: Pictures) => photos.some((photo) => photo.status === 'failed')

// The message a question gives for its own picture that failed, or null when it may move on.
export function failedPictureAt(id: QuestionId, pictures: Pictures): string | null {
  if (id === 'brand' && logoFailed(pictures)) return UPLOAD_ERRORS.logos.failed
  if (id === 'imagery' && photoFailed(pictures)) return UPLOAD_ERRORS.photos.failed
  return null
}

type SendHold =
  | Readonly<{ kind: 'go' }>
  | Readonly<{ kind: 'wait' }>
  // Which picture failed, and the question to go back to.
  | Readonly<{ kind: 'refuse'; message: string }>

// What the last question's ask does with the pictures as they stand, whether it was just pressed
// or has been waiting for them. A failure is said at once, even while another picture is still on
// its way, since the visitor has to put it right before anything can go.
export function sendHold(pictures: Pictures): SendHold {
  if (logoFailed(pictures)) return { kind: 'refuse', message: SEND_PICTURE_FAILED.logo }
  if (photoFailed(pictures)) return { kind: 'refuse', message: SEND_PICTURE_FAILED.photos }
  const { logo, photos } = pictures
  const uploading =
    logo?.status === 'uploading' || photos.some((photo) => photo.status === 'uploading')
  return uploading ? { kind: 'wait' } : { kind: 'go' }
}
