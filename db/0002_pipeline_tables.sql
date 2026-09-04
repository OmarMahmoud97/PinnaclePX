CREATE TABLE "lead" (
	"identity_hash" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seen" (
	"identity_hash" text NOT NULL,
	"template_id" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seen_identity_hash_template_id_pk" PRIMARY KEY("identity_hash","template_id")
);
--> statement-breakpoint
CREATE TABLE "submission" (
	"slug" text PRIMARY KEY NOT NULL,
	"identity_hash" text NOT NULL,
	"payload_hash" text NOT NULL,
	"answers" jsonb NOT NULL,
	"concept_count" integer NOT NULL,
	"template_ids" text[],
	"logo" jsonb,
	"brief" jsonb,
	"tokens" jsonb,
	"copy" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"imagery" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"stage_select" text DEFAULT 'pending' NOT NULL,
	"stage_tokens" text DEFAULT 'pending' NOT NULL,
	"stage_brief" text DEFAULT 'pending' NOT NULL,
	"stage_copy" text DEFAULT 'pending' NOT NULL,
	"stage_imagery" text DEFAULT 'pending' NOT NULL,
	"deadline_at" timestamp with time zone NOT NULL,
	"event_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_payload_hash_unique" UNIQUE("payload_hash")
);
--> statement-breakpoint
ALTER TABLE "seen" ADD CONSTRAINT "seen_identity_hash_lead_identity_hash_fk" FOREIGN KEY ("identity_hash") REFERENCES "public"."lead"("identity_hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission" ADD CONSTRAINT "submission_identity_hash_lead_identity_hash_fk" FOREIGN KEY ("identity_hash") REFERENCES "public"."lead"("identity_hash") ON DELETE no action ON UPDATE no action;