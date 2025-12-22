import { sql } from "drizzle-orm";
import {
	pgSchema,
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
