CREATE TABLE "enquiry" (
	"identity_hash" text PRIMARY KEY NOT NULL,
	"stage" text DEFAULT 'open' NOT NULL,
	"quote_pounds" integer,
	"stage_at" timestamp with time zone,
	"note" text DEFAULT '' NOT NULL,
	"note_at" timestamp with time zone,
	"call_state" text,
	"call_source" text,
	"call_uid_hash" text,
	"call_starts_at" timestamp with time zone,
	"call_ends_at" timestamp with time zone,
	"call_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unmatched_call" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "unmatched_call_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"starts_at" timestamp with time zone NOT NULL,
	CONSTRAINT "unmatched_call_starts_at_unique" UNIQUE("starts_at")
);
--> statement-breakpoint
DROP VIEW "public"."brief_overview";--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "owner_opened_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "enquiry" ADD CONSTRAINT "enquiry_identity_hash_lead_identity_hash_fk" FOREIGN KEY ("identity_hash") REFERENCES "public"."lead"("identity_hash") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."brief_overview" AS (select "submission"."created_at", "submission"."slug", "submission"."identity_hash", "lead"."name", "lead"."email", "submission"."answers" ->> 'company' as "company", "submission"."answers" ->> 'description' as "description", "submission"."answers" -> 'logo' ->> 'fileName' as "logo_file", "submission"."answers" -> 'logo' ->> 'url' as "logo_url", "submission"."answers" -> 'imagery' ->> 'style' as "look", jsonb_path_query_array("submission"."answers", '$.imagery.photos[*].url') as "photo_urls", coalesce("submission"."answers" -> 'colours' ->> 'paletteId', "submission"."answers" -> 'colours' ->> 'hex') as "colour", "submission"."template_ids", case when "submission"."template_ids" is null then null else array(select '/preview/' || "submission"."slug" || '/' || u.id from unnest("submission"."template_ids") with ordinality as u(id, ord) order by u.ord) end as "design_paths", "submission"."email_sent_at", "submission"."settled_at", "submission"."concept_count", "submission"."deadline_at", "submission"."stage_select", "submission"."stage_tokens", "submission"."stage_brief", "submission"."stage_copy", "submission"."stage_imagery", "submission"."owner_opened_at", coalesce("enquiry"."stage", 'open') as "enquiry_stage", "enquiry"."quote_pounds", "enquiry"."stage_at", coalesce("enquiry"."note", '') as "note", "enquiry"."note_at", "enquiry"."call_state", "enquiry"."call_source", "enquiry"."call_starts_at", "enquiry"."call_ends_at", "enquiry"."call_at" from "submission" inner join "lead" on "lead"."identity_hash" = "submission"."identity_hash" left join "enquiry" on "enquiry"."identity_hash" = "submission"."identity_hash");