CREATE TABLE "rate_limit" (
	"key" text NOT NULL,
	"window" text NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "rate_limit_key_window_pk" PRIMARY KEY("key","window")
);
