CREATE SCHEMA "tickzi";
--> statement-breakpoint
CREATE TABLE "tickzi"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
