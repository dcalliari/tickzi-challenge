import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { eventsInTickzi, ticketsInTickzi } from "@server/db/schema";
import { authenticateToken } from "@server/lib/auth";
import { createEventSchema, updateEventSchema } from "@server/schemas/events";
import { count, desc, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";

export const eventRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	// TODO: Pagination and Redis caching
	.get("/", async (c) => {
		try {
			const events = await db
				.select()
				.from(eventsInTickzi)
				.where(gt(eventsInTickzi.ticket_quantity, 0))
				.orderBy(desc(eventsInTickzi.created_at));
			return c.json({ success: true, data: events }, 200);
		} catch (error) {
			console.error("Error fetching events:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.get("/my-events", authenticateToken, async (c) => {
		try {
			const userPayload = c.get("user");
			const events = await db
				.select()
				.from(eventsInTickzi)
				.where(eq(eventsInTickzi.user_id, userPayload.userId))
				.orderBy(desc(eventsInTickzi.created_at));
			return c.json({ success: true, data: events }, 200);
		} catch (error) {
			console.error("Error fetching user's events:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.get("/:id", async (c) => {
		try {
			const { id } = c.req.param();
			const [event] = await db
				.select()
				.from(eventsInTickzi)
				.where(eq(eventsInTickzi.id, id))
				.limit(1);

			if (!event) {
				return c.json({ success: false, error: "Event not found" }, 404);
			}

			return c.json({ success: true, data: event }, 200);
		} catch (error) {
			console.error("Error fetching event:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.post(
		"/",
		authenticateToken,
		zValidator("json", createEventSchema),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const validatedData = c.req.valid("json");

				const [newEvent] = await db
					.insert(eventsInTickzi)
					.values({
						user_id: userPayload.userId,
						title: validatedData.title,
						description: validatedData.description,
						date: validatedData.date,
						location: validatedData.location,
						ticket_quantity: validatedData.ticket_quantity,
						ticket_price: validatedData.ticket_price,
					})
					.returning();

				return c.json(
					{
						success: true,
						message: "Event created successfully",
						data: newEvent,
					},
					201,
				);
			} catch (error) {
				console.error("Error creating event:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	.put(
		"/:id",
		authenticateToken,
		zValidator("json", updateEventSchema),
		async (c) => {
			try {
				const { id } = c.req.param();
				const userPayload = c.get("user");
				const validatedData = c.req.valid("json");

				const [existingEvent] = await db
					.select()
					.from(eventsInTickzi)
					.where(eq(eventsInTickzi.id, id))
					.limit(1);

				if (!existingEvent) {
					return c.json({ success: false, error: "Event not found" }, 404);
				}

				if (existingEvent.user_id !== userPayload.userId) {
					return c.json({ success: false, error: "Unauthorized" }, 403);
				}

				const updatedEventData = {
					...existingEvent,
					...validatedData,
				};

				const [updatedEvent] = await db
					.update(eventsInTickzi)
					.set(updatedEventData)
					.where(eq(eventsInTickzi.id, id))
					.returning();

				return c.json(
					{
						success: true,
						message: "Event updated successfully",
						data: updatedEvent,
					},
					200,
				);
			} catch (error) {
				console.error("Error updating event:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	// TODO: Apenas se não houver vendas
	.delete("/:id", authenticateToken, async (c) => {
		try {
			const { id } = c.req.param();
			const userPayload = c.get("user");

			const [existingEvent] = await db
				.select()
				.from(eventsInTickzi)
				.where(eq(eventsInTickzi.id, id))
				.limit(1);

			if (!existingEvent) {
				return c.json({ success: false, error: "Event not found" }, 404);
			}

			if (existingEvent.user_id !== userPayload.userId) {
				return c.json({ success: false, error: "Unauthorized" }, 403);
			}

			const ticketCount = await db
				.select({ count: count() })
				.from(ticketsInTickzi)
				.where(eq(ticketsInTickzi.event_id, id));

			if (ticketCount[0] && ticketCount[0].count > 0) {
				return c.json(
					{ success: false, error: "Cannot delete event with sold tickets" },
					400,
				);
			}

			await db.delete(eventsInTickzi).where(eq(eventsInTickzi.id, id));

			return c.json(
				{ success: true, message: "Event deleted successfully" },
				200,
			);
		} catch (error) {
			console.error("Error deleting event:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
