import { usuallyDoneBy } from '@/app/start/_components/done-copy'
import { SLOT_LINES } from '@/app/start/_components/done-lines'

const TIME = '{time}'

const [before = '', after = ''] = usuallyDoneBy(TIME).split(TIME)

// The time line's words for DoneBy, read here on the server: done-copy's sentence split where the
// time goes, since only the browser can read the time in the visitor's own zone, and the delay
// line with the quiet line under it. Handed over as plain words, so the copy modules never join a
// /preview script, where they would pull the questionnaire's words into a chunk the two routes
// share.
export const DEADLINE_WORDS = {
  before,
  after,
  late: SLOT_LINES.timeUp,
  keep: SLOT_LINES.timeUpKeep,
} as const
