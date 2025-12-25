import "../../setup/hooks";
import { beforeAll, describe, expect, test } from "bun:test";
import type { Hono } from "hono";
import {
	expectApiSuccess,
	expectPaginationResponse,
	expectUUID,
} from "../../helpers/assertions";
import { createTestEvent, createTestUser } from "../../helpers/factories";

let app: Hono;

beforeAll(async () => {
	const module = await import("../../../src/index");
	app = module.default;
});

describe("Tickets Routes Integration", () => {
	describe("POST /api/tickets/has", () => {
		test("should require authentication", async () => {
			const res = await app.request("/api/tickets/has", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					event_ids: ["550e8400-e29b-41d4-a716-446655440000"],
				}),
			});

			expect(res.status).toBe(401);
		});

		test("should return true/false mapping for provided event ids", async () => {
			const { token: organizerToken } = await createTestUser();
			const { token: buyerToken } = await createTestUser();

			const eventWithTicket = await createTestEvent(organizerToken, {
				ticket_quantity: 10,
			});
			const eventWithoutTicket = await createTestEvent(organizerToken, {
				ticket_quantity: 10,
			});

			const reserveRes = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyerToken}`,
				},
				body: JSON.stringify({ event_id: eventWithTicket.id }),
			});
			expect(reserveRes.status).toBe(201);

			const res = await app.request("/api/tickets/has", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyerToken}`,
				},
				body: JSON.stringify({
					event_ids: [eventWithTicket.id, eventWithoutTicket.id],
				}),
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expectApiSuccess(data);
			expect(data.data[eventWithTicket.id]).toBe(true);
			expect(data.data[eventWithoutTicket.id]).toBe(false);
		});

		test("should not return true for tickets owned by another user", async () => {
			const { token: organizerToken } = await createTestUser();
			const { token: buyer1Token } = await createTestUser();
			const { token: buyer2Token } = await createTestUser();

			const event = await createTestEvent(organizerToken, {
				ticket_quantity: 10,
			});

			const reserveRes = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyer1Token}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});
			expect(reserveRes.status).toBe(201);

			const res = await app.request("/api/tickets/has", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyer2Token}`,
				},
				body: JSON.stringify({
					event_ids: [event.id],
				}),
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data[event.id]).toBe(false);
		});

		test("should reject invalid event ids", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/tickets/has", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					event_ids: ["not-a-uuid"],
				}),
			});

			expect(res.status).toBe(400);
		});
	});

	describe("POST /api/tickets", () => {
		test("should reserve ticket successfully", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token, {
				ticket_quantity: 10,
				ticket_price: 5000,
			});

			const res = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					event_id: event.id,
				}),
			});

			expect(res.status).toBe(201);
			const data = await res.json();

			expectApiSuccess(data);
			expect(data.data.event_id).toBe(event.id);
			expectUUID(data.data.id);
			expectUUID(data.data.user_id);
		});

		test("should decrement ticket quantity", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token, {
				ticket_quantity: 10,
			});

			await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					event_id: event.id,
				}),
			});

			const eventRes = await app.request(`/api/events/${event.id}`);
			const eventData = await eventRes.json();

			expect(eventData.data.ticket_quantity).toBe(9);
		});

		test("should reject when event is sold out", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token, {
				ticket_quantity: 1,
			});

			await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					event_id: event.id,
				}),
			});

			const res = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					event_id: event.id,
				}),
			});

			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.error).toContain("No tickets available");
		});

		test("should reject non-existent event", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					event_id: "550e8400-e29b-41d4-a716-446655440000",
				}),
			});

			expect(res.status).toBe(404);
		});

		test("should require authentication", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token);

			const res = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					event_id: event.id,
				}),
			});

			expect(res.status).toBe(401);
		});

		test("should handle concurrent bookings (race condition)", async () => {
			const { token: token1 } = await createTestUser();
			const { token: token2 } = await createTestUser();
			const event = await createTestEvent(token1, {
				ticket_quantity: 1,
			});

			const [res1, res2] = await Promise.all([
				app.request("/api/tickets", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token1}`,
					},
					body: JSON.stringify({ event_id: event.id }),
				}),
				app.request("/api/tickets", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token2}`,
					},
					body: JSON.stringify({ event_id: event.id }),
				}),
			]);

			const statuses = [res1.status, res2.status].sort();
			expect(statuses).toEqual([201, 400]);
		});

		test("should allow multiple users to book different tickets", async () => {
			const { token: organizer } = await createTestUser();
			const { token: buyer1 } = await createTestUser();
			const { token: buyer2 } = await createTestUser();

			const event = await createTestEvent(organizer, {
				ticket_quantity: 5,
			});

			const res1 = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyer1}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const res2 = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyer2}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			expect(res1.status).toBe(201);
			expect(res2.status).toBe(201);

			const eventRes = await app.request(`/api/events/${event.id}`);
			const eventData = await eventRes.json();
			expect(eventData.data.ticket_quantity).toBe(3);
		});

		test("should allow user to book multiple tickets for different events", async () => {
			const { token } = await createTestUser();
			const event1 = await createTestEvent(token);
			const event2 = await createTestEvent(token);

			const res1 = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ event_id: event1.id }),
			});

			const res2 = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ event_id: event2.id }),
			});

			expect(res1.status).toBe(201);
			expect(res2.status).toBe(201);
		});
	});

	describe("GET /api/tickets", () => {
		test("should return user's tickets with pagination", async () => {
			const { token } = await createTestUser();

			for (let i = 0; i < 3; i++) {
				const event = await createTestEvent(token);
				await app.request("/api/tickets", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ event_id: event.id }),
				});
			}

			const res = await app.request("/api/tickets?page=1&limit=10", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(res.status).toBe(200);
			const data = await res.json();

			expectPaginationResponse(data);
			expect(data.data.length).toBe(3);
			expect(data.data[0].event).toBeDefined();
			expect(data.data[0].event.title).toBeDefined();
		});

		test("should return only user's own tickets", async () => {
			const { token: token1 } = await createTestUser();
			const { token: token2 } = await createTestUser();

			const event = await createTestEvent(token1, {
				ticket_quantity: 10,
			});

			await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token1}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token2}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const res = await app.request("/api/tickets", {
				headers: {
					Authorization: `Bearer ${token1}`,
				},
			});

			const data = await res.json();
			expect(data.data.length).toBe(1);
		});

		test("should return empty array when user has no tickets", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/tickets", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.data).toEqual([]);
		});

		test("should require authentication", async () => {
			const res = await app.request("/api/tickets");

			expect(res.status).toBe(401);
		});

		test("should respect pagination parameters", async () => {
			const { token } = await createTestUser();

			for (let i = 0; i < 5; i++) {
				const event = await createTestEvent(token);
				await app.request("/api/tickets", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ event_id: event.id }),
				});
			}

			const res = await app.request("/api/tickets?page=1&limit=3", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();
			expect(data.data.length).toBe(3);
			expect(data.pagination.limit).toBe(3);
			expect(data.pagination.total).toBe(5);
		});

		test("should include event details in response", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token, {
				title: "Special Concert",
				location: "Special Venue",
			});

			await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const res = await app.request("/api/tickets", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();
			expect(data.data[0].event.title).toBe("Special Concert");
			expect(data.data[0].event.location).toBe("Special Venue");
		});
	});

	describe("GET /api/tickets/search", () => {
		test("should search user's tickets by event title", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token, {
				title: "Jazz Festival",
			});

			await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const res = await app.request("/api/tickets/search?q=Jazz", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expectApiSuccess(data);
			expect(data.data.length).toBe(1);
			expect(data.data[0].event.title).toBe("Jazz Festival");
		});

		test("should require authentication", async () => {
			const res = await app.request("/api/tickets/search?q=test");
			expect(res.status).toBe(401);
		});
	});

	describe("DELETE /api/tickets/:id", () => {
		test("should allow ticket owner to delete ticket", async () => {
			const { token } = await createTestUser();
			const event = await createTestEvent(token, {
				ticket_quantity: 10,
			});

			const ticketRes = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const ticketData = await ticketRes.json();
			const ticketId = ticketData.data.id;

			const res = await app.request(`/api/tickets/${ticketId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(res.status).toBe(200);
			const eventRes = await app.request(`/api/events/${event.id}`);
			const eventData = await eventRes.json();
			expect(eventData.data.ticket_quantity).toBe(10);
		});

		test("should allow event owner to delete ticket", async () => {
			const { token: organizer } = await createTestUser();
			const { token: buyer } = await createTestUser();

			const event = await createTestEvent(organizer, {
				ticket_quantity: 10,
			});

			const ticketRes = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyer}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const ticketData = await ticketRes.json();
			const ticketId = ticketData.data.id;

			const res = await app.request(`/api/tickets/${ticketId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${organizer}`,
				},
			});

			expect(res.status).toBe(200);
		});

		test("should not allow unauthorized user to delete ticket", async () => {
			const { token: buyer } = await createTestUser();
			const { token: other } = await createTestUser();
			const event = await createTestEvent(buyer, {
				ticket_quantity: 10,
			});

			const ticketRes = await app.request("/api/tickets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${buyer}`,
				},
				body: JSON.stringify({ event_id: event.id }),
			});

			const ticketData = await ticketRes.json();
			const ticketId = ticketData.data.id;

			const res = await app.request(`/api/tickets/${ticketId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${other}`,
				},
			});

			expect(res.status).toBe(403);
		});

		test("should require authentication", async () => {
			const res = await app.request(
				"/api/tickets/550e8400-e29b-41d4-a716-446655440000",
				{
					method: "DELETE",
				},
			);

			expect(res.status).toBe(401);
		});
	});
});
