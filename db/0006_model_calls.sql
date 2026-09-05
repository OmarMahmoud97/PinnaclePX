CREATE TABLE "model_call" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model_call_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"stage" text NOT NULL,
	"template_id" text,
	"model" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"cache_read_tokens" integer DEFAULT 0 NOT NULL,
	"cache_write_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "owner_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "model_call" ADD CONSTRAINT "model_call_slug_submission_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."submission"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "model_call_slug_idx" ON "model_call" USING btree ("slug");