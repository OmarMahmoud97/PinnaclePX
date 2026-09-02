// Every behaviour-tuning number lives here, nowhere else.
export const CONFIG = {
  stageBudgetMs: { brief: 15_000, select: 5_000, copy: 60_000, imagery: 45_000, tokens: 5_000 },
  deadline: { totalMs: 300_000 }, // five minutes end to end
  rateLimit: { windowSec: 60, max: 5 },
  logo: { luminanceCutoff: 0.5 },
  contrast: { minRatio: 4.5 }, // WCAG AA body text
  templates: { count: 10, conceptsShown: 3 },
} as const
