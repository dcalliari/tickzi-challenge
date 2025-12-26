import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import {
	eventsInTickzi,
	ticketsInTickzi,
	usersInTickzi,
} from "@server/db/schema";
import { authenticateToken } from "@server/lib/auth";
import {
	CACHE_KEYS,
	CACHE_TTL,
	getCachedData,
	invalidateCache,
	setCachedData,
} from "@server/lib/redis";
import { createEventSchema, updateEventSchema } from "@server/schemas/events";
import { paginationSchema } from "@server/schemas/pagination";
import type { PaginatedResponse } from "@server/types";
import { and, asc, count, desc, eq, gt, ilike, or } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";
import { z } from "zod";

type Event = typeof eventsInTickzi.$inferSelect;

export const eventRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get(
		"/search",
		zValidator(
			"query",
			z.object({
				q: z.string().min(1).max(255),
				limit: z.coerce.number().int().positive().max(50).default(10),
			}),
		),
		async (c) => {
			try {
				const { q, limit } = c.req.valid("query");

				const cacheKey = `${CACHE_KEYS.EVENTS_SEARCH(q)}:${limit}`;
				const cachedResults = await getCachedData<Event[]>(cacheKey);

				if (cachedResults) {
					return c.json(
						{
							success: true,
							data: cachedResults,
							query: q,
						},
						200,
					);
				}

				const searchPattern = `%${q}%`;

				const events = await db
					.select()
					.from(eventsInTickzi)
					.where(
						and(
							gt(eventsInTickzi.ticket_quantity, 0),
							or(
								ilike(eventsInTickzi.title, searchPattern),
								ilike(eventsInTickzi.description, searchPattern),
								ilike(eventsInTickzi.location, searchPattern),
							),
						),
					)
					.orderBy(asc(eventsInTickzi.date))
					.limit(limit);

				await setCachedData(cacheKey, events, CACHE_TTL.SEARCH);

				return c.json(
					{
						success: true,
						data: events,
						query: q,
					},
					200,
				);
			} catch (error) {
				console.error("Error searching events:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	.get(
		"/my-events/search",
		authenticateToken,
		zValidator(
			"query",
			z.object({
				q: z.string().min(1).max(255),
				limit: z.coerce.number().int().positive().max(50).default(10),
			}),
		),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const { q, limit } = c.req.valid("query");

				const cacheKey = `${CACHE_KEYS.MY_EVENTS_SEARCH(userPayload.userId, q)}:${limit}`;
				const cachedResults = await getCachedData<Event[]>(cacheKey);

				if (cachedResults) {
					return c.json(
						{
							success: true,
							data: cachedResults,
							query: q,
						},
						200,
					);
				}

				const searchPattern = `%${q}%`;

				const events = await db
					.select()
					.from(eventsInTickzi)
					.where(
						and(
							eq(eventsInTickzi.user_id, userPayload.userId),
							or(
								ilike(eventsInTickzi.title, searchPattern),
								ilike(eventsInTickzi.description, searchPattern),
								ilike(eventsInTickzi.location, searchPattern),
							),
						),
					)
					.orderBy(asc(eventsInTickzi.date))
					.limit(limit);

				await setCachedData(cacheKey, events, CACHE_TTL.SEARCH);

				return c.json(
					{
						success: true,
						data: events,
						query: q,
					},
					200,
				);
			} catch (error) {
				console.error("Error searching user's events:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	.get("/", zValidator("query", paginationSchema), async (c) => {
		try {
			const { page, limit } = c.req.valid("query");
			const offset = (page - 1) * limit;

			const cacheKey = `${CACHE_KEYS.EVENTS_LIST}:${page}:${limit}`;
			const cachedData =
				await getCachedData<PaginatedResponse<Event>>(cacheKey);

			if (cachedData) {
				return c.json(cachedData, 200);
			}

			const [totalResult] = await db
				.select({ count: count() })
				.from(eventsInTickzi)
				.where(gt(eventsInTickzi.ticket_quantity, 0));

			const total = totalResult?.count || 0;
			const totalPages = Math.ceil(total / limit);

			const events = await db
				.select()
				.from(eventsInTickzi)
				.where(gt(eventsInTickzi.ticket_quantity, 0))
				.orderBy(asc(eventsInTickzi.date))
				.limit(limit)
				.offset(offset);

			const response: PaginatedResponse<Event> = {
				success: true,
				data: events,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
			};

			await setCachedData(cacheKey, response, CACHE_TTL.EVENTS_LIST);

			return c.json(response, 200);
		} catch (error) {
			console.error("Error fetching events:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.get(
		"/my-events",
		authenticateToken,
		zValidator("query", paginationSchema),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const { page, limit } = c.req.valid("query");
				const offset = (page - 1) * limit;

				const cacheKey = `${CACHE_KEYS.MY_EVENTS_LIST(userPayload.userId)}:${page}:${limit}`;
				const cachedData =
					await getCachedData<PaginatedResponse<Event>>(cacheKey);

				if (cachedData) {
					return c.json(cachedData, 200);
				}

				const [totalResult] = await db
					.select({ count: count() })
					.from(eventsInTickzi)
					.where(eq(eventsInTickzi.user_id, userPayload.userId));

				const total = totalResult?.count || 0;
				const totalPages = Math.ceil(total / limit);

				const events = await db
					.select()
					.from(eventsInTickzi)
					.where(eq(eventsInTickzi.user_id, userPayload.userId))
					.orderBy(asc(eventsInTickzi.date))
					.limit(limit)
					.offset(offset);

				const response: PaginatedResponse<Event> = {
					success: true,
					data: events,
					pagination: {
						page,
						limit,
						total,
						totalPages,
						hasNextPage: page < totalPages,
						hasPreviousPage: page > 1,
					},
				};

				await setCachedData(cacheKey, response, CACHE_TTL.MY_EVENTS_LIST);

				return c.json(response, 200);
			} catch (error) {
				console.error("Error fetching user's events:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

	.get("/:id", async (c) => {
		try {
			const { id } = c.req.param();

			const cacheKey = CACHE_KEYS.EVENT_DETAIL(id);
			const cachedEvent = await getCachedData<Event>(cacheKey);

			if (cachedEvent) {
				return c.json({ success: true, data: cachedEvent }, 200);
			}

			const [event] = await db
				.select()
				.from(eventsInTickzi)
				.where(eq(eventsInTickzi.id, id))
				.limit(1);

			if (!event) {
				return c.json({ success: false, error: "Event not found" }, 404);
			}

			await setCachedData(cacheKey, event, CACHE_TTL.EVENT_DETAIL);

			return c.json({ success: true, data: event }, 200);
		} catch (error) {
			console.error("Error fetching event:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	})

	.get(
		"/:id/tickets",
		authenticateToken,
		zValidator("query", paginationSchema),
		async (c) => {
			try {
				const { id } = c.req.param();
				const userPayload = c.get("user");
				const { page, limit } = c.req.valid("query");
				const offset = (page - 1) * limit;

				const cacheKey = `${CACHE_KEYS.EVENT_TICKETS_LIST(id)}:${page}:${limit}`;
				const cachedData =
					await getCachedData<
						PaginatedResponse<{
							id: string;
							purchased_at: string | null;
							user: { id: string; name: string; email: string };
						}>
					>(cacheKey);

				if (cachedData) {
					const [event] = await db
						.select({ user_id: eventsInTickzi.user_id })
						.from(eventsInTickzi)
						.where(eq(eventsInTickzi.id, id))
						.limit(1);

					if (event && event.user_id === userPayload.userId) {
						return c.json(cachedData, 200);
					}
				}

				const [event] = await db
					.select()
					.from(eventsInTickzi)
					.where(eq(eventsInTickzi.id, id))
					.limit(1);

				if (!event) {
					return c.json({ success: false, error: "Event not found" }, 404);
				}

				if (event.user_id !== userPayload.userId) {
					return c.json({ success: false, error: "Unauthorized" }, 403);
				}

				const [totalResult] = await db
					.select({ count: count() })
					.from(ticketsInTickzi)
					.where(eq(ticketsInTickzi.event_id, id));

				const total = totalResult?.count || 0;
				const totalPages = Math.ceil(total / limit);

				const tickets = await db
					.select({
						id: ticketsInTickzi.id,
						purchased_at: ticketsInTickzi.purchased_at,
						user: {
							id: usersInTickzi.id,
							name: usersInTickzi.name,
							email: usersInTickzi.email,
						},
					})
					.from(ticketsInTickzi)
					.innerJoin(
						usersInTickzi,
						eq(ticketsInTickzi.user_id, usersInTickzi.id),
					)
					.where(eq(ticketsInTickzi.event_id, id))
					.orderBy(desc(ticketsInTickzi.purchased_at))
					.limit(limit)
					.offset(offset);

				const response: PaginatedResponse<(typeof tickets)[0]> = {
					success: true,
					data: tickets,
					pagination: {
						page,
						limit,
						total,
						totalPages,
						hasNextPage: page < totalPages,
						hasPreviousPage: page > 1,
					},
				};

				await setCachedData(cacheKey, response, CACHE_TTL.EVENT_TICKETS_LIST);

				return c.json(response, 200);
			} catch (error) {
				console.error("Error fetching event tickets:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

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

				await invalidateCache(`${CACHE_KEYS.EVENTS_LIST}:*`);
				await invalidateCache(`events:search:*`);
				await invalidateCache(`events:my:${userPayload.userId}:search:*`);
				await invalidateCache(
					`${CACHE_KEYS.MY_EVENTS_LIST(userPayload.userId)}:*`,
				);
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

				await invalidateCache(`${CACHE_KEYS.EVENTS_LIST}:*`);
				await invalidateCache(CACHE_KEYS.EVENT_DETAIL(id));
				await invalidateCache(`events:search:*`);
				await invalidateCache(`events:my:${userPayload.userId}:search:*`);
				await invalidateCache(
					`${CACHE_KEYS.MY_EVENTS_LIST(userPayload.userId)}:*`,
				);
				await invalidateCache(`${CACHE_KEYS.EVENT_TICKETS_LIST(id)}:*`);
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

			await invalidateCache(`${CACHE_KEYS.EVENTS_LIST}:*`);
			await invalidateCache(CACHE_KEYS.EVENT_DETAIL(id));
			await invalidateCache(`events:search:*`);
			await invalidateCache(`events:my:${userPayload.userId}:search:*`);
			await invalidateCache(
				`${CACHE_KEYS.MY_EVENTS_LIST(userPayload.userId)}:*`,
			);
			await invalidateCache(`${CACHE_KEYS.EVENT_TICKETS_LIST(id)}:*`);

			return c.json(
				{ success: true, message: "Event deleted successfully" },
				200,
			);
		} catch (error) {
			console.error("Error deleting event:", error);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
