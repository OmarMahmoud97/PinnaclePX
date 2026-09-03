// Every behaviour-tuning number lives here, nowhere else.
export const CONFIG = {
  stageBudgetMs: { brief: 15_000, select: 5_000, copy: 60_000, imagery: 45_000, tokens: 5_000 },
  deadline: { totalMs: 300_000 }, // five minutes end to end
  rateLimit: { windowSec: 60, max: 5 },
  logo: { luminanceCutoff: 0.5 },
  contrast: { minRatio: 4.5 }, // WCAG AA body text
  templates: { count: 10, conceptsShown: 3 },
  form: {
    minChars: 30, // one short sentence about the business
    maxChars: 400,
    maxUploadBytes: 6_000_000, // per file, logo or photo
    maxPhotos: 6,
  },
  retention: { days: 30 }, // lead, submission and blobs are deleted after this unless a call was booked
  polling: { designsMs: 10_000 }, // how often the done page asks whether the designs are ready
  analytics: { sectionViewThreshold: 0.2 }, // share of a section on screen before it counts as viewed
} as const
