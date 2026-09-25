import type { StatusView, SubmissionStatus } from '@/lib/brief/status'

// What of a build a page drew, so FollowBuild can tell when the status poll's answer would draw the
// page differently. A page drawn from the full view (the designs page) drew from everything the
// build moves: its status, its stages, its colour and every part of each design. So every stage
// that settles has it drawn again, five at most, and a part the page comes to draw later needs no
// change here. Left out are what the send fixed (the slug, the deadline and the count), which no
// answer changes, and the build's own time, which moves only with its stages. A page drawn from
// the status alone (a design still building) drew only which designs can be opened.
export function drawnKey(status: StatusView | SubmissionStatus, fromView: boolean): string {
  if (status.status === 'missing') return status.status
  if (fromView && 'stages' in status) {
    return JSON.stringify([status.status, status.stages, status.palette, status.concepts])
  }
  return JSON.stringify([status.status, status.concepts.map((concept) => concept.href)])
}
