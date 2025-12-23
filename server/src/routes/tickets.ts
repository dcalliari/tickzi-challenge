import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { eventsInTickzi, ticketsInTickzi } from "@server/db/schema";
import { authenticateToken } from "@server/lib/auth";
import { reserveTicketSchema } from "@server/schemas/tickets";
import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const ticketRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.post(
		"/",
		authenticateToken,
		zValidator("json", reserveTicketSchema),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const { event_id } = c.req.valid("json");

				const result = await db.transaction(async (tx) => {
					const [event] = await tx
						.select()
						.from(eventsInTickzi)
						.where(eq(eventsInTickzi.id, event_id))
						.for("update")
						.limit(1);

					if (!event) {
						return { error: "Event not found", status: 404 as const };
					}

					if (event.ticket_quantity <= 0) {
						return {
							error: "No tickets available for this event",
							status: 400 as const,
						};
					}

					const [existingTicket] = await tx
						.select()
						.from(ticketsInTickzi)
						.where(
							and(
								eq(ticketsInTickzi.event_id, event_id),
								eq(ticketsInTickzi.user_id, userPayload.userId),
							),
						)
						.limit(1);

					if (existingTicket) {
						return {
							error: "You already have a ticket for this event",
							status: 400 as const,
						};
					}

					const [newTicket] = await tx
						.insert(ticketsInTickzi)
						.values({
							event_id,
							user_id: userPayload.userId,
						})
						.returning();

					await tx
						.update(eventsInTickzi)
						.set({
							ticket_quantity: sql`${eventsInTickzi.ticket_quantity} - 1`,
						})
						.where(eq(eventsInTickzi.id, event_id));

					return { success: true, ticket: newTicket };
				});

				if ("error" in result) {
					return c.json({ error: result.error }, result.status);
				}

				return c.json(
					{
						success: true,
						message: "Ticket reserved successfully",
						data: result.ticket,
					},
					201,
				);
			} catch (error) {
				console.error("Error reserving ticket:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	.get("/", authenticateToken, async (c) => {
		try {
			const userPayload = c.get("user");

			const tickets = await db
				.select({
					id: ticketsInTickzi.id,
					purchased_at: ticketsInTickzi.purchased_at,
					event: {
						id: eventsInTickzi.id,
						title: eventsInTickzi.title,
						description: eventsInTickzi.description,
						date: eventsInTickzi.date,
						location: eventsInTickzi.location,
						ticket_price: eventsInTickzi.ticket_price,
					},
				})
				.from(ticketsInTickzi)
				.innerJoin(
					eventsInTickzi,
					eq(ticketsInTickzi.event_id, eventsInTickzi.id),
				)
				.where(eq(ticketsInTickzi.user_id, userPayload.userId))
				.orderBy(desc(ticketsInTickzi.purchased_at));

			return c.json({ success: true, data: tickets }, 200);
		} catch (error) {
			console.error("Error fetching tickets:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
