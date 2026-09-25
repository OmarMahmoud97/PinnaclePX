// The done page's words that its components share with the copy tests
// (app/_components/copy-corpus.ts), kept out of the components so reading them loads no React.

export const SLOT_LINES = {
  beingBuilt: 'Being built',
  // Past the deadline with a design still to come: the time's line, kept short so it reads as a
  // note beside the ring rather than a headline, and the quiet line under it. Neither promises an
  // email: a build that fails at the deadline sends none (lib/inngest/functions/
  // send-preview-link.ts), and this page is where the designs land either way.
  timeUp: 'Taking a little longer.',
  timeUpKeep: 'Keep this page open, or save its link.',
} as const
