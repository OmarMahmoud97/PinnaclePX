# `seen` no longer references `lead`

- Status: accepted, 2 October 2026; migration applied to the database in `.env.local` the same day
- Date: 2 October 2026
- Amends: ADR 0014 (decision 4, the retention sweep: `seen` was kept after a lead's submissions
  were gone, but its foreign key to `lead` stopped the lead going)

## Context

ADR 0014 keeps `seen` after the sweep: the promise that a returning address sees new designs
outlives the preview, and the notice calls the row "a code that cannot be turned back into the
address". The same migration (0002) gave `seen.identity_hash` a foreign key to
`lead.identity_hash` with no cascade. So `deleteLeadsWithoutSubmissions`, the sweep's last step,
fails with Postgres error 23503 for any lead that was ever shown a design, which is every lead
whose build reached the select stage. One such lead fails the whole statement, so no lead is
deleted, and the rate-limit tidy after it never runs. The first submissions were made on 4
September 2026, so the first sweep to find an expired one would have failed on about 4 October,
and names and emails would have stayed past the thirty days the notice promises.

Found on 2 October 2026 by the design round for the admin page's next release, and proved on the
database inside a transaction that was then rolled back: inserting a lead with one `seen` row and
deleting the lead raised `update or delete on table "lead" violates foreign key constraint
"seen_identity_hash_lead_identity_hash_fk" on table "seen"`.

## Decision

`seen.identity_hash` is a plain text column. Migration `0009_seen_without_lead_fk` drops the
constraint and nothing else. The composite primary key, the sweep's keeping of `seen`, and
erasure's removal of it (`deleteIdentity`) are unchanged; nothing reads `seen` through `lead`,
since the reveal reads it by the identity hash it already holds (`lib/db/exclusivity.ts`).

Why not cascade instead: a cascade would delete `seen` with the lead and break the exclusivity
promise ADR 0014 keeps on purpose. Why not keep the lead: the notice promises the details go.

## Consequences

- Migration 0009, applied to the database in `.env.local` on 2 October 2026 before any other
  change. Verified afterwards with the same probe: the delete succeeded and the `seen` row stayed,
  then the probe's own rows were removed.
- `lib/db/schema.ts`: the `seen` comment says why there is no key. Claims register row 12 gains the
  evidence.
- A `seen` row whose identity has no lead is by design, as it was after erasure. Re-adding the
  constraint would need those rows deleted first.
- The admin page's next release (ADR 0047) relies on this: its own records hang off `lead` with a
  cascade, which only works once the lead itself can go.
