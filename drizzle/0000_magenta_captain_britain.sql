-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."movement_type" AS ENUM('CONSUME', 'RECEIVE', 'ADJUST');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "quote_status" DEFAULT 'DRAFT' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_number" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parts_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE "movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"type" "movement_type" NOT NULL,
	"quantity" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;
*/