import { sql } from "drizzle-orm";
import {
	integer,
	pgSchema,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const tickzi = pgSchema("tickzi");

export const usersInTickzi = tickzi.table(
	"users",
	{
		id: uuid().primaryKey().notNull(),
		name: varchar({ length: 255 }).notNull(),
		email: varchar({ length: 255 }).notNull(),
		password_hash: varchar({ length: 255 }).notNull(),
		created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [unique("users_email_key").on(table.email)],
);

export const eventsInTickzi = tickzi.table("events", {
	id: uuid().primaryKey().defaultRandom(),
	user_id: uuid()
		.notNull()
		.references(() => usersInTickzi.id, { onDelete: "cascade" }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	date: timestamp({ mode: "string" }).notNull(),
	location: varchar({ length: 255 }).notNull(),
	ticket_quantity: integer().notNull(),
	ticket_price: integer().notNull(),
	created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
});

export const ticketsInTickzi = tickzi.table("tickets", {
	id: uuid().primaryKey().defaultRandom(),
	event_id: uuid()
		.notNull()
		.references(() => eventsInTickzi.id, { onDelete: "cascade" }),
	user_id: uuid()
		.notNull()
		.references(() => usersInTickzi.id, { onDelete: "cascade" }),
	purchased_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
});
