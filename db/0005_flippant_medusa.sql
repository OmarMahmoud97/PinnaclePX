CREATE TABLE "blob_ref" (
	"url" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "blob_ref_url_slug_pk" PRIMARY KEY("url","slug")
);
--> statement-breakpoint
ALTER TABLE "blob_ref" ADD CONSTRAINT "blob_ref_slug_submission_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."submission"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blob_ref_slug_idx" ON "blob_ref" USING btree ("slug");--> statement-breakpoint
-- Backfill: every file the existing rows point at, so the sweep's "does anything else point
-- here" is answered for submissions made before this table existed.
INSERT INTO "blob_ref" ("url", "slug")
SELECT DISTINCT x.url, s.slug
FROM "submission" s
CROSS JOIN LATERAL (
	SELECT s.answers->'logo'->>'url' AS url WHERE s.answers->'logo'->>'kind' = 'file'
	UNION
	SELECT p->>'url' FROM jsonb_array_elements(s.answers->'imagery'->'photos') AS p
	UNION
	SELECT s.logo->'image'->>'src' WHERE jsonb_typeof(s.logo->'image') = 'object'
	UNION
	SELECT slot.value->>'src'
	FROM jsonb_each(s.imagery) AS tpl, jsonb_each(tpl.value) AS slot
	WHERE jsonb_typeof(slot.value) = 'object'
) AS x
WHERE x.url IS NOT NULL
ON CONFLICT DO NOTHING;
