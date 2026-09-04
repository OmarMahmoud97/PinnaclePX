# Repeat templates in development: one env flag, refused in production

- Status: accepted
- Date: 4 September 2026
- Amends: ADR 0009 (decision 3, exclusivity)

## Context

The guide's rule is that a returning email never sees a template it has already seen. With one template ready, that rule turns every second test submission from the same address into the book-a-call state: no ring, no link, no email. On 4 September 2026 the owner's two submissions after funding the API key both ended that way, because their addresses had been shown Aurora by earlier runs. The owner asked that, while testing, an address may be shown the same template as often as needed, and that this stop in production.

## Decision

1. **One env-driven flag, validated in `lib/env.ts`**, as the standards document prescribes for a feature flag: `ALLOW_REPEAT_TEMPLATES=1`. It is optional and documented in `.env.example`; the owner's `.env.local` sets it.
2. **With the flag set, the reveal reads and writes nothing.** `revealTemplates` chooses as if the identity had seen nothing and logs `seen.off` with the slug. No `seen` row is written, so the production rule starts from a clean slate the day the flag is dropped, and no composite-key collision can arise from a repeat.
3. **The production deployment refuses it.** The schema's refinement rejects the flag when `VERCEL_ENV` is `production`, so a build with it set fails at once rather than shipping a site where the rule is off. Preview deployments and local production builds may carry it, which is where testing happens.

## Consequences

- Locally, every submission from any address is built and linked, and, when every stage finishes, emailed.
- The flag is a line in `.env.local`, which is never committed. It must not be added to the Vercel production environment; if it is, the build fails with the message naming it.
- Once several templates are ready, the flag can be dropped locally to test the rule itself.
