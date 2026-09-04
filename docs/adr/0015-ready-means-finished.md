# Ready means finished: stages retry until the deadline, and the email waits for a finished page

- Status: accepted
- Date: 4 September 2026
- Amends: ADR 0009 (decision 1), ADR 0013 (decision 1)

## Context

Under ADR 0009 a stage that failed fell back at once: a model call that returned an error was replaced by the deterministic copy within seconds, the submission was called ready, and the email went out. When the Anthropic key lacked its workspace id, every submission was "ready" in five seconds with the visitor's own sentence as the headline, and the owner received the email for a page that had not been composed. The guide's sweeper, which forces the fallback shortly before the deadline, never had anything to do. Separately, a slice-7 gate spent the upload token allowance of the loopback address on the shared development database, so every upload from the owner's browser was refused for an hour.

## Decision

1. **A stage that fails is retried on a fixed cadence until the sweeper settles it.** `runStage` no longer falls back on the first error. It logs `stage.retry` and throws `RetryAfterError` with `CONFIG.pipeline.retryAfterMs`; the function allows `CONFIG.pipeline.retries` attempts, enough to outlast the deadline. The sweeper, at the deadline less its lead, writes the fallback into whatever is still open. A transient failure recovers on the next attempt; a lasting one is visible in the log for four minutes before the fallback is used. Once the sweeper has settled a stage, the next attempt finds it closed and the run ends.
2. **The brief is the one bounded stage.** It is only the raw material for the copy and the searches, so it is tried `CONFIG.brief.attempts` times within its step, with the same pause between, and then its deterministic fallback is written and the pipeline moves on. Otherwise a failing brief would starve the imagery stage until the deadline, which the first gate of this change showed: a page with no pictures at all.
3. **Copy that breaks its limits is asked for again a bounded number of times.** An answer that still breaks a limit after the in-call retry is asked for again on the next attempt of the step; after `CONFIG.copy.attempts` the template's fallback stands. An API failure is retried like any other stage.
4. **The imagery stage keeps what it filled.** A run whose plan left a slot empty writes the filled slots to the row while it retries; the sweeper's imagery fallback keeps the column as it is.
5. **Ready means every stage finished.** `statusOf` returns `ready` only when select, tokens, copy and imagery are all `done`; when any was settled by the sweeper it returns `partial`. The done page and the preview open a partial page like a ready one, because at that point the deadline is the guarantee the visitor was given. The email is sent only for `ready`, and `email.withheld` is logged otherwise.
6. **Upload limit raised.** `CONFIG.rateLimit.uploadsPerIp.max` is 100 an hour: a shared office address uploading six photographs and a logo per submission must not run out.

## Consequences

- With the model unreachable, a submission now shows its design at the deadline less the lead, as partial, with pictures and the visitor's own words, and no email. With the model reachable, nothing changes except that a transient failure no longer costs the visitor their copy.
- The loopback rate limit rows were cleared by hand on 4 September 2026. Review harnesses must not be run against the shared development database's limits, or must clear their rows afterwards.
- Verified on 4 September 2026 on a production build with the Inngest dev server and the model unreachable: the brief was tried three times over forty seconds and fell back; the pictures landed; the copy stage was retried every twenty seconds until the sweeper settled it at four minutes fifteen; the design linked at 271 seconds as partial; the email was withheld and logged; the logo uploaded, so the token route was back. Before the brief was bounded, the same run ended with no pictures, which is what decision 2 fixes.
