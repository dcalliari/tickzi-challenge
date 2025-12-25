import { zValidator } from "@hono/zod-validator";
import { db } from "@server/db";
import { eventsInTickzi, ticketsInTickzi } from "@server/db/schema";
import { authenticateToken } from "@server/lib/auth";
import {
	CACHE_KEYS,
	CACHE_TTL,
	getCachedData,
	invalidateCache,
	setCachedData,
} from "@server/lib/redis";
import { paginationSchema } from "@server/schemas/pagination";
import { reserveTicketSchema } from "@server/schemas/tickets";
import type { PaginatedResponse } from "@server/types";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { Bindings, Variables } from "hono/types";
import { z } from "zod";

type TicketWithEvent = {
	id: string;
	purchased_at: string | null;
	event: {
		id: string;
		title: string;
		description: string | null;
		date: string;
		location: string;
		ticket_price: number;
	};
};

export const ticketRoutes = new Hono<{
	Bindings: Bindings;
	Variables: Variables;
}>()

	.get(
		"/search",
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

				const cacheKey = `${CACHE_KEYS.TICKETS_SEARCH(userPayload.userId, q)}:${limit}`;
				const cachedResults = await getCachedData<TicketWithEvent[]>(cacheKey);

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
					.where(
						and(
							eq(ticketsInTickzi.user_id, userPayload.userId),
							or(
								ilike(eventsInTickzi.title, searchPattern),
								ilike(eventsInTickzi.description, searchPattern),
								ilike(eventsInTickzi.location, searchPattern),
							),
						),
					)
					.orderBy(desc(ticketsInTickzi.purchased_at))
					.limit(limit);

				await setCachedData(cacheKey, tickets, CACHE_TTL.SEARCH);

				return c.json(
					{
						success: true,
						data: tickets,
						query: q,
					},
					200,
				);
			} catch (error) {
				console.error("Error searching tickets:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	)

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

				await invalidateCache(`${CACHE_KEYS.EVENTS_LIST}:*`);
				await invalidateCache(CACHE_KEYS.EVENT_DETAIL(event_id));
				await invalidateCache(`events:search:*`);
				await invalidateCache(`tickets:${userPayload.userId}:search:*`);
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

	.get(
		"/",
		authenticateToken,
		zValidator("query", paginationSchema),
		async (c) => {
			try {
				const userPayload = c.get("user");
				const { page, limit } = c.req.valid("query");
				const offset = (page - 1) * limit;

				const [totalResult] = await db
					.select({ count: count() })
					.from(ticketsInTickzi)
					.where(eq(ticketsInTickzi.user_id, userPayload.userId));

				const total = totalResult?.count || 0;
				const totalPages = Math.ceil(total / limit);

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
					.orderBy(desc(ticketsInTickzi.purchased_at))
					.limit(limit)
					.offset(offset);

				const response: PaginatedResponse<TicketWithEvent> = {
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

				return c.json(response, 200);
			} catch (error) {
				console.error("Error fetching tickets:", error);
				return c.json({ error: "Internal server error" }, 500);
			}
		},
	);
