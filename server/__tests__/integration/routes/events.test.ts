import "../../setup/hooks";
import { beforeAll, describe, expect, test } from "bun:test";
import type { Hono } from "hono";
import {
	expectApiSuccess,
	expectPaginationResponse,
	expectUUID,
} from "../../helpers/assertions";
import { createTestUser } from "../../helpers/factories";

let app: Hono;

beforeAll(async () => {
	const module = await import("../../../src/index");
	app = module.default;
});

describe("Events Routes Integration", () => {
	describe("POST /api/events", () => {
		test("should create event with valid data", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Test Concert",
					description: "A great concert",
					date: "2025-12-31",
					location: "Stadium",
					ticket_quantity: 100,
					ticket_price: 5000,
				}),
			});

			expect(res.status).toBe(201);
			const data = await res.json();

			expectApiSuccess(data);
			expect(data.data.title).toBe("Test Concert");
			expect(data.data.description).toBe("A great concert");
			expect(data.data.location).toBe("Stadium");
			expect(data.data.ticket_quantity).toBe(100);
			expect(data.data.ticket_price).toBe(5000);
			expectUUID(data.data.id);
			expectUUID(data.data.user_id);
		});

		test("should require authentication", async () => {
			const res = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: "Test Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			expect(res.status).toBe(401);
		});

		test("should reject invalid ticket quantity", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Test Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: -5,
					ticket_price: 1000,
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should reject invalid ticket price", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Test Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: -100,
				}),
			});

			expect(res.status).toBe(400);
		});

		test("should accept free event (zero price)", async () => {
			const { token } = await createTestUser();

			const res = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Free Event",
					date: "2025-12-31",
					location: "Park",
					ticket_quantity: 100,
					ticket_price: 0,
				}),
			});

			expect(res.status).toBe(201);
		});
	});

	describe("GET /api/events", () => {
		test("should return paginated events", async () => {
			const { token } = await createTestUser();

			for (let i = 0; i < 5; i++) {
				await app.request("/api/events", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						title: `Event ${i + 1}`,
						date: "2025-12-31",
						location: "Venue",
						ticket_quantity: 50,
						ticket_price: 1000,
					}),
				});
			}

			const res = await app.request("/api/events?page=1&limit=3");

			expect(res.status).toBe(200);
			const data = await res.json();

			expectPaginationResponse(data);
			expect(data.data.length).toBeLessThanOrEqual(3);
			expect(data.pagination.page).toBe(1);
			expect(data.pagination.limit).toBe(3);
		});

		test("should filter events with available tickets", async () => {
			const { token } = await createTestUser();

			await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Available Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const res = await app.request("/api/events?available=true");

			expect(res.status).toBe(200);
			const data = await res.json();

			data.data.forEach((event: any) => {
				expect(event.ticket_quantity).toBeGreaterThan(0);
			});
		});

		test("should work without authentication", async () => {
			const res = await app.request("/api/events");

			expect(res.status).toBe(200);
			const data = await res.json();
			expectPaginationResponse(data);
		});

		test("should respect pagination limits", async () => {
			const res = await app.request("/api/events?page=1&limit=100");

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.pagination.limit).toBeLessThanOrEqual(100);
		});
	});

	describe("GET /api/events/:id", () => {
		test("should get event by ID", async () => {
			const { token } = await createTestUser();

			const createRes = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Specific Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const created = await createRes.json();
			const eventId = created.data.id;

			const res = await app.request(`/api/events/${eventId}`);

			expect(res.status).toBe(200);
			const data = await res.json();
			expectApiSuccess(data);
			expect(data.data.id).toBe(eventId);
			expect(data.data.title).toBe("Specific Event");
		});

		test("should return 404 for non-existent event", async () => {
			const res = await app.request(
				"/api/events/550e8400-e29b-41d4-a716-446655440000",
			);

			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/events/:id", () => {
		test("should update own event", async () => {
			const { token } = await createTestUser();

			const createRes = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Original Title",
					date: "2025-12-31",
					location: "Original Location",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const created = await createRes.json();
			const eventId = created.data.id;

			const res = await app.request(`/api/events/${eventId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Updated Title",
					location: "Updated Location",
				}),
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expectApiSuccess(data);
			expect(data.data.title).toBe("Updated Title");
			expect(data.data.location).toBe("Updated Location");
		});

		test("should not update other user's event", async () => {
			const { token: token1 } = await createTestUser();
			const { token: token2 } = await createTestUser();

			const createRes = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token1}`,
				},
				body: JSON.stringify({
					title: "User 1 Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const created = await createRes.json();
			const eventId = created.data.id;

			const res = await app.request(`/api/events/${eventId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token2}`,
				},
				body: JSON.stringify({
					title: "Hacked Title",
				}),
			});

			expect(res.status).toBe(403);
		});

		test("should require authentication", async () => {
			const { token } = await createTestUser();

			const createRes = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "Test Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const created = await createRes.json();
			const eventId = created.data.id;

			const res = await app.request(`/api/events/${eventId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: "Updated",
				}),
			});

			expect(res.status).toBe(401);
		});
	});

	describe("DELETE /api/events/:id", () => {
		test("should delete own event with no tickets sold", async () => {
			const { token } = await createTestUser();

			const createRes = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: "To Delete",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const created = await createRes.json();
			const eventId = created.data.id;

			const res = await app.request(`/api/events/${eventId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(res.status).toBe(200);

			const getRes = await app.request(`/api/events/${eventId}`);
			expect(getRes.status).toBe(404);
		});

		test("should not delete other user's event", async () => {
			const { token: token1 } = await createTestUser();
			const { token: token2 } = await createTestUser();

			const createRes = await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token1}`,
				},
				body: JSON.stringify({
					title: "User 1 Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const created = await createRes.json();
			const eventId = created.data.id;

			const res = await app.request(`/api/events/${eventId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token2}`,
				},
			});

			expect(res.status).toBe(403);
		});

		test("should return 404 for non-existent event", async () => {
			const { token } = await createTestUser();

			const res = await app.request(
				"/api/events/550e8400-e29b-41d4-a716-446655440000",
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			expect(res.status).toBe(404);
		});
	});

	describe("GET /api/events/my-events", () => {
		test("should return only user's own events", async () => {
			const { token: token1 } = await createTestUser();
			const { token: token2 } = await createTestUser();

			await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token1}`,
				},
				body: JSON.stringify({
					title: "User 1 Event 1",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token1}`,
				},
				body: JSON.stringify({
					title: "User 1 Event 2",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			await app.request("/api/events", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token2}`,
				},
				body: JSON.stringify({
					title: "User 2 Event",
					date: "2025-12-31",
					location: "Venue",
					ticket_quantity: 50,
					ticket_price: 1000,
				}),
			});

			const res = await app.request("/api/events/my-events", {
				headers: {
					Authorization: `Bearer ${token1}`,
				},
			});

			expect(res.status).toBe(200);
			const data = await res.json();
			expectPaginationResponse(data);
			expect(data.data.length).toBe(2);
			expect(data.data.every((e: any) => e.title.startsWith("User 1"))).toBe(
				true,
			);
		});

		test("should require authentication", async () => {
			const res = await app.request("/api/events/my-events");

			expect(res.status).toBe(401);
		});
	});
});
